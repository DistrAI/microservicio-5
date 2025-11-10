'use client';

// Removemos las importaciones de componentes UI que causan problemas con colores lab()
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SalesData {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  salesByWeek: Array<{
    week: string;
    sales: number;
    orders: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
  }>;
}

interface SalesReportProps {
  data?: SalesData;
  period?: string;
}

const SalesReport: React.FC<SalesReportProps> = ({ 
  data = mockSalesData, 
  period = format(new Date(), 'MMMM yyyy', { locale: es }) 
}) => {
  const currentDate = new Date();
  
  return (
    <div id="sales-report" className="bg-white p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reporte de Ventas - {period}
            </h1>
            <p className="text-gray-600">
              Análisis completo del rendimiento comercial
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calendar className="h-4 w-4" />
              Generado el {format(currentDate, 'dd/MM/yyyy HH:mm', { locale: es })}
            </div>
            <Badge variant="secondary">DistribuyoIA</Badge>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +12.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pedidos Totales
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +8.3% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Clientes Únicos
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.totalCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +15.2% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ticket Promedio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${data.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +3.7% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Productos Más Vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.quantity} unidades vendidas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${product.revenue.toLocaleString()}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Segmentación de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Segmentación de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.customerSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{segment.segment}</div>
                    <div className="text-sm text-gray-500">
                      {segment.count} clientes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      ${segment.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((segment.revenue / data.totalRevenue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ventas por Semana */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Evolución Semanal de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.salesByWeek.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-blue-600">S{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{week.week}</div>
                    <div className="text-sm text-gray-500">
                      {week.orders} pedidos
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    ${week.sales.toLocaleString()}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(week.sales / Math.max(...data.salesByWeek.map(w => w.sales))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="border-t pt-6 text-center text-gray-500 text-sm">
        <p>Este reporte fue generado automáticamente por DistribuyoIA</p>
        <p>Para más información, contacta al equipo de soporte</p>
      </div>
    </div>
  );
};

// Datos de ejemplo para demostración
const mockSalesData: SalesData = {
  totalSales: 1250,
  totalRevenue: 87500,
  totalOrders: 342,
  totalCustomers: 156,
  averageOrderValue: 255.85,
  topProducts: [
    { name: 'Producto Premium A', quantity: 125, revenue: 18750 },
    { name: 'Producto Estándar B', quantity: 98, revenue: 14700 },
    { name: 'Producto Especial C', quantity: 87, revenue: 13050 },
    { name: 'Producto Básico D', quantity: 76, revenue: 11400 },
    { name: 'Producto Deluxe E', quantity: 65, revenue: 9750 },
  ],
  salesByWeek: [
    { week: '1-7 Nov', sales: 18500, orders: 78 },
    { week: '8-14 Nov', sales: 22300, orders: 89 },
    { week: '15-21 Nov', sales: 25100, orders: 95 },
    { week: '22-28 Nov', sales: 21600, orders: 80 },
  ],
  customerSegments: [
    { segment: 'Clientes VIP', count: 23, revenue: 28500 },
    { segment: 'Compradores Frecuentes', count: 45, revenue: 31200 },
    { segment: 'Clientes Regulares', count: 67, revenue: 19800 },
    { segment: 'Nuevos Clientes', count: 21, revenue: 8000 },
  ],
};

export default SalesReport;
