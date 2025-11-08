import { gql } from "@apollo/client";

export const PRODUCTOS_QUERY = gql`
  query Productos($page: Int, $size: Int) {
    productos(page: $page, size: $size) {
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
