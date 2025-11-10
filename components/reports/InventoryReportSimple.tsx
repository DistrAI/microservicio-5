'use client';

import { Package, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
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
  }>;
  lowStockAlerts: Array<{
    name: string;
    currentStock: number;
    minStock: number;
    daysLeft: number;
    category: string;
  }>;
}

interface InventoryReportProps {
  data?: InventoryData;
  period?: string;
}

const InventoryReportSimple: React.FC<InventoryReportProps> = ({ 
  data = mockInventoryData, 
  period = format(new Date(), 'MMMM yyyy', { locale: es }) 
}) => {
  const currentDate = new Date();
  const stockHealthScore = ((data.totalProducts - data.lowStockItems - data.outOfStockItems) / data.totalProducts) * 100;
  
  return (
    <div 
      id="inventory-report" 
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
              Reporte de Inventario - {period}
            </h1>
            <p style={{
              color: '#6b7280'
            }}>
              Análisis completo de stock, rotación y tendencias de productos
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
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Total Productos
            </div>
            <Package style={{ width: '16px', height: '16px', color: '#2563eb' }} />
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#2563eb'
          }}>
            {data.totalProducts.toLocaleString()}
          </div>
          <p style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            SKUs activos
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Valor Total
            </div>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#16a34a' }} />
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#16a34a'
          }}>
            ${data.totalValue.toLocaleString()}
          </div>
          <p style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Inventario
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Stock Bajo
            </div>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#eab308' }} />
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#eab308'
          }}>
            {data.lowStockItems}
          </div>
          <p style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Productos
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Sin Stock
            </div>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#dc2626'
          }}>
            {data.outOfStockItems}
          </div>
          <p style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Agotados
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Rotación
            </div>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#7c3aed'
          }}>
            {data.turnoverRate.toFixed(1)}x
          </div>
          <p style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Anual
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280'
            }}>
              Salud Stock
            </div>
            <Package style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4f46e5'
          }}>
            {stockHealthScore.toFixed(1)}%
          </div>
          <p style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Disponible
          </p>
        </div>
      </div>

      {/* Productos Más Vendidos y Alertas */}
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
            {data.topSellingProducts.map((product, index) => (
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
                    {product.category} • Stock: {product.stock}
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
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {product.sold} vendidos
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
            <AlertTriangle style={{ width: '20px', height: '20px' }} />
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Alertas de Stock Bajo
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.lowStockAlerts.map((alert, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '500',
                    color: '#111827'
                  }}>
                    {alert.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {alert.category} • Mín: {alert.minStock}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#dc2626'
                  }}>
                    {alert.currentStock} unidades
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#dc2626'
                  }}>
                    {alert.daysLeft} días restantes
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
    { name: 'Producto Premium A', category: 'Electrónicos', sold: 345, revenue: 51750, stock: 45 },
    { name: 'Producto Estándar B', category: 'Hogar', sold: 298, revenue: 29800, stock: 67 },
    { name: 'Producto Especial C', category: 'Deportes', sold: 267, revenue: 40050, stock: 23 },
    { name: 'Producto Básico D', category: 'Oficina', sold: 234, revenue: 23400, stock: 89 },
    { name: 'Producto Deluxe E', category: 'Electrónicos', sold: 198, revenue: 39600, stock: 12 },
  ],
  lowStockAlerts: [
    { name: 'Producto Crítico X', currentStock: 5, minStock: 20, daysLeft: 3, category: 'Electrónicos' },
    { name: 'Producto Urgente Y', currentStock: 8, minStock: 25, daysLeft: 5, category: 'Hogar' },
    { name: 'Producto Importante Z', currentStock: 12, minStock: 30, daysLeft: 7, category: 'Deportes' },
    { name: 'Producto Esencial W', currentStock: 15, minStock: 40, daysLeft: 10, category: 'Oficina' },
  ]
};

export default InventoryReportSimple;
