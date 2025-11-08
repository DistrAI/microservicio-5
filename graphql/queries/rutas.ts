import { gql } from "@apollo/client";

export const RUTAS_QUERY = gql`
  query Rutas($page: Int, $size: Int) {
    rutas(page: $page, size: $size) {
      content {
        id
        repartidor {
          id
          nombreCompleto
          email
        }
        estado
        fechaRuta
        distanciaTotalKm
        tiempoEstimadoMin
        activo
        fechaCreacion
        fechaActualizacion
        pedidos {
          id
          cliente {
            id
            nombre
          }
          estado
          total
          direccionEntrega
        }
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const RUTAS_ACTIVAS_QUERY = gql`
  query RutasActivas($page: Int, $size: Int) {
    rutasActivas(page: $page, size: $size) {
      content {
        id
        repartidor {
          id
          nombreCompleto
          email
        }
        estado
        fechaRuta
        distanciaTotalKm
        tiempoEstimadoMin
        activo
        fechaCreacion
        fechaActualizacion
        pedidos {
          id
          cliente {
            id
            nombre
          }
          estado
          total
          direccionEntrega
        }
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const RUTAS_POR_REPARTIDOR_QUERY = gql`
  query RutasPorRepartidor($repartidorId: ID!, $page: Int, $size: Int) {
    rutasPorRepartidor(repartidorId: $repartidorId, page: $page, size: $size) {
      content {
        id
        repartidor {
          id
          nombreCompleto
          email
        }
        estado
        fechaRuta
        distanciaTotalKm
        tiempoEstimadoMin
        activo
        fechaCreacion
        fechaActualizacion
        pedidos {
          id
          cliente {
            id
            nombre
          }
          estado
          total
          direccionEntrega
        }
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const RUTAS_POR_ESTADO_QUERY = gql`
  query RutasPorEstado($estado: EstadoRuta!, $page: Int, $size: Int) {
    rutasPorEstado(estado: $estado, page: $page, size: $size) {
      content {
        id
        repartidor {
          id
          nombreCompleto
          email
        }
        estado
        fechaRuta
        distanciaTotalKm
        tiempoEstimadoMin
        activo
        fechaCreacion
        fechaActualizacion
        pedidos {
          id
          cliente {
            id
            nombre
          }
          estado
          total
          direccionEntrega
        }
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const RUTA_QUERY = gql`
  query Ruta($id: ID!) {
    ruta(id: $id) {
      id
      repartidor {
        id
        nombreCompleto
        email
      }
      estado
      fechaRuta
      distanciaTotalKm
      tiempoEstimadoMin
      activo
      fechaCreacion
      fechaActualizacion
      pedidos {
        id
        cliente {
          id
          nombre
          email
          telefono
          direccion
        }
        estado
        total
        direccionEntrega
        observaciones
        fechaPedido
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
`;
