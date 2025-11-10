'use client';

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

const SalesReportSimple: React.FC<SalesReportProps> = ({ 
  data = mockSalesData, 
  period = format(new Date(), 'MMMM yyyy', { locale: es }) 
}) => {
  const currentDate = new Date();
  
  return (
    <div 
      id="sales-report" 
      style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#111827'
      }}
    >
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Reporte de Ventas - {period}
            </h1>
            <p style={{
              color: '#6b7280'
            }}>
              Análisis completo del rendimiento comercial
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '4px'
            }}>
              <Calendar style={{ width: '16px', height: '16px' }} />
              Generado el {format(currentDate, 'dd/MM/yyyy HH:mm', { locale: es })}
            </div>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              DistribuyoIA
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Ingresos Totales
            </div>
            <DollarSign style={{ width: '16px', height: '16px', color: '#16a34a' }} />
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#16a34a'
          }}>
            ${data.totalRevenue.toLocaleString()}
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            +12.5% vs mes anterior
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Pedidos Totales
            </div>
            <ShoppingCart style={{ width: '16px', height: '16px', color: '#2563eb' }} />
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2563eb'
          }}>
            {data.totalOrders.toLocaleString()}
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            +8.3% vs mes anterior
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Clientes Únicos
            </div>
            <Users style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#7c3aed'
          }}>
            {data.totalCustomers.toLocaleString()}
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            +15.2% vs mes anterior
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Ticket Promedio
            </div>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#ea580c' }} />
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ea580c'
          }}>
            ${data.averageOrderValue.toFixed(2)}
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            +3.7% vs mes anterior
          </p>
        </div>
      </div>

      {/* Productos Más Vendidos y Segmentación */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <TrendingUp style={{ width: '20px', height: '20px' }} />
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Top 5 Productos Más Vendidos
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.topProducts.map((product, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '500',
                    color: '#111827'
                  }}>
                    {product.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {product.quantity} unidades vendidas
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#16a34a'
                  }}>
                    ${product.revenue.toLocaleString()}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Users style={{ width: '20px', height: '20px' }} />
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Segmentación de Clientes
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.customerSegments.map((segment, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{
                    fontWeight: '500',
                    color: '#111827'
                  }}>
                    {segment.segment}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {segment.count} clientes
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#2563eb'
                  }}>
                    ${segment.revenue.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {((segment.revenue / data.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '24px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px'
      }}>
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

export default SalesReportSimple;
