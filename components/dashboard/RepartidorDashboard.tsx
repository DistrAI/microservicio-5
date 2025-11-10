"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { apolloClient } from "@/lib/apollo-client";
import { 
  DASHBOARD_REPARTIDOR_STATS_QUERY, 
  PEDIDOS_REPARTIDOR_QUERY,
  RENDIMIENTO_REPARTIDOR_QUERY 
} from "@/graphql/queries/dashboard-repartidor";
import Link from "next/link";
import KPICard from "@/components/dashboard/KPICard";
import SimpleChart from "@/components/dashboard/SimpleChart";
import { format, isToday, isThisWeek, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface RepartidorStats {
  rutasAsignadas: number;
  rutasCompletadas: number;
  rutasEnProceso: number;
  pedidosEntregados: number;
  pedidosPendientes: number;
  distanciaRecorrida: number;
  tiempoPromedio: number;
  ventasGeneradas: number;
}

interface PedidoRepartidor {
  id: string;
  cliente: {
    id: string;
    nombre: string;
    telefono?: string;
    direccion?: string;
    latitudCliente?: number;
    longitudCliente?: number;
    referenciaDireccion?: string;
  };
  estado: string;
  total: number;
  direccionEntrega: string;
  observaciones?: string;
  fechaEntrega?: string;
  fechaPedido: string;
  items: Array<{
    id: string;
    producto: {
      nombre: string;
      sku: string;
    };
    cantidad: number;
  }>;
}

export default function RepartidorDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<RepartidorStats | null>(null);
  const [pedidosHoy, setPedidosHoy] = useState<PedidoRepartidor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepartidorData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch stats del repartidor
      const { data: statsData } = await apolloClient.query({
        query: DASHBOARD_REPARTIDOR_STATS_QUERY,
        variables: { repartidorId: user.id },
        fetchPolicy: "network-only"
      });

      // Fetch pedidos del repartidor
      const { data: pedidosData } = await apolloClient.query({
        query: PEDIDOS_REPARTIDOR_QUERY,
        variables: { repartidorId: user.id },
        fetchPolicy: "network-only"
      });

      // Fetch rendimiento del repartidor
      const { data: rendimientoData } = await apolloClient.query({
        query: RENDIMIENTO_REPARTIDOR_QUERY,
        variables: { repartidorId: user.id },
        fetchPolicy: "network-only"
      });

      // Procesar datos de rutas
      const rutas = (statsData as any).rutasPorRepartidor?.content || [];
      const rutasActivas = rutas.filter((ruta: any) => ruta.estado === "ACTIVA" || ruta.estado === "EN_PROCESO");
      const rutasCompletadas = rutas.filter((ruta: any) => ruta.estado === "COMPLETADA");

      // Procesar todos los pedidos del repartidor
      const todosPedidos: PedidoRepartidor[] = [];
      rutas.forEach((ruta: any) => {
        ruta.pedidos.forEach((pedido: any) => {
          todosPedidos.push({
            id: pedido.id,
            cliente: pedido.cliente,
            estado: pedido.estado,
            total: pedido.total,
            direccionEntrega: pedido.direccionEntrega,
            observaciones: pedido.observaciones,
            fechaEntrega: pedido.fechaEntrega,
            fechaPedido: pedido.fechaPedido,
            items: pedido.items || []
          });
        });
      });

      // Filtrar pedidos de hoy
      const pedidosDeHoy = todosPedidos.filter(pedido => {
        const fechaPedido = new Date(pedido.fechaPedido);
        return isToday(fechaPedido) || (pedido.fechaEntrega && isToday(new Date(pedido.fechaEntrega)));
      });

      // Calcular estadísticas
      const pedidosEntregados = todosPedidos.filter(p => p.estado === "ENTREGADO");
      const pedidosPendientes = todosPedidos.filter(p => 
        p.estado === "PENDIENTE" || p.estado === "EN_PROCESO" || p.estado === "EN_CAMINO"
      );

      const distanciaTotal = rutas.reduce((sum: number, ruta: any) => sum + (ruta.distanciaTotalKm || 0), 0);
      const ventasTotal = pedidosEntregados.reduce((sum: number, pedido: any) => sum + pedido.total, 0);

      // Calcular tiempo promedio de entrega
      const tiempoPromedio = pedidosEntregados.length > 0 
        ? pedidosEntregados.reduce((sum: number, pedido: any) => {
            const fechaPedido = new Date(pedido.fechaPedido);
            const fechaEntrega = new Date(pedido.fechaActualizacion || pedido.fechaPedido);
            const diffHours = Math.abs(fechaEntrega.getTime() - fechaPedido.getTime()) / (1000 * 60 * 60);
            return sum + diffHours;
          }, 0) / pedidosEntregados.length
        : 0;

      const processedStats: RepartidorStats = {
        rutasAsignadas: rutas.length,
        rutasCompletadas: rutasCompletadas.length,
        rutasEnProceso: rutasActivas.length,
        pedidosEntregados: pedidosEntregados.length,
        pedidosPendientes: pedidosPendientes.length,
        distanciaRecorrida: Math.round(distanciaTotal * 10) / 10,
        tiempoPromedio: Math.round(tiempoPromedio),
        ventasGeneradas: ventasTotal
      };

      setStats(processedStats);
      setPedidosHoy(pedidosDeHoy);
      
    } catch (error) {
      console.error("Error fetching repartidor data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRepartidorData();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Cargando tu dashboard...</div>
        </div>
      </div>
    );
  }

  // Datos para gráficos
  const estadoPedidosData = {
    labels: ["Pendientes", "En Camino", "Entregados"],
    values: [
      stats?.pedidosPendientes || 0,
      pedidosHoy.filter(p => p.estado === "EN_CAMINO").length,
      stats?.pedidosEntregados || 0
    ],
    colors: ["#F59E0B", "#8B5CF6", "#10B981"]
  };

  const rendimientoSemanalData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    values: [8, 12, 10, 15, 9, 6, 4] // Mock data - en producción vendría de la base de datos
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Panel del Repartidor - {user?.nombreCompleto}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/routes" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Mis Rutas</Link>
          <Button
            onClick={fetchRepartidorData}
            className="px-4 py-2 border hover:bg-gray-50"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs del Repartidor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Pedidos Entregados"
          value={stats?.pedidosEntregados || 0}
          subtitle="Total completados"
          trend={{ value: 8.2, isPositive: true }}
          color="green"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KPICard
          title="Pedidos Pendientes"
          value={stats?.pedidosPendientes || 0}
          subtitle="Por entregar"
          color="yellow"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KPICard
          title="Distancia Recorrida"
          value={`${stats?.distanciaRecorrida || 0} km`}
          subtitle="Total acumulado"
          color="blue"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <KPICard
          title="Rutas Activas"
          value={stats?.rutasEnProceso || 0}
          subtitle="En proceso"
          color="purple"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          }
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SimpleChart
          title="Estado de Mis Pedidos"
          data={estadoPedidosData}
          type="doughnut"
          height={300}
        />

        <SimpleChart
          title="Entregas por Día (Esta Semana)"
          data={rendimientoSemanalData}
          type="bar"
          height={300}
        />
      </div>

      {/* Pedidos de Hoy */}
      <div className="bg-white p-6 rounded-lg border mb-8">
        <h3 className="text-lg font-semibold mb-4">Mis Pedidos de Hoy ({pedidosHoy.length})</h3>
        {pedidosHoy.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tienes pedidos programados para hoy</p>
        ) : (
          <div className="space-y-4">
            {pedidosHoy.slice(0, 5).map((pedido) => (
              <div key={pedido.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        pedido.estado === "ENTREGADO" ? "bg-green-100 text-green-800" :
                        pedido.estado === "EN_CAMINO" ? "bg-purple-100 text-purple-800" :
                        pedido.estado === "EN_PROCESO" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {pedido.estado.replace("_", " ")}
                      </span>
                      <h4 className="font-medium">{pedido.cliente.nombre}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{pedido.direccionEntrega}</p>
                    <p className="text-sm text-gray-500">
                      {pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''} - ${pedido.total.toLocaleString()}
                    </p>
                    {pedido.cliente.telefono && (
                      <p className="text-sm text-blue-600">📞 {pedido.cliente.telefono}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Link 
                      href={`/dashboard/orders/${pedido.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {pedidosHoy.length > 5 && (
              <div className="text-center">
                <Link 
                  href="/dashboard/orders"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver todos los pedidos ({pedidosHoy.length})
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones Rápidas para Repartidor */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/dashboard/routes" 
            className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🚚</div>
            <div className="font-medium">Mis Rutas</div>
          </Link>
          <Link 
            href="/dashboard/orders" 
            className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium">Mis Pedidos</div>
          </Link>
          <button 
            onClick={fetchRepartidorData}
            className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-medium">Actualizar</div>
          </button>
          <Link 
            href="/dashboard/empresa/ubicacion" 
            className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📍</div>
            <div className="font-medium">Ubicaciones</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
