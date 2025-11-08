import { gql } from "@apollo/client";

export const BUSCAR_PRODUCTOS_QUERY = gql`
  query BuscarProductosPorNombre($nombre: String!, $page: Int, $size: Int) {
    buscarProductosPorNombre(nombre: $nombre, page: $page, size: $size) {
      content {
        id
        nombre
        sku
        precio
        activo
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;
