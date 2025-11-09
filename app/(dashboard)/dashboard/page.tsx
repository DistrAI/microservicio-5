"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { apolloClient } from "@/lib/apollo-client";
import { DASHBOARD_STATS_QUERY, VENTAS_MENSUALES_QUERY } from "@/graphql/queries/dashboard";
import Link from "next/link";
import KPICard from "@/components/dashboard/KPICard";
import SimpleChart from "@/components/dashboard/SimpleChart";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalPedidosEntregados: number;
  totalVentas: number;
  pedidosPendientes: number;
  pedidosEnProceso: number;
  pedidosEnCamino: number;
  rutasActivas: number;
  stockBajo: number;
  clientesActivos: number;
  productosActivos: number;
  tiempoPromedioEntrega: number;
  tasaSatisfaccion: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ventasMensuales, setVentasMensuales] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch main stats
      const { data: statsData } = await apolloClient.query({
        query: DASHBOARD_STATS_QUERY,
        fetchPolicy: "network-only"
      });

      // Fetch monthly sales
      const { data: ventasData } = await apolloClient.query({
        query: VENTAS_MENSUALES_QUERY,
        fetchPolicy: "network-only"
      });

      // Process stats
      const pedidosEntregados = (statsData as any).pedidosPorEstado?.content || [];
      const totalVentas = pedidosEntregados.reduce((sum: number, pedido: any) => sum + pedido.total, 0);
      
      // Calculate average delivery time (mock calculation)
      const tiempoPromedio = pedidosEntregados.length > 0 
        ? pedidosEntregados.reduce((sum: number, pedido: any) => {
            const fechaPedido = new Date(pedido.fechaPedido);
            const fechaEntrega = new Date(pedido.fechaActualizacion || pedido.fechaPedido);
            const diffHours = Math.abs(fechaEntrega.getTime() - fechaPedido.getTime()) / (1000 * 60 * 60);
            return sum + diffHours;
          }, 0) / pedidosEntregados.length
        : 0;

      const processedStats: DashboardStats = {
        totalPedidosEntregados: (statsData as any).pedidosPorEstado?.totalElements || 0,
        totalVentas,
        pedidosPendientes: (statsData as any).pedidosPendientes?.totalElements || 0,
        pedidosEnProceso: (statsData as any).pedidosEnProceso?.totalElements || 0,
        pedidosEnCamino: (statsData as any).pedidosEnCamino?.totalElements || 0,
        rutasActivas: (statsData as any).rutasActivas?.totalElements || 0,
        stockBajo: (statsData as any).inventariosStockBajo?.totalElements || 0,
        clientesActivos: (statsData as any).clientesActivos?.totalElements || 0,
        productosActivos: (statsData as any).productos?.content?.filter((p: any) => p.activo).length || 0,
        tiempoPromedioEntrega: Math.round(tiempoPromedio),
        tasaSatisfaccion: 85 // Mock - en producción vendría del análisis de sentimiento
      };

      setStats(processedStats);

      // Process monthly sales for chart
      const ventasPorMes = (ventasData as any).pedidosPorEstado?.content || [];
      const mesesData = [];
      
      for (let i = 5; i >= 0; i--) {
        const fecha = subMonths(new Date(), i);
        const inicioMes = startOfMonth(fecha);
        const finMes = endOfMonth(fecha);
        
        const ventasDelMes = ventasPorMes.filter((pedido: any) => {
          const fechaPedido = new Date(pedido.fechaPedido);
          return fechaPedido >= inicioMes && fechaPedido <= finMes;
        });
        
        const totalMes = ventasDelMes.reduce((sum: number, pedido: any) => sum + pedido.total, 0);
        
        mesesData.push({
          mes: format(fecha, 'MMM', { locale: es }),
          ventas: totalMes,
          pedidos: ventasDelMes.length
        });
      }
      
      setVentasMensuales(mesesData);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, checkAuth, router]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const pedidosEstadoData = {
    labels: ["Pendientes", "En Proceso", "En Camino", "Entregados"],
    values: [
      stats?.pedidosPendientes || 0,
      stats?.pedidosEnProceso || 0,
      stats?.pedidosEnCamino || 0,
      stats?.totalPedidosEntregados || 0
    ],
    colors: ["#F59E0B", "#3B82F6", "#8B5CF6", "#10B981"]
  };

  const ventasMensualesData = {
    labels: ventasMensuales.map(v => v.mes),
    values: ventasMensuales.map(v => v.ventas)
  };

  const clientesSegmentosData = {
    labels: ["Frecuentes", "Ocasionales", "Nuevos", "VIP"],
    values: [
      Math.floor((stats?.clientesActivos || 0) * 0.3),
      Math.floor((stats?.clientesActivos || 0) * 0.4),
      Math.floor((stats?.clientesActivos || 0) * 0.2),
      Math.floor((stats?.clientesActivos || 0) * 0.1)
    ],
    colors: ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"]
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard DistrIA</h1>
          <p className="text-gray-600 mt-1">
            {user?.rol === "ADMIN" ? "Panel de Control Administrativo" : "Panel del Repartidor"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/products" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Productos</Link>
          <Link href="/dashboard/clients" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Clientes</Link>
          <Link href="/dashboard/orders" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Pedidos</Link>
          <Link href="/dashboard/inventory" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Inventario</Link>
          <Link href="/dashboard/routes" className="px-4 py-2 rounded border bg-white hover:bg-gray-50">Rutas</Link>
          <Button
            onClick={() => { logout(); router.replace("/sign-in"); }}
            className="px-4 py-2 border hover:bg-gray-50"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Ventas Totales"
          value={`$${(stats?.totalVentas || 0).toLocaleString()}`}
          subtitle="Este mes"
          trend={{ value: 12.5, isPositive: true }}
          color="green"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />

        <KPICard
          title="Pedidos Entregados"
          value={stats?.totalPedidosEntregados || 0}
          subtitle="Total completados"
          trend={{ value: 8.2, isPositive: true }}
          color="blue"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KPICard
          title="Tiempo Promedio Entrega"
          value={`${stats?.tiempoPromedioEntrega || 0}h`}
          subtitle="Desde pedido a entrega"
          trend={{ value: 5.1, isPositive: false }}
          color="yellow"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KPICard
          title="Tasa de Satisfacción"
          value={`${stats?.tasaSatisfaccion || 0}%`}
          subtitle="Análisis de sentimiento"
          trend={{ value: 3.2, isPositive: true }}
          color="purple"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Pedidos Pendientes"
          value={stats?.pedidosPendientes || 0}
          color="yellow"
        />
        <KPICard
          title="Rutas Activas"
          value={stats?.rutasActivas || 0}
          color="blue"
        />
        <KPICard
          title="Stock Bajo"
          value={stats?.stockBajo || 0}
          subtitle="Productos críticos"
          color="red"
        />
        <KPICard
          title="Clientes Activos"
          value={stats?.clientesActivos || 0}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SimpleChart
          title="Estado de Pedidos"
          data={pedidosEstadoData}
          type="doughnut"
          height={300}
        />

        <SimpleChart
          title="Ventas Mensuales ($)"
          data={ventasMensualesData}
          type="line"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SimpleChart
          title="Clientes por Segmento"
          data={clientesSegmentosData}
          type="bar"
          height={300}
        />

        <SimpleChart
          title="Predicción de Ventas"
          data={{
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
            values: [
              (stats?.totalVentas || 0) * 0.8,
              (stats?.totalVentas || 0) * 0.9,
              (stats?.totalVentas || 0) * 1.0,
              (stats?.totalVentas || 0) * 1.1,
              (stats?.totalVentas || 0) * 1.15,
              (stats?.totalVentas || 0) * 1.25
            ]
          }}
          type="line"
          height={300}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/dashboard/orders" 
            className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium">Crear Pedido</div>
          </Link>
          <Link 
            href="/dashboard/routes" 
            className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🚚</div>
            <div className="font-medium">Nueva Ruta</div>
          </Link>
          <Link 
            href="/dashboard/inventory" 
            className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Ajustar Stock</div>
          </Link>
          <Link 
            href="/dashboard/clients" 
            className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium">Nuevo Cliente</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
