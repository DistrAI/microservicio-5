import { gql } from "@apollo/client";

export const CLIENTES_QUERY = gql`
  query Clientes($page: Int, $size: Int) {
    clientes(page: $page, size: $size) {
      content {
        id
        nombre
        email
        telefono
        direccion
        activo
        fechaCreacion
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const CLIENTES_ACTIVOS_QUERY = gql`
  query ClientesActivos($page: Int, $size: Int) {
    clientesActivos(page: $page, size: $size) {
      content {
        id
        nombre
        email
        telefono
        direccion
        activo
        fechaCreacion
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;
