import { gql } from "@apollo/client";

export const CREAR_CLIENTE_MUTATION = gql`
  mutation CrearCliente($input: CrearClienteInput!) {
    crearCliente(input: $input) {
      id
      nombre
      email
      telefono
      direccion
      activo
      fechaCreacion
    }
  }
`;

export const ACTUALIZAR_CLIENTE_MUTATION = gql`
  mutation ActualizarCliente($id: ID!, $input: ActualizarClienteInput!) {
    actualizarCliente(id: $id, input: $input) {
      id
      nombre
      email
      telefono
      direccion
      activo
      fechaCreacion
    }
  }
`;

export const DESACTIVAR_CLIENTE_MUTATION = gql`
  mutation DesactivarCliente($id: ID!) {
    desactivarCliente(id: $id) {
      id
      nombre
      email
      telefono
      direccion
      activo
      fechaCreacion
    }
  }
`;

export const ACTIVAR_CLIENTE_MUTATION = gql`
  mutation ActivarCliente($id: ID!) {
    activarCliente(id: $id) {
      id
      nombre
      email
      telefono
      direccion
      activo
      fechaCreacion
    }
  }
`;
