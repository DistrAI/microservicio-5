"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { RUTAS_POR_REPARTIDOR_QUERY } from "@/graphql/queries/rutas";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

interface Cliente {
  id: string;
  nombre: string;
}

interface PedidoRuta {
  id: string;
  cliente: Cliente;
  estado: string;
  total: number;
  direccionEntrega: string;
}

interface RutaRepartidor {
  id: string;
  estado: string;
  fechaRuta: string;
  distanciaTotalKm: number;
  tiempoEstimadoMin: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
  pedidos: PedidoRuta[];
}

interface RutaPage {
  content: RutaRepartidor[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

const ESTADOS_RUTA = [
  { value: "PENDIENTE", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "ACTIVA", label: "Activa", color: "bg-blue-100 text-blue-800" },
  { value: "EN_PROCESO", label: "En Proceso", color: "bg-purple-100 text-purple-800" },
  { value: "COMPLETADA", label: "Completada", color: "bg-green-100 text-green-800" },
  { value: "CANCELADA", label: "Cancelada", color: "bg-red-100 text-red-800" }
];

export default function RepartidorRoutesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [data, setData] = useState<RutaPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRutasRepartidor = async (p: number) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const { data } = await apolloClient.query({
        query: RUTAS_POR_REPARTIDOR_QUERY,
        variables: { repartidorId: user.id, page: p, size },
        fetchPolicy: "network-only"
      });

      setData((data as any).rutasPorRepartidor);
    } catch (err: any) {
      console.error("Error fetching repartidor routes:", err);
      setError("Error al cargar tus rutas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRutasRepartidor(0);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchRutasRepartidor(page);
    }
  }, [page, user?.id]);

  const getEstadoConfig = (estado: string) => {
    return ESTADOS_RUTA.find(e => e.value === estado) || ESTADOS_RUTA[0];
  };

  const calcularTotalRuta = (pedidos: PedidoRuta[]) => {
    return pedidos.reduce((total, pedido) => total + pedido.total, 0);
  };

  const rutasActivas = data?.content.filter(r => r.estado === "ACTIVA" || r.estado === "EN_PROCESO") || [];
  const rutasCompletadas = data?.content.filter(r => r.estado === "COMPLETADA") || [];
  const rutasPendientes = data?.content.filter(r => r.estado === "PENDIENTE") || [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Mis Rutas</h1>
          <p className="text-gray-600">Rutas asignadas a {user?.nombreCompleto}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Volver
          </button>
          <Button
            onClick={() => fetchRutasRepartidor(page)}
            className="px-4 py-2 border hover:bg-gray-50"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{rutasPendientes.length}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{rutasActivas.length}</div>
          <div className="text-sm text-gray-600">Activas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{rutasCompletadas.length}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>
      </div>

      {/* Contenido */}
      {loading && <p className="text-center py-8">Cargando tus rutas...</p>}
      {error && <p className="text-center py-8 text-red-600">{error}</p>}
      
      {!loading && !error && data && data.content.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🚚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes rutas asignadas</h3>
          <p className="text-gray-600">Aún no tienes rutas asignadas para entregar</p>
        </div>
      )}

      {data && data.content.length > 0 && (
        <>
          <div className="space-y-6">
            {data.content.map((ruta) => {
              const estadoConfig = getEstadoConfig(ruta.estado);
              const totalRuta = calcularTotalRuta(ruta.pedidos);
              
              return (
                <div key={ruta.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoConfig.color}`}>
                          {estadoConfig.label}
                        </span>
                        <span className="text-sm text-gray-500">Ruta #{ruta.id}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {format(new Date(ruta.fechaRuta), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRuta)}</div>
                      <div className="text-sm text-gray-500">{ruta.pedidos.length} pedidos</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Distancia Total</div>
                      <div className="font-semibold">{ruta.distanciaTotalKm.toFixed(1)} km</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Tiempo Estimado</div>
                      <div className="font-semibold">{Math.round(ruta.tiempoEstimadoMin)} min</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Creada</div>
                      <div className="font-semibold">
                        {format(new Date(ruta.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                    </div>
                  </div>

                  {/* Lista de pedidos */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Pedidos en esta ruta ({ruta.pedidos.length})</h4>
                    <div className="space-y-2">
                      {ruta.pedidos.map((pedido, idx) => (
                        <div key={pedido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600">#{idx + 1}</span>
                              <span className="font-medium">{pedido.cliente.nombre}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                pedido.estado === "ENTREGADO" ? "bg-green-100 text-green-800" :
                                pedido.estado === "EN_CAMINO" ? "bg-purple-100 text-purple-800" :
                                pedido.estado === "EN_PROCESO" ? "bg-blue-100 text-blue-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {pedido.estado.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{pedido.direccionEntrega}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(pedido.total)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  {ruta.estado === "ACTIVA" && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-2">
                      <div className="flex items-center gap-2 text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Ruta activa - Lista para comenzar entregas</span>
                      </div>
                    </div>
                  )}

                  {ruta.estado === "COMPLETADA" && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Ruta completada exitosamente</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          <div className="mt-8 flex items-center justify-between">
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
