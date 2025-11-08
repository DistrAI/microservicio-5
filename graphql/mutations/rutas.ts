import { gql } from "@apollo/client";

export const CREAR_RUTA_MUTATION = gql`
  mutation CrearRuta($input: CrearRutaInput!) {
    crearRuta(input: $input) {
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
  }
`;

export const ASIGNAR_PEDIDOS_A_RUTA_MUTATION = gql`
  mutation AsignarPedidosARuta($input: AsignarPedidosRutaInput!) {
    asignarPedidosARuta(input: $input) {
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
  }
`;

export const REMOVER_PEDIDO_DE_RUTA_MUTATION = gql`
  mutation RemoverPedidoDeRuta($rutaId: ID!, $pedidoId: ID!) {
    removerPedidoDeRuta(rutaId: $rutaId, pedidoId: $pedidoId) {
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
  }
`;

export const ACTUALIZAR_ESTADO_RUTA_MUTATION = gql`
  mutation ActualizarEstadoRuta($rutaId: ID!, $estado: EstadoRuta!) {
    actualizarEstadoRuta(rutaId: $rutaId, estado: $estado) {
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
  }
`;

export const DESACTIVAR_RUTA_MUTATION = gql`
  mutation DesactivarRuta($rutaId: ID!) {
    desactivarRuta(rutaId: $rutaId) {
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
  }
`;

export const ELIMINAR_RUTA_MUTATION = gql`
  mutation EliminarRuta($rutaId: ID!) {
    eliminarRuta(rutaId: $rutaId)
  }
`;
