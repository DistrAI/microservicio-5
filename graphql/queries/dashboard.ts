import { gql } from "@apollo/client";

// Query para obtener estadísticas del dashboard
export const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    # Pedidos por estado para métricas
    pedidosPorEstado(estado: ENTREGADO, page: 0, size: 1000) {
      content {
        id
        total
        fechaPedido
        fechaActualizacion
      }
      totalElements
    }
    
    # Pedidos pendientes
    pedidosPendientes: pedidosPorEstado(estado: PENDIENTE, page: 0, size: 1000) {
      totalElements
    }
    
    # Pedidos en proceso
    pedidosEnProceso: pedidosPorEstado(estado: EN_PROCESO, page: 0, size: 1000) {
      totalElements
    }
    
    # Pedidos en camino
    pedidosEnCamino: pedidosPorEstado(estado: EN_CAMINO, page: 0, size: 1000) {
      totalElements
    }
    
    # Rutas activas
    rutasActivas(page: 0, size: 1000) {
      content {
        id
        estado
        fechaRuta
        pedidos {
          id
          total
        }
      }
      totalElements
    }
    
    # Inventario con stock bajo
    inventariosStockBajo(page: 0, size: 100) {
      content {
        id
        producto {
          nombre
        }
        cantidad
        stockMinimo
      }
      totalElements
    }
    
    # Clientes activos
    clientesActivos(page: 0, size: 1000) {
      totalElements
    }
    
    # Productos activos
    productos(page: 0, size: 1000) {
      content {
        activo
      }
      totalElements
    }
  }
`;

export const VENTAS_MENSUALES_QUERY = gql`
  query VentasMensuales {
    pedidosPorEstado(estado: ENTREGADO, page: 0, size: 1000) {
      content {
        id
        total
        fechaPedido
        cliente {
          id
          nombre
        }
      }
    }
  }
`;
