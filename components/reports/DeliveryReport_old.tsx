'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, MapPin, CheckCircle, AlertCircle, Calendar, Route } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DeliveryData {
  totalDeliveries: number;
  successfulDeliveries: number;
  averageDeliveryTime: number;
  onTimeDeliveries: number;
  totalDistance: number;
  fuelCost: number;
  deliveryPerformance: Array<{
    date: string;
    deliveries: number;
    onTime: number;
    avgTime: number;
  }>;
  routeEfficiency: Array<{
    route: string;
    deliveries: number;
    distance: number;
    time: number;
    efficiency: number;
  }>;
  deliveryIssues: Array<{
    issue: string;
    count: number;
    percentage: number;
  }>;
  repartidorPerformance: Array<{
    name: string;
    deliveries: number;
    onTimeRate: number;
    avgTime: number;
    customerRating: number;
  }>;
}

interface DeliveryReportProps {
  data?: DeliveryData;
  period?: string;
}

const DeliveryReport: React.FC<DeliveryReportProps> = ({ 
  data = mockDeliveryData, 
  period = format(new Date(), 'MMMM yyyy', { locale: es }) 
}) => {
  const currentDate = new Date();
  const successRate = (data.successfulDeliveries / data.totalDeliveries) * 100;
  const onTimeRate = (data.onTimeDeliveries / data.totalDeliveries) * 100;
  
  return (
    <div id="deliveries-report" className="bg-white p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rendimiento de Entregas - {period}
            </h1>
            <p className="text-gray-600">
              Análisis de eficiencia logística y operacional
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
                Total Entregas
              </CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.totalDeliveries.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Este período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tasa de Éxito
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.successfulDeliveries} exitosas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Entregas a Tiempo
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {onTimeRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.onTimeDeliveries} puntuales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tiempo Promedio
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.averageDeliveryTime}min
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Por entrega
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Distancia Total
              </CardTitle>
              <MapPin className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {data.totalDistance.toLocaleString()}km
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recorridos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Costo Combustible
              </CardTitle>
              <Truck className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${data.fuelCost.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento Diario y Eficiencia de Rutas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rendimiento Diario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.deliveryPerformance.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{day.date}</div>
                    <div className="text-sm text-gray-500">
                      {day.deliveries} entregas • {day.avgTime}min promedio
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {((day.onTime / day.deliveries) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.onTime}/{day.deliveries} a tiempo
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
              <Route className="h-5 w-5" />
              Eficiencia por Ruta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.routeEfficiency.map((route, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{route.route}</div>
                    <Badge 
                      variant={route.efficiency >= 85 ? "default" : route.efficiency >= 70 ? "secondary" : "destructive"}
                    >
                      {route.efficiency}% eficiencia
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Entregas:</span>
                      <div className="font-medium">{route.deliveries}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Distancia:</span>
                      <div className="font-medium">{route.distance}km</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tiempo:</span>
                      <div className="font-medium">{route.time}min</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento de Repartidores */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Rendimiento de Repartidores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.repartidorPerformance.map((repartidor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{repartidor.name}</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${
                          i < Math.floor(repartidor.customerRating) ? 'bg-yellow-400' : 'bg-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">
                      {repartidor.customerRating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Entregas:</span>
                    <span className="font-medium">{repartidor.deliveries}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Puntualidad:</span>
                    <span className="font-medium text-green-600">
                      {repartidor.onTimeRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiempo Prom:</span>
                    <span className="font-medium">{repartidor.avgTime}min</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" 
                    style={{ width: `${repartidor.onTimeRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis de Problemas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Análisis de Incidencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.deliveryIssues.map((issue, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">{issue.issue}</h3>
                  <Badge variant="outline">{issue.percentage.toFixed(1)}%</Badge>
                </div>
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {issue.count}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  casos registrados
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${issue.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Recomendaciones</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Optimizar rutas en zonas con mayor incidencia de retrasos</li>
              <li>• Implementar sistema de notificaciones proactivas para clientes</li>
              <li>• Capacitar repartidores en manejo de situaciones difíciles</li>
              <li>• Revisar horarios de entrega en áreas problemáticas</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="border-t pt-6 text-center text-gray-500 text-sm">
        <p>Este reporte fue generado automáticamente por DistribuyoIA</p>
        <p>Datos de GPS y sensores integrados en tiempo real</p>
      </div>
    </div>
  );
};

// Datos de ejemplo para demostración
const mockDeliveryData: DeliveryData = {
  totalDeliveries: 1847,
  successfulDeliveries: 1756,
  averageDeliveryTime: 28,
  onTimeDeliveries: 1523,
  totalDistance: 12450,
  fuelCost: 8750,
  deliveryPerformance: [
    { date: '01 Nov', deliveries: 89, onTime: 78, avgTime: 25 },
    { date: '02 Nov', deliveries: 95, onTime: 85, avgTime: 27 },
    { date: '03 Nov', deliveries: 78, onTime: 72, avgTime: 30 },
    { date: '04 Nov', deliveries: 102, onTime: 89, avgTime: 26 },
    { date: '05 Nov', deliveries: 87, onTime: 79, avgTime: 29 },
  ],
  routeEfficiency: [
    { route: 'Ruta Norte', deliveries: 245, distance: 1850, time: 420, efficiency: 87 },
    { route: 'Ruta Sur', deliveries: 198, distance: 1650, time: 380, efficiency: 82 },
    { route: 'Ruta Este', deliveries: 167, distance: 1420, time: 350, efficiency: 89 },
    { route: 'Ruta Oeste', deliveries: 189, distance: 1580, time: 390, efficiency: 85 },
    { route: 'Ruta Centro', deliveries: 156, distance: 1200, time: 280, efficiency: 91 },
  ],
  deliveryIssues: [
    { issue: 'Cliente Ausente', count: 45, percentage: 2.4 },
    { issue: 'Dirección Incorrecta', count: 23, percentage: 1.2 },
    { issue: 'Tráfico Intenso', count: 18, percentage: 1.0 },
    { issue: 'Problemas Vehículo', count: 5, percentage: 0.3 },
  ],
  repartidorPerformance: [
    { name: 'Juan Pérez', deliveries: 234, onTimeRate: 89.5, avgTime: 25, customerRating: 4.7 },
    { name: 'María López', deliveries: 198, onTimeRate: 92.1, avgTime: 23, customerRating: 4.8 },
    { name: 'Carlos Ruiz', deliveries: 187, onTimeRate: 85.6, avgTime: 28, customerRating: 4.5 },
    { name: 'Ana García', deliveries: 176, onTimeRate: 88.2, avgTime: 26, customerRating: 4.6 },
    { name: 'Luis Torres', deliveries: 165, onTimeRate: 86.7, avgTime: 30, customerRating: 4.4 },
    { name: 'Sofia Mendez', deliveries: 154, onTimeRate: 90.3, avgTime: 24, customerRating: 4.9 },
  ]
};

export default DeliveryReport;
