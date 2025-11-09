"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { RUTAS_QUERY, RUTAS_POR_ESTADO_QUERY, RUTAS_POR_REPARTIDOR_QUERY } from "@/graphql/queries/rutas";
import { CREAR_RUTA_MUTATION, ASIGNAR_PEDIDOS_A_RUTA_MUTATION, REMOVER_PEDIDO_DE_RUTA_MUTATION, ACTUALIZAR_ESTADO_RUTA_MUTATION, DESACTIVAR_RUTA_MUTATION } from "@/graphql/mutations/rutas";
import { USUARIOS_ACTIVOS_POR_ROL_QUERY } from "@/graphql/queries/usuarios";
import { PEDIDOS_POR_ESTADO_QUERY } from "@/graphql/queries/pedidos";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  activo: boolean;
}

interface Cliente {
  id: string;
  nombre: string;
}

interface Pedido {
  id: string;
  cliente: Cliente;
  estado: string;
  total: number;
  direccionEntrega: string;
}

interface RutaEntrega {
  id: string;
  repartidor: Usuario;
  estado: string;
  fechaRuta: string;
  distanciaTotalKm?: number;
  tiempoEstimadoMin?: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
  pedidos: Pedido[];
}

interface RutaEntregaPage {
  content: RutaEntrega[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

const ESTADOS_RUTA = [
  { value: "PLANIFICADA", label: "Planificada", color: "bg-gray-100 text-gray-600" },
  { value: "EN_CURSO", label: "En Curso", color: "bg-gray-100 text-gray-600" },
  { value: "COMPLETADA", label: "Completada", color: "bg-gray-100 text-gray-600" },
  { value: "CANCELADA", label: "Cancelada", color: "bg-gray-100 text-gray-600" }
];

export default function RoutesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [data, setData] = useState<RutaEntregaPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [filterRepartidor, setFilterRepartidor] = useState<string>("");

  // ADMIN form state
  const isAdmin = user?.rol === "ADMIN";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [repartidores, setRepartidores] = useState<Usuario[]>([]);
  const [pedidosDisponibles, setPedidosDisponibles] = useState<Pedido[]>([]);
  const [form, setForm] = useState({
    repartidorId: "",
    fechaRuta: new Date().toISOString().split('T')[0],
    distanciaTotalKm: 0,
    tiempoEstimadoMin: 0,
    pedidosIds: [] as string[]
  });

  // Assign pedidos state
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState<RutaEntrega | null>(null);
  const [assignPedidosIds, setAssignPedidosIds] = useState<string[]>([]);

  const fetchPage = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      let query = RUTAS_QUERY;
      let variables: any = { page: p, size };

      // Si es REPARTIDOR, solo ver sus propias rutas
      if (user?.rol === "REPARTIDOR") {
        query = RUTAS_POR_REPARTIDOR_QUERY;
        variables.repartidorId = user.id;
      } else if (filterRepartidor) {
        query = RUTAS_POR_REPARTIDOR_QUERY;
        variables.repartidorId = filterRepartidor;
      } else if (filterEstado) {
        query = RUTAS_POR_ESTADO_QUERY;
        variables.estado = filterEstado;
      }

      const { data } = await apolloClient.query({
        query,
        variables,
        fetchPolicy: "network-only"
      });

      if (user?.rol === "REPARTIDOR" || filterRepartidor) {
        setData((data as any).rutasPorRepartidor);
      } else if (filterEstado) {
        setData((data as any).rutasPorEstado);
      } else {
        setData((data as any).rutas);
      }
    } catch (err: any) {
      console.error("Error fetching routes:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "FORBIDDEN") {
        setError("No tienes permisos para ver las rutas");
      } else if (err.graphQLErrors?.[0]?.extensions?.code === "UNAUTHENTICATED") {
        logout();
        router.replace("/sign-in");
        return;
      } else {
        setError("Error al cargar las rutas");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRepartidores = async () => {
    try {
      const { data } = await apolloClient.query({
        query: USUARIOS_ACTIVOS_POR_ROL_QUERY,
        variables: { rol: "REPARTIDOR" },
        fetchPolicy: "network-only"
      });
      setRepartidores((data as any).usuariosActivosPorRol);
    } catch (err) {
      console.error("Error fetching repartidores:", err);
    }
  };

  const fetchPedidosDisponibles = async () => {
    try {
      // Obtener pedidos confirmados que no están en rutas
      const { data } = await apolloClient.query({
        query: PEDIDOS_POR_ESTADO_QUERY,
        variables: { estado: "EN_PROCESO", page: 0, size: 100 },
        fetchPolicy: "network-only"
      });
      setPedidosDisponibles((data as any).pedidosPorEstado.content);
    } catch (err) {
      console.error("Error fetching available orders:", err);
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
      fetchRepartidores();
      fetchPedidosDisponibles();
    }
  }, [isAuthenticated, checkAuth, router, filterEstado, filterRepartidor]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPage(page);
    }
  }, [page]);

  const handleFilterChange = (tipo: "estado" | "repartidor", valor: string) => {
    if (tipo === "estado") {
      setFilterEstado(valor);
      setFilterRepartidor("");
    } else {
      setFilterRepartidor(valor);
      setFilterEstado("");
    }
    setPage(0);
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      await apolloClient.mutate({
        mutation: CREAR_RUTA_MUTATION,
        variables: {
          input: {
            repartidorId: form.repartidorId,
            fechaRuta: form.fechaRuta,
            distanciaTotalKm: form.distanciaTotalKm || null,
            tiempoEstimadoMin: form.tiempoEstimadoMin || null,
            pedidosIds: form.pedidosIds.length > 0 ? form.pedidosIds : null
          }
        }
      });

      toast.success("Ruta creada exitosamente");
      setForm({
        repartidorId: "",
        fechaRuta: new Date().toISOString().split('T')[0],
        distanciaTotalKm: 0,
        tiempoEstimadoMin: 0,
        pedidosIds: []
      });
      setShowCreateForm(false);
      fetchPage(page);
    } catch (err: any) {
      console.error("Error creating route:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "BAD_REQUEST") {
        const errors = err.graphQLErrors[0].extensions.errors;
        toast.error(`Error de validación: ${errors?.join(", ") || "Datos inválidos"}`);
      } else {
        toast.error("Error al crear la ruta");
      }
    }
  };

  const startAssignPedidos = (ruta: RutaEntrega) => {
    setSelectedRuta(ruta);
    setAssignPedidosIds([]);
    setShowAssignForm(true);
  };

  const handleAssignPedidos = async () => {
    if (!isAdmin || !selectedRuta || assignPedidosIds.length === 0) return;

    try {
      await apolloClient.mutate({
        mutation: ASIGNAR_PEDIDOS_A_RUTA_MUTATION,
        variables: {
          input: {
            rutaId: selectedRuta.id,
            pedidosIds: assignPedidosIds
          }
        }
      });

      toast.success("Pedidos asignados exitosamente");
      setShowAssignForm(false);
      setSelectedRuta(null);
      setAssignPedidosIds([]);
      fetchPage(page);
      fetchPedidosDisponibles();
    } catch (err: any) {
      console.error("Error assigning orders:", err);
      toast.error("Error al asignar pedidos");
    }
  };

  const handleRemovePedido = async (rutaId: string, pedidoId: string) => {
    if (!isAdmin) return;

    try {
      await apolloClient.mutate({
        mutation: REMOVER_PEDIDO_DE_RUTA_MUTATION,
        variables: { rutaId, pedidoId }
      });

      toast.success("Pedido removido de la ruta");
      fetchPage(page);
      fetchPedidosDisponibles();
    } catch (err: any) {
      console.error("Error removing order from route:", err);
      toast.error("Error al remover pedido de la ruta");
    }
  };

  const handleUpdateEstado = async (rutaId: string, nuevoEstado: string) => {
    if (!isAdmin && user?.rol !== "REPARTIDOR") return;

    try {
      await apolloClient.mutate({
        mutation: ACTUALIZAR_ESTADO_RUTA_MUTATION,
        variables: { rutaId, estado: nuevoEstado }
      });

      toast.success("Estado de la ruta actualizado");
      fetchPage(page);
    } catch (err: any) {
      console.error("Error updating route status:", err);
      toast.error("Error al actualizar el estado de la ruta");
    }
  };

  const handleDesactivarRuta = async (rutaId: string) => {
    if (!isAdmin) return;

    try {
      await apolloClient.mutate({
        mutation: DESACTIVAR_RUTA_MUTATION,
        variables: { rutaId }
      });

      toast.success("Ruta desactivada exitosamente");
      fetchPage(page);
    } catch (err: any) {
      console.error("Error deactivating route:", err);
      toast.error("Error al desactivar la ruta");
    }
  };

  const getEstadoConfig = (estado: string) => {
    return ESTADOS_RUTA.find(e => e.value === estado) || ESTADOS_RUTA[0];
  };

  const togglePedidoSelection = (pedidoId: string, isFormPedidos = false) => {
    if (isFormPedidos) {
      setForm({
        ...form,
        pedidosIds: form.pedidosIds.includes(pedidoId)
          ? form.pedidosIds.filter(id => id !== pedidoId)
          : [...form.pedidosIds, pedidoId]
      });
    } else {
      setAssignPedidosIds(
        assignPedidosIds.includes(pedidoId)
          ? assignPedidosIds.filter(id => id !== pedidoId)
          : [...assignPedidosIds, pedidoId]
      );
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Rutas de Entrega</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Volver
          </button>
          <Button
            onClick={() => { logout(); router.replace("/sign-in"); }}
            className="px-4 py-2 border hover:bg-gray-50"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Filters - Solo para ADMIN */}
      {isAdmin && (
        <div className="mb-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange("estado", "")}
              className={`px-3 py-1 rounded text-sm ${
                filterEstado === "" && filterRepartidor === "" ? "bg-black text-white" : "border hover:bg-gray-50"
              }`}
            >
              Todas
            </button>
            {ESTADOS_RUTA.map((estado) => (
              <button
                key={estado.value}
                onClick={() => handleFilterChange("estado", estado.value)}
                className={`px-3 py-1 rounded text-sm ${
                  filterEstado === estado.value ? "bg-black text-white" : "border hover:bg-gray-50"
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Filtrar por repartidor:</label>
            <select
              value={filterRepartidor}
              onChange={(e) => handleFilterChange("repartidor", e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="">Todos los repartidores</option>
              {repartidores.map((repartidor) => (
                <option key={repartidor.id} value={repartidor.id}>
                  {repartidor.nombreCompleto}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ADMIN Create Button */}
      {isAdmin && (
        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-black text-white hover:bg-gray-900">
            {showCreateForm ? "Cancelar" : "Crear Ruta"}
          </Button>
        </div>
      )}

      {/* ADMIN Create Form */}
      {isAdmin && showCreateForm && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nueva Ruta</h2>
          <form onSubmit={handleCreateRoute} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-900">Repartidor</Label>
                <select
                  value={form.repartidorId}
                  onChange={(e) => setForm({ ...form, repartidorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                >
                  <option value="">Seleccionar repartidor</option>
                  {repartidores.map((repartidor) => (
                    <option key={repartidor.id} value={repartidor.id}>
                      {repartidor.nombreCompleto} - {repartidor.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-900">Fecha de ruta</Label>
                <Input
                  type="date"
                  value={form.fechaRuta}
                  onChange={(e) => setForm({ ...form, fechaRuta: e.target.value })}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-900">Distancia total (km) - opcional</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.distanciaTotalKm || ""}
                  onChange={(e) => setForm({ ...form, distanciaTotalKm: parseFloat(e.target.value) || 0 })}
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-900">Tiempo estimado (min) - opcional</Label>
                <Input
                  type="number"
                  value={form.tiempoEstimadoMin || ""}
                  onChange={(e) => setForm({ ...form, tiempoEstimadoMin: parseInt(e.target.value) || 0 })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Pedidos disponibles */}
            {pedidosDisponibles.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Pedidos disponibles (opcional):</h3>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
                  {pedidosDisponibles.map((pedido) => (
                    <label key={pedido.id} className="flex items-center gap-2 p-1 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={form.pedidosIds.includes(pedido.id)}
                        onChange={() => togglePedidoSelection(pedido.id, true)}
                      />
                      <span className="text-sm">
                        #{pedido.id} - {pedido.cliente.nombre} - ${pedido.total} - {pedido.direccionEntrega}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="px-5 py-2 bg-black text-white hover:bg-gray-900">
              Crear Ruta
            </Button>
          </form>
        </div>
      )}

      {/* Assign Pedidos Modal */}
      {isAdmin && showAssignForm && selectedRuta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="assign-pedidos-title">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 id="assign-pedidos-title" className="text-lg font-medium">
                Asignar Pedidos a Ruta #{selectedRuta.id}
              </h2>
              <button
                onClick={() => {
                  setShowAssignForm(false);
                  setSelectedRuta(null);
                  setAssignPedidosIds([]);
                }}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
            
            {pedidosDisponibles.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto border rounded p-2">
                  {pedidosDisponibles.map((pedido) => (
                    <label key={pedido.id} className="flex items-center gap-2 p-2 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={assignPedidosIds.includes(pedido.id)}
                        onChange={() => togglePedidoSelection(pedido.id)}
                      />
                      <div className="text-sm">
                        <div className="font-medium">#{pedido.id} - {pedido.cliente.nombre}</div>
                        <div className="text-gray-600">{formatCurrency(pedido.total)} - {pedido.direccionEntrega}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleAssignPedidos}
                  disabled={assignPedidosIds.length === 0}
                  className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50"
                >
                  Asignar {assignPedidosIds.length} Pedido(s)
                </button>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-600">No hay pedidos disponibles para asignar</p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {loading && <p className="text-center py-4">Cargando rutas...</p>}
      {error && <p className="text-center py-4 text-red-600">{error}</p>}
      
      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Repartidor</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Fecha Ruta</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Distancia</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tiempo Est.</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Pedidos</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((ruta) => {
                  const estadoConfig = getEstadoConfig(ruta.estado);
                  const totalPedidos = ruta.pedidos.reduce((sum, p) => sum + p.total, 0);
                  return (
                    <tr key={ruta.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">#{ruta.id}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <div className="font-medium">{ruta.repartidor.nombreCompleto}</div>
                          <div className="text-sm text-gray-500">{ruta.repartidor.email}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${estadoConfig.color}`}>
                          {estadoConfig.label}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {format(new Date(ruta.fechaRuta), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ruta.distanciaTotalKm ? `${ruta.distanciaTotalKm} km` : "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ruta.tiempoEstimadoMin ? `${ruta.tiempoEstimadoMin} min` : "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="text-sm">
                          <div className="font-medium">{ruta.pedidos.length} pedidos</div>
                          <div className="text-gray-600">{formatCurrency(totalPedidos)}</div>
                          {ruta.pedidos.map((pedido, idx) => (
                            <div key={idx} className="text-xs">
                              #{pedido.id} - {pedido.cliente.nombre}
                              {isAdmin && ruta.estado === "PLANIFICADA" && (
                                <Button
                                  onClick={() => handleRemovePedido(ruta.id, pedido.id)}
                                  className="ml-1 px-1 text-xs border hover:bg-gray-100"
                                  title="Remover pedido"
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex flex-col gap-1">
                          {/* Cambiar estado - ADMIN y REPARTIDOR */}
                          {(isAdmin || (user?.rol === "REPARTIDOR" && ruta.repartidor.id === user.id)) && 
                           ruta.estado !== "CANCELADA" && ruta.estado !== "COMPLETADA" && (
                            <select
                              value={ruta.estado}
                              onChange={(e) => handleUpdateEstado(ruta.id, e.target.value)}
                              className="px-2 py-1 text-xs border rounded"
                            >
                              {ESTADOS_RUTA.filter(e => e.value !== "CANCELADA").map((estado) => (
                                <option key={estado.value} value={estado.value}>
                                  {estado.label}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {/* Acciones ADMIN */}
                          {isAdmin && (
                            <>
                              {ruta.estado === "PLANIFICADA" && (
                                <Button
                                  onClick={() => startAssignPedidos(ruta)}
                                  className="px-2 py-1 text-xs border hover:bg-gray-100"
                                >
                                  Asignar Pedidos
                                </Button>
                              )}
                              {ruta.activo && ruta.estado !== "COMPLETADA" && (
                                <Button
                                  onClick={() => handleDesactivarRuta(ruta.id)}
                                  className="px-2 py-1 text-xs border hover:bg-gray-100"
                                >
                                  Desactivar
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {data.content.length} de {data.totalElements} rutas
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
