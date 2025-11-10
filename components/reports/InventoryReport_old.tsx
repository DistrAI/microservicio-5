'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, AlertTriangle, BarChart3, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InventoryData {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  turnoverRate: number;
  topSellingProducts: Array<{
    name: string;
    category: string;
    sold: number;
    revenue: number;
    stock: number;
    turnover: number;
  }>;
  lowStockAlerts: Array<{
    name: string;
    currentStock: number;
    minStock: number;
    daysLeft: number;
    category: string;
  }>;
  categoryAnalysis: Array<{
    category: string;
    products: number;
    totalValue: number;
    avgTurnover: number;
    profitMargin: number;
  }>;
  stockMovements: Array<{
    date: string;
    inbound: number;
    outbound: number;
    net: number;
  }>;
  seasonalTrends: Array<{
    product: string;
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    trend: string;
  }>;
}

interface InventoryReportProps {
  data?: InventoryData;
  period?: string;
}

const InventoryReport: React.FC<InventoryReportProps> = ({ 
  data = mockInventoryData, 
  period = format(new Date(), 'MMMM yyyy', { locale: es }) 
}) => {
  const currentDate = new Date();
  const stockHealthScore = ((data.totalProducts - data.lowStockItems - data.outOfStockItems) / data.totalProducts) * 100;
  
  return (
    <div id="inventory-report" className="bg-white p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reporte de Inventario - {period}
            </h1>
            <p className="text-gray-600">
              Análisis completo de stock, rotación y tendencias de productos
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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              SKUs activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Valor Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Stock Bajo
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.lowStockItems}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Productos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sin Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.outOfStockItems}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Agotados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rotación
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.turnoverRate.toFixed(1)}x
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Anual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Salud Stock
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stockHealthScore.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Disponible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Productos Más Vendidos y Alertas de Stock */}
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
              {data.topSellingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category}</div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock} unidades
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Rotación: {product.turnover.toFixed(1)}x
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${product.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.sold} vendidos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.lowStockAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{alert.name}</div>
                    <div className="text-sm text-gray-500">{alert.category}</div>
                    <div className="text-xs text-red-600 mt-1">
                      Stock mínimo: {alert.minStock} unidades
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {alert.currentStock} unidades
                    </div>
                    <div className="text-xs text-red-500">
                      {alert.daysLeft} días restantes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por Categoría */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis por Categoría de Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.categoryAnalysis.map((category, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{category.category}</h3>
                  <Badge 
                    variant={category.profitMargin >= 30 ? "default" : category.profitMargin >= 20 ? "secondary" : "destructive"}
                  >
                    {category.profitMargin.toFixed(1)}% margen
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Productos:</span>
                    <span className="font-medium">{category.products}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-medium">${category.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rotación Prom:</span>
                    <span className="font-medium">{category.avgTurnover.toFixed(1)}x</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(category.avgTurnover * 20, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Movimientos de Stock */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Movimientos de Stock (Últimos 7 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stockMovements.map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-blue-600 text-sm">
                      {movement.date.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{movement.date}</div>
                    <div className="text-sm text-gray-500">
                      Movimiento neto: {movement.net > 0 ? '+' : ''}{movement.net} unidades
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-bold">+{movement.inbound}</div>
                    <div className="text-gray-500">Entradas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-bold">-{movement.outbound}</div>
                    <div className="text-gray-500">Salidas</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias Estacionales */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tendencias Estacionales (Primeros 4 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.seasonalTrends.map((trend, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{trend.product}</h3>
                  <Badge 
                    variant={trend.trend === 'Creciente' ? "default" : trend.trend === 'Estable' ? "secondary" : "destructive"}
                  >
                    {trend.trend}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Enero</div>
                    <div className="font-bold">{trend.jan}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Febrero</div>
                    <div className="font-bold">{trend.feb}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Marzo</div>
                    <div className="font-bold">{trend.mar}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Abril</div>
                    <div className="font-bold">{trend.apr}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full ${
                      trend.trend === 'Creciente' ? 'bg-green-500' : 
                      trend.trend === 'Estable' ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.max(trend.jan, trend.feb, trend.mar, trend.apr) / 100 * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendaciones de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Oportunidades de Crecimiento</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Aumentar stock de productos con alta rotación</li>
                <li>• Promocionar productos con margen alto</li>
                <li>• Expandir categorías rentables</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Acciones Urgentes</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Reabastecer productos con stock crítico</li>
                <li>• Revisar productos de baja rotación</li>
                <li>• Optimizar niveles de inventario</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="border-t pt-6 text-center text-gray-500 text-sm">
        <p>Este reporte fue generado automáticamente por DistribuyoIA</p>
        <p>Análisis predictivo basado en machine learning y datos históricos</p>
      </div>
    </div>
  );
};

// Datos de ejemplo para demostración
const mockInventoryData: InventoryData = {
  totalProducts: 1247,
  totalValue: 485000,
  lowStockItems: 23,
  outOfStockItems: 7,
  turnoverRate: 4.2,
  topSellingProducts: [
    { name: 'Producto Premium A', category: 'Electrónicos', sold: 345, revenue: 51750, stock: 45, turnover: 8.5 },
    { name: 'Producto Estándar B', category: 'Hogar', sold: 298, revenue: 29800, stock: 67, turnover: 6.2 },
    { name: 'Producto Especial C', category: 'Deportes', sold: 267, revenue: 40050, stock: 23, turnover: 7.8 },
    { name: 'Producto Básico D', category: 'Oficina', sold: 234, revenue: 23400, stock: 89, turnover: 4.1 },
    { name: 'Producto Deluxe E', category: 'Electrónicos', sold: 198, revenue: 39600, stock: 12, turnover: 9.2 },
  ],
  lowStockAlerts: [
    { name: 'Producto Crítico X', currentStock: 5, minStock: 20, daysLeft: 3, category: 'Electrónicos' },
    { name: 'Producto Urgente Y', currentStock: 8, minStock: 25, daysLeft: 5, category: 'Hogar' },
    { name: 'Producto Importante Z', currentStock: 12, minStock: 30, daysLeft: 7, category: 'Deportes' },
    { name: 'Producto Esencial W', currentStock: 15, minStock: 40, daysLeft: 10, category: 'Oficina' },
  ],
  categoryAnalysis: [
    { category: 'Electrónicos', products: 234, totalValue: 145000, avgTurnover: 6.8, profitMargin: 35.2 },
    { category: 'Hogar', products: 345, totalValue: 128000, avgTurnover: 4.2, profitMargin: 28.7 },
    { category: 'Deportes', products: 198, totalValue: 89000, avgTurnover: 5.5, profitMargin: 31.4 },
    { category: 'Oficina', products: 287, totalValue: 67000, avgTurnover: 3.8, profitMargin: 22.1 },
    { category: 'Otros', products: 183, totalValue: 56000, avgTurnover: 2.9, profitMargin: 18.5 },
  ],
  stockMovements: [
    { date: '04 Nov', inbound: 145, outbound: 234, net: -89 },
    { date: '05 Nov', inbound: 198, outbound: 187, net: 11 },
    { date: '06 Nov', inbound: 167, outbound: 245, net: -78 },
    { date: '07 Nov', inbound: 234, outbound: 198, net: 36 },
    { date: '08 Nov', inbound: 189, outbound: 267, net: -78 },
    { date: '09 Nov', inbound: 278, outbound: 189, net: 89 },
    { date: '10 Nov', inbound: 156, outbound: 234, net: -78 },
  ],
  seasonalTrends: [
    { product: 'Producto Estacional A', jan: 45, feb: 67, mar: 89, apr: 123, trend: 'Creciente' },
    { product: 'Producto Estacional B', jan: 78, feb: 82, mar: 79, apr: 81, trend: 'Estable' },
    { product: 'Producto Estacional C', jan: 156, feb: 134, mar: 98, apr: 67, trend: 'Decreciente' },
    { product: 'Producto Estacional D', jan: 234, feb: 267, mar: 298, apr: 345, trend: 'Creciente' },
  ]
};

export default InventoryReport;
