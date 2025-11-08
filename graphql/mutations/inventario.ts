import { gql } from "@apollo/client";

export const AJUSTAR_INVENTARIO_MUTATION = gql`
  mutation AjustarInventario($input: AjustarInventarioInput!) {
    ajustarInventario(input: $input) {
      id
      producto {
        id
        nombre
        sku
        precio
      }
      cantidad
      ubicacion
      stockMinimo
      activo
      fechaCreacion
      fechaUltimaActualizacion
    }
  }
`;

export const DESACTIVAR_INVENTARIO_MUTATION = gql`
  mutation DesactivarInventario($productoId: ID!) {
    desactivarInventario(productoId: $productoId) {
      id
      producto {
        id
        nombre
        sku
        precio
      }
      cantidad
      ubicacion
      stockMinimo
      activo
      fechaCreacion
      fechaUltimaActualizacion
    }
  }
`;
