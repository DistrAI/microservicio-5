'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, MapPin, Star, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerData {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerRetentionRate: number;
  averageLifetimeValue: number;
  topCustomers: Array<{
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastOrder: string;
    segment: string;
  }>;
  customersByLocation: Array<{
    city: string;
    count: number;
    revenue: number;
  }>;
  segmentAnalysis: Array<{
    segment: string;
    count: number;
    percentage: number;
    avgOrderValue: number;
    totalRevenue: number;
  }>;
  satisfactionScores: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

interface CustomersReportProps {
  data?: CustomerData;
  period?: string;
}

const CustomersReport: React.FC<CustomersReportProps> = ({ 
  data = mockCustomerData, 
  period = format(new Date(), 'MMMM yyyy', { locale: es }) 
}) => {
  const currentDate = new Date();
  
  return (
    <div id="customers-report" className="bg-white p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Análisis de Clientes - {period}
            </h1>
            <p className="text-gray-600">
              Segmentación y comportamiento de la base de clientes
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

      {/* KPIs de Clientes */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.totalCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Base total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Nuevos Clientes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.newCustomers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Clientes Activos
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.activeCustomers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Retención
              </CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.customerRetentionRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tasa mensual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                LTV Promedio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              ${data.averageLifetimeValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Valor de vida
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Clientes y Distribución Geográfica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top 5 Clientes VIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {customer.totalOrders} pedidos
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {customer.segment}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${customer.totalSpent.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Último: {customer.lastOrder}
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
              <MapPin className="h-5 w-5" />
              Distribución Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.customersByLocation.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{location.city}</div>
                    <div className="text-sm text-gray-500">
                      {location.count} clientes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      ${location.revenue.toLocaleString()}
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(location.count / Math.max(...data.customersByLocation.map(l => l.count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Segmentación */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Análisis de Segmentación de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.segmentAnalysis.map((segment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{segment.segment}</h3>
                  <Badge variant="secondary">{segment.percentage.toFixed(1)}%</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Clientes:</span>
                    <span className="font-medium">{segment.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AOV:</span>
                    <span className="font-medium">${segment.avgOrderValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ingresos:</span>
                    <span className="font-medium text-green-600">
                      ${segment.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                    style={{ width: `${segment.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Satisfacción del Cliente */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Satisfacción del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {data.satisfactionScores.map((score, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < score.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {score.count}
                </div>
                <div className="text-sm text-gray-500">
                  {score.percentage.toFixed(1)}% de clientes
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${score.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Puntuación Promedio</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {(data.satisfactionScores.reduce((acc, score) => acc + (score.rating * score.count), 0) / 
                data.satisfactionScores.reduce((acc, score) => acc + score.count, 0)).toFixed(1)} / 5.0
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="border-t pt-6 text-center text-gray-500 text-sm">
        <p>Este reporte fue generado automáticamente por DistribuyoIA</p>
        <p>Datos actualizados en tiempo real desde el sistema de gestión</p>
      </div>
    </div>
  );
};

// Datos de ejemplo para demostración
const mockCustomerData: CustomerData = {
  totalCustomers: 1247,
  newCustomers: 89,
  activeCustomers: 456,
  customerRetentionRate: 78.5,
  averageLifetimeValue: 1850,
  topCustomers: [
    {
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      totalOrders: 24,
      totalSpent: 4500,
      lastOrder: '15/11/2024',
      segment: 'VIP'
    },
    {
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      totalOrders: 18,
      totalSpent: 3200,
      lastOrder: '12/11/2024',
      segment: 'Frecuente'
    },
    {
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      totalOrders: 15,
      totalSpent: 2800,
      lastOrder: '10/11/2024',
      segment: 'VIP'
    },
    {
      name: 'Luis Fernández',
      email: 'luis.fernandez@email.com',
      totalOrders: 12,
      totalSpent: 2400,
      lastOrder: '08/11/2024',
      segment: 'Frecuente'
    },
    {
      name: 'Patricia López',
      email: 'patricia.lopez@email.com',
      totalOrders: 10,
      totalSpent: 2100,
      lastOrder: '05/11/2024',
      segment: 'Regular'
    }
  ],
  customersByLocation: [
    { city: 'Ciudad de México', count: 345, revenue: 125000 },
    { city: 'Guadalajara', count: 234, revenue: 89000 },
    { city: 'Monterrey', count: 198, revenue: 76000 },
    { city: 'Puebla', count: 156, revenue: 58000 },
    { city: 'Tijuana', count: 134, revenue: 45000 },
    { city: 'Otras ciudades', count: 180, revenue: 67000 }
  ],
  segmentAnalysis: [
    {
      segment: 'Clientes VIP',
      count: 125,
      percentage: 10.0,
      avgOrderValue: 450.00,
      totalRevenue: 56250
    },
    {
      segment: 'Compradores Frecuentes',
      count: 312,
      percentage: 25.0,
      avgOrderValue: 280.00,
      totalRevenue: 87360
    },
    {
      segment: 'Clientes Regulares',
      count: 498,
      percentage: 40.0,
      avgOrderValue: 180.00,
      totalRevenue: 89640
    },
    {
      segment: 'Nuevos Clientes',
      count: 312,
      percentage: 25.0,
      avgOrderValue: 120.00,
      totalRevenue: 37440
    }
  ],
  satisfactionScores: [
    { rating: 5, count: 456, percentage: 36.6 },
    { rating: 4, count: 374, percentage: 30.0 },
    { rating: 3, count: 249, percentage: 20.0 },
    { rating: 2, count: 125, percentage: 10.0 },
    { rating: 1, count: 43, percentage: 3.4 }
  ]
};

export default CustomersReport;
