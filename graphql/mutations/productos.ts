import { gql } from "@apollo/client";

export const CREAR_PRODUCTO_MUTATION = gql`
  mutation CrearProducto($input: CrearProductoInput!) {
    crearProducto(input: $input) {
      id
      nombre
      sku
      precio
      activo
    }
  }
`;

export const ACTUALIZAR_PRODUCTO_MUTATION = gql`
  mutation ActualizarProducto($id: ID!, $input: ActualizarProductoInput!) {
    actualizarProducto(id: $id, input: $input) {
      id
      nombre
      sku
      precio
      activo
    }
  }
`;

export const DESACTIVAR_PRODUCTO_MUTATION = gql`
  mutation DesactivarProducto($id: ID!) {
    desactivarProducto(id: $id) {
      id
      activo
    }
  }
`;

export const ACTIVAR_PRODUCTO_MUTATION = gql`
  mutation ActivarProducto($id: ID!) {
    activarProducto(id: $id) {
      id
      activo
    }
  }
`;
