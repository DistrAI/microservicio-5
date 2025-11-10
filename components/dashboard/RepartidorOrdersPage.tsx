"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { PEDIDOS_REPARTIDOR_QUERY } from "@/graphql/queries/dashboard-repartidor";
import { ACTUALIZAR_ESTADO_PEDIDO_MUTATION } from "@/graphql/mutations/pedidos";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  latitudCliente?: number;
  longitudCliente?: number;
  referenciaDireccion?: string;
}

interface ItemPedido {
  id: string;
  producto: {
    id: string;
    nombre: string;
    sku: string;
  };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface PedidoRepartidor {
  id: string;
  cliente: Cliente;
  estado: string;
  total: number;
  direccionEntrega: string;
  observaciones?: string;
  fechaEntrega?: string;
  fechaPedido: string;
  fechaActualizacion?: string;
  items: ItemPedido[];
}

interface RutaConPedidos {
  id: string;
  estado: string;
  fechaRuta: string;
  pedidos: PedidoRepartidor[];
}

const ESTADOS_PEDIDO = [
  { value: "PENDIENTE", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "EN_PROCESO", label: "En Proceso", color: "bg-blue-100 text-blue-800" },
  { value: "EN_CAMINO", label: "En Camino", color: "bg-purple-100 text-purple-800" },
  { value: "ENTREGADO", label: "Entregado", color: "bg-green-100 text-green-800" },
  { value: "CANCELADO", label: "Cancelado", color: "bg-red-100 text-red-800" }
];

export default function RepartidorOrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [rutas, setRutas] = useState<RutaConPedidos[]>([]);
  const [pedidos, setPedidos] = useState<PedidoRepartidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("");

  const fetchPedidosRepartidor = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const { data } = await apolloClient.query({
        query: PEDIDOS_REPARTIDOR_QUERY,
        variables: { repartidorId: user.id },
        fetchPolicy: "network-only"
      });

      const rutasData = (data as any).rutasPorRepartidor?.content || [];
      setRutas(rutasData);

      // Extraer todos los pedidos de todas las rutas
      const todosPedidos: PedidoRepartidor[] = [];
      rutasData.forEach((ruta: any) => {
        ruta.pedidos.forEach((pedido: any) => {
          todosPedidos.push({
            ...pedido,
            rutaId: ruta.id,
            rutaEstado: ruta.estado,
            fechaRuta: ruta.fechaRuta
          });
        });
      });

      setPedidos(todosPedidos);
    } catch (err: any) {
      console.error("Error fetching repartidor orders:", err);
      setError("Error al cargar tus pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPedidosRepartidor();
    }
  }, [user?.id]);

  const handleUpdateEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      await apolloClient.mutate({
        mutation: ACTUALIZAR_ESTADO_PEDIDO_MUTATION,
        variables: {
          id: pedidoId,
          estado: nuevoEstado
        }
      });
      toast.success("Estado del pedido actualizado");
      fetchPedidosRepartidor();
    } catch (err: any) {
      console.error("Error updating order status:", err);
      toast.error("Error al actualizar el estado del pedido");
    }
  };

  const getEstadoConfig = (estado: string) => {
    return ESTADOS_PEDIDO.find(e => e.value === estado) || ESTADOS_PEDIDO[0];
  };

  const filteredPedidos = filterEstado 
    ? pedidos.filter(p => p.estado === filterEstado)
    : pedidos;

  const pedidosPendientes = pedidos.filter(p => p.estado === "PENDIENTE" || p.estado === "EN_PROCESO");
  const pedidosEnCamino = pedidos.filter(p => p.estado === "EN_CAMINO");
  const pedidosEntregados = pedidos.filter(p => p.estado === "ENTREGADO");

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Mis Pedidos</h1>
          <p className="text-gray-600">Pedidos asignados a {user?.nombreCompleto}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Volver
          </button>
          <Button
            onClick={fetchPedidosRepartidor}
            className="px-4 py-2 border hover:bg-gray-50"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{pedidosPendientes.length}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{pedidosEnCamino.length}</div>
          <div className="text-sm text-gray-600">En Camino</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{pedidosEntregados.length}</div>
          <div className="text-sm text-gray-600">Entregados</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterEstado("")}
          className={`px-3 py-1 rounded text-sm ${
            filterEstado === "" ? "bg-black text-white" : "border hover:bg-gray-50"
          }`}
        >
          Todos ({pedidos.length})
        </button>
        {ESTADOS_PEDIDO.map((estado) => {
          const count = pedidos.filter(p => p.estado === estado.value).length;
          return (
            <button
              key={estado.value}
              onClick={() => setFilterEstado(estado.value)}
              className={`px-3 py-1 rounded text-sm ${
                filterEstado === estado.value ? "bg-black text-white" : "border hover:bg-gray-50"
              }`}
            >
              {estado.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      {loading && <p className="text-center py-8">Cargando tus pedidos...</p>}
      {error && <p className="text-center py-8 text-red-600">{error}</p>}
      
      {!loading && !error && filteredPedidos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos asignados</h3>
          <p className="text-gray-600">
            {filterEstado ? `No hay pedidos con estado "${ESTADOS_PEDIDO.find(e => e.value === filterEstado)?.label}"` : "Aún no tienes pedidos asignados en ninguna ruta"}
          </p>
        </div>
      )}

      {filteredPedidos.length > 0 && (
        <div className="space-y-4">
          {filteredPedidos.map((pedido) => {
            const estadoConfig = getEstadoConfig(pedido.estado);
            return (
              <div key={pedido.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoConfig.color}`}>
                        {estadoConfig.label}
                      </span>
                      <span className="text-sm text-gray-500">Pedido #{pedido.id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{pedido.cliente.nombre}</h3>
                    <p className="text-gray-600">{pedido.cliente.email}</p>
                    {pedido.cliente.telefono && (
                      <p className="text-blue-600">📞 {pedido.cliente.telefono}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(pedido.total)}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(pedido.fechaPedido), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dirección de Entrega</h4>
                    <p className="text-gray-600">{pedido.direccionEntrega}</p>
                    {pedido.cliente.referenciaDireccion && (
                      <p className="text-sm text-gray-500 mt-1">
                        📍 Referencia: {pedido.cliente.referenciaDireccion}
                      </p>
                    )}
                    {pedido.cliente.latitudCliente && pedido.cliente.longitudCliente && (
                      <p className="text-sm text-blue-600 mt-1">
                        🗺️ GPS: {pedido.cliente.latitudCliente.toFixed(6)}, {pedido.cliente.longitudCliente.toFixed(6)}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Productos</h4>
                    <div className="space-y-1">
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.producto.nombre} x{item.cantidad}</span>
                          <span>{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {pedido.observaciones && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-1">Observaciones</h4>
                    <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">{pedido.observaciones}</p>
                  </div>
                )}

                {/* Acciones del repartidor */}
                {pedido.estado !== "CANCELADO" && pedido.estado !== "ENTREGADO" && (
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <span className="text-sm text-gray-600">Cambiar estado:</span>
                    <select
                      value={pedido.estado}
                      onChange={(e) => handleUpdateEstado(pedido.id, e.target.value)}
                      className="px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ESTADOS_PEDIDO.filter(e => e.value !== "CANCELADO").map((estado) => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {pedido.estado === "ENTREGADO" && (
                  <div className="flex items-center gap-2 pt-4 border-t text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Pedido entregado exitosamente</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
