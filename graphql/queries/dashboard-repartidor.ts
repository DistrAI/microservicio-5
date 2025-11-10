import { gql } from "@apollo/client";

// Query para obtener estadísticas específicas del repartidor
export const DASHBOARD_REPARTIDOR_STATS_QUERY = gql`
  query DashboardRepartidorStats($repartidorId: ID!) {
    # Rutas del repartidor
    rutasPorRepartidor(repartidorId: $repartidorId, page: 0, size: 1000) {
      content {
        id
        estado
        fechaRuta
        distanciaTotalKm
        tiempoEstimadoMin
        pedidos {
          id
          estado
          total
          direccionEntrega
          cliente {
            id
            nombre
          }
        }
      }
      totalElements
    }
    
    # Rutas activas del repartidor
    rutasActivasRepartidor: rutasPorRepartidor(repartidorId: $repartidorId, page: 0, size: 1000) {
      content {
        id
        estado
        fechaRuta
        pedidos {
          id
          estado
        }
      }
      totalElements
    }
  }
`;

// Query para obtener pedidos específicos del repartidor (a través de sus rutas)
export const PEDIDOS_REPARTIDOR_QUERY = gql`
  query PedidosRepartidor($repartidorId: ID!) {
    rutasPorRepartidor(repartidorId: $repartidorId, page: 0, size: 1000) {
      content {
        id
        estado
        fechaRuta
        pedidos {
          id
          cliente {
            id
            nombre
            email
            telefono
            direccion
            latitudCliente
            longitudCliente
            referenciaDireccion
          }
          estado
          total
          direccionEntrega
          observaciones
          fechaEntrega
          fechaPedido
          fechaActualizacion
          items {
            id
            producto {
              id
              nombre
              sku
            }
            cantidad
            precioUnitario
            subtotal
          }
        }
      }
    }
  }
`;

// Query para obtener el rendimiento del repartidor
export const RENDIMIENTO_REPARTIDOR_QUERY = gql`
  query RendimientoRepartidor($repartidorId: ID!) {
    rutasPorRepartidor(repartidorId: $repartidorId, page: 0, size: 1000) {
      content {
        id
        estado
        fechaRuta
        distanciaTotalKm
        tiempoEstimadoMin
        fechaCreacion
        fechaActualizacion
        pedidos {
          id
          estado
          total
          fechaPedido
          fechaActualizacion
        }
      }
      totalElements
    }
  }
`;
