import { gql } from "@apollo/client";

export const PEDIDOS_QUERY = gql`
  query Pedidos($page: Int, $size: Int) {
    pedidos(page: $page, size: $size) {
      content {
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
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const PEDIDOS_ACTIVOS_QUERY = gql`
  query PedidosActivos($page: Int, $size: Int) {
    pedidosActivos(page: $page, size: $size) {
      content {
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
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const PEDIDOS_POR_ESTADO_QUERY = gql`
  query PedidosPorEstado($estado: EstadoPedido!, $page: Int, $size: Int) {
    pedidosPorEstado(estado: $estado, page: $page, size: $size) {
      content {
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
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const PEDIDOS_POR_CLIENTE_QUERY = gql`
  query PedidosPorCliente($clienteId: ID!, $page: Int, $size: Int) {
    pedidosPorCliente(clienteId: $clienteId, page: $page, size: $size) {
      content {
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
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const PEDIDO_QUERY = gql`
  query Pedido($id: ID!) {
    pedido(id: $id) {
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
