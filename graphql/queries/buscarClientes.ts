import { gql } from "@apollo/client";

export const BUSCAR_CLIENTES_QUERY = gql`
  query BuscarClientesPorNombre($nombre: String!, $page: Int, $size: Int) {
    buscarClientesPorNombre(nombre: $nombre, page: $page, size: $size) {
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
