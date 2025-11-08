import { gql } from "@apollo/client";

export const CREAR_PEDIDO_MUTATION = gql`
  mutation CrearPedido($input: CrearPedidoInput!) {
    crearPedido(input: $input) {
      id
      cliente {
        id
        nombre
        email
      }
      estado
      total
      direccionEntrega
      observaciones
      fechaEntrega
      activo
      fechaPedido
      fechaActualizacion
      items {
        id
        producto {
          id
          nombre
          sku
          precio
        }
        cantidad
        precioUnitario
        subtotal
      }
    }
  }
`;

export const ACTUALIZAR_ESTADO_PEDIDO_MUTATION = gql`
  mutation ActualizarEstadoPedido($id: ID!, $estado: EstadoPedido!) {
    actualizarEstadoPedido(id: $id, estado: $estado) {
      id
      cliente {
        id
        nombre
        email
      }
      estado
      total
      direccionEntrega
      observaciones
      fechaEntrega
      activo
      fechaPedido
      fechaActualizacion
      items {
        id
        producto {
          id
          nombre
          sku
          precio
        }
        cantidad
        precioUnitario
        subtotal
      }
    }
  }
`;

export const CANCELAR_PEDIDO_MUTATION = gql`
  mutation CancelarPedido($id: ID!, $motivo: String) {
    cancelarPedido(id: $id, motivo: $motivo) {
      id
      cliente {
        id
        nombre
        email
      }
      estado
      total
      direccionEntrega
      observaciones
      fechaEntrega
      activo
      fechaPedido
      fechaActualizacion
      items {
        id
        producto {
          id
          nombre
          sku
          precio
        }
        cantidad
        precioUnitario
        subtotal
      }
    }
  }
`;

export const DESACTIVAR_PEDIDO_MUTATION = gql`
  mutation DesactivarPedido($id: ID!) {
    desactivarPedido(id: $id) {
      id
      cliente {
        id
        nombre
        email
      }
      estado
      total
      direccionEntrega
      observaciones
      fechaEntrega
      activo
      fechaPedido
      fechaActualizacion
      items {
        id
        producto {
          id
          nombre
          sku
          precio
        }
        cantidad
        precioUnitario
        subtotal
      }
    }
  }
`;
