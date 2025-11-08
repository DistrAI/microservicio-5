"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { PEDIDOS_QUERY, PEDIDOS_POR_ESTADO_QUERY } from "@/graphql/queries/pedidos";
import { CREAR_PEDIDO_MUTATION, ACTUALIZAR_ESTADO_PEDIDO_MUTATION, CANCELAR_PEDIDO_MUTATION } from "@/graphql/mutations/pedidos";
import { CLIENTES_ACTIVOS_QUERY } from "@/graphql/queries/clientes";
import { PRODUCTOS_QUERY } from "@/graphql/queries/productos";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Producto {
  id: string;
  nombre: string;
  sku: string;
  precio: number;
}

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

interface ItemPedido {
  id: string;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Pedido {
  id: string;
  cliente: Cliente;
  estado: string;
  total: number;
  direccionEntrega: string;
  observaciones?: string;
  fechaEntrega?: string;
  activo: boolean;
  fechaPedido: string;
  fechaActualizacion?: string;
  items: ItemPedido[];
}

interface PedidoPage {
  content: Pedido[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

interface ItemForm {
  productoId: string;
  cantidad: number;
}

const ESTADOS_PEDIDO = [
  { value: "PENDIENTE", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "EN_PROCESO", label: "En Proceso", color: "bg-blue-100 text-blue-800" },
  { value: "EN_CAMINO", label: "En Camino", color: "bg-purple-100 text-purple-800" },
  { value: "ENTREGADO", label: "Entregado", color: "bg-green-100 text-green-800" },
  { value: "CANCELADO", label: "Cancelado", color: "bg-red-100 text-red-800" }
];

export default function OrdersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [data, setData] = useState<PedidoPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("");

  // ADMIN form state
  const isAdmin = user?.rol === "ADMIN";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState({
    clienteId: "",
    direccionEntrega: "",
    observaciones: "",
    items: [] as ItemForm[]
  });

  const fetchPage = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      let query = PEDIDOS_QUERY;
      let variables: any = { page: p, size };

      if (filterEstado) {
        query = PEDIDOS_POR_ESTADO_QUERY;
        variables.estado = filterEstado;
      }

      const { data } = await apolloClient.query({
        query,
        variables,
        fetchPolicy: "network-only"
      });

      setData(filterEstado ? (data as any).pedidosPorEstado : (data as any).pedidos);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "FORBIDDEN") {
        setError("No tienes permisos para ver los pedidos");
      } else if (err.graphQLErrors?.[0]?.extensions?.code === "UNAUTHENTICATED") {
        logout();
        router.replace("/sign-in");
        return;
      } else {
        setError("Error al cargar los pedidos");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data } = await apolloClient.query({
        query: CLIENTES_ACTIVOS_QUERY,
        variables: { page: 0, size: 100 },
        fetchPolicy: "network-only"
      });
      setClientes((data as any).clientesActivos.content);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchProductos = async () => {
    try {
      const { data } = await apolloClient.query({
        query: PRODUCTOS_QUERY,
        variables: { page: 0, size: 100 },
        fetchPolicy: "network-only"
      });
      setProductos((data as any).productos.content.filter((p: any) => p.activo));
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    fetchPage(0);
    if (isAdmin) {
      fetchClientes();
      fetchProductos();
    }
  }, [isAuthenticated, checkAuth, router, filterEstado]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPage(page);
    }
  }, [page]);

  const handleFilterChange = (estado: string) => {
    setFilterEstado(estado);
    setPage(0);
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productoId: "", cantidad: 1 }]
    });
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: keyof ItemForm, value: string | number) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const calculateTotal = () => {
    return form.items.reduce((total, item) => {
      const producto = productos.find(p => p.id === item.productoId);
      const precio = producto?.precio || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (form.items.length === 0) {
      toast.error("Debe agregar al menos un item al pedido");
      return;
    }

    try {
      const items = form.items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad
        // precioUnitario se omite - el backend usa automáticamente el precio del producto
      }));

      await apolloClient.mutate({
        mutation: CREAR_PEDIDO_MUTATION,
        variables: {
          input: {
            clienteId: form.clienteId,
            direccionEntrega: form.direccionEntrega,
            observaciones: form.observaciones || null,
            items: items
          }
        }
      });

      toast.success("Pedido creado exitosamente");
      setForm({
        clienteId: "",
        direccionEntrega: "",
        observaciones: "",
        items: []
      });
      setShowCreateForm(false);
      fetchPage(page);
    } catch (err: any) {
      console.error("Error creating order:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "BAD_REQUEST") {
        const errors = err.graphQLErrors[0].extensions.errors;
        toast.error(`Error de validación: ${errors?.join(", ") || "Datos inválidos"}`);
      } else {
        toast.error("Error al crear el pedido");
      }
    }
  };

  const handleUpdateEstado = async (pedidoId: string, nuevoEstado: string) => {
    if (!isAdmin && user?.rol !== "REPARTIDOR") return;

    try {
      await apolloClient.mutate({
        mutation: ACTUALIZAR_ESTADO_PEDIDO_MUTATION,
        variables: {
          id: pedidoId,
          estado: nuevoEstado
        }
      });
      toast.success("Estado del pedido actualizado");
      fetchPage(page);
    } catch (err: any) {
      console.error("Error updating order status:", err);
      toast.error("Error al actualizar el estado del pedido");
    }
  };

  const handleCancelOrder = async (pedidoId: string) => {
    if (!isAdmin) return;

    const motivo = prompt("Motivo de cancelación (opcional):");
    
    try {
      await apolloClient.mutate({
        mutation: CANCELAR_PEDIDO_MUTATION,
        variables: {
          id: pedidoId,
          motivo: motivo || null
        }
      });
      toast.success("Pedido cancelado exitosamente");
      fetchPage(page);
    } catch (err: any) {
      console.error("Error canceling order:", err);
      toast.error("Error al cancelar el pedido");
    }
  };

  const getEstadoConfig = (estado: string) => {
    return ESTADOS_PEDIDO.find(e => e.value === estado) || ESTADOS_PEDIDO[0];
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            onClick={() => { logout(); router.replace("/sign-in"); }}
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => handleFilterChange("")}
          className={`px-3 py-1 rounded text-sm ${
            filterEstado === "" ? "bg-black text-white" : "border hover:bg-gray-50"
          }`}
        >
          Todos
        </button>
        {ESTADOS_PEDIDO.map((estado) => (
          <button
            key={estado.value}
            onClick={() => handleFilterChange(estado.value)}
            className={`px-3 py-1 rounded text-sm ${
              filterEstado === estado.value ? "bg-black text-white" : "border hover:bg-gray-50"
            }`}
          >
            {estado.label}
          </button>
        ))}
      </div>

      {/* ADMIN Create Button */}
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
          >
            {showCreateForm ? "Cancelar" : "Crear Pedido"}
          </button>
        </div>
      )}

      {/* ADMIN Create Form */}
      {isAdmin && showCreateForm && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nuevo Pedido</h2>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-900">Cliente</label>
                <select
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} - {cliente.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-900">Dirección de entrega</label>
                <input
                  type="text"
                  placeholder="Ej: Av. Siempre Viva 123"
                  value={form.direccionEntrega}
                  onChange={(e) => setForm({ ...form, direccionEntrega: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-900">Observaciones (opcional)</label>
              <textarea
                placeholder="Notas para el repartidor o consideraciones"
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                rows={2}
              />
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Items del Pedido</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-900"
                >
                  Agregar item
                </button>
              </div>
              
              {form.items.map((item, index) => {
                const selectedProduct = productos.find(p => p.id === item.productoId);
                const subtotal = selectedProduct ? selectedProduct.precio * item.cantidad : 0;
                
                return (
                  <div key={index} className="flex gap-3 items-start p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-gray-700">Producto</label>
                      <select
                        value={item.productoId}
                        onChange={(e) => updateItem(index, "productoId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        required
                      >
                        <option value="">Seleccionar producto...</option>
                        {productos.map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre} - ${producto.precio}
                          </option>
                        ))}
                      </select>
                      {selectedProduct && (
                        <div className="text-xs text-gray-600 mt-1">
                          Precio unitario: ${selectedProduct.precio} · Subtotal: ${subtotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <label className="text-xs text-gray-700 mb-1">Cantidad</label>
                      <input
                        type="number"
                        placeholder="1"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => updateItem(index, "cantidad", parseInt(e.target.value) || 1)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none"
                      title="Eliminar item"
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })}
              
              {form.items.length > 0 && (
                <div className="text-right font-medium">
                  Total estimado: ${calculateTotal().toFixed(2)}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-black text-white rounded hover:bg-gray-900"
            >
              Crear Pedido
            </button>
          </form>
        </div>
      )}

      {/* Content */}
      {loading && <p className="text-center py-4">Cargando pedidos...</p>}
      {error && <p className="text-center py-4 text-red-600">{error}</p>}
      
      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Dirección</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Fecha Pedido</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Items</th>
                  {(isAdmin || user?.rol === "REPARTIDOR") && <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {data.content.map((pedido) => {
                  const estadoConfig = getEstadoConfig(pedido.estado);
                  return (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">#{pedido.id}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <div className="font-medium">{pedido.cliente.nombre}</div>
                          <div className="text-sm text-gray-500">{pedido.cliente.email}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${estadoConfig.color}`}>
                          {estadoConfig.label}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        ${pedido.total.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{pedido.direccionEntrega}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {format(new Date(pedido.fechaPedido), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="text-sm">
                          {pedido.items.map((item, idx) => (
                            <div key={idx}>
                              {item.producto.nombre} x{item.cantidad}
                            </div>
                          ))}
                        </div>
                      </td>
                      {(isAdmin || user?.rol === "REPARTIDOR") && (
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex flex-col gap-1">
                            {pedido.estado !== "CANCELADO" && pedido.estado !== "ENTREGADO" && (
                              <select
                                value={pedido.estado}
                                onChange={(e) => handleUpdateEstado(pedido.id, e.target.value)}
                                className="px-2 py-1 text-xs border rounded"
                              >
                                {ESTADOS_PEDIDO.filter(e => e.value !== "CANCELADO").map((estado) => (
                                  <option key={estado.value} value={estado.value}>
                                    {estado.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            {isAdmin && pedido.estado !== "CANCELADO" && pedido.estado !== "ENTREGADO" && (
                              <button
                                onClick={() => handleCancelOrder(pedido.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {data.content.length} de {data.totalElements} pedidos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {page + 1} de {data.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                disabled={page >= data.totalPages - 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
