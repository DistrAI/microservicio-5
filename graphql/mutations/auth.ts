import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      tipo
      userId
      email
      nombreCompleto
      rol
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CrearUsuario($input: CrearUsuarioInput!) {
    crearUsuario(input: $input) {
      id
      nombreCompleto
      email
      rol
      telefono
      activo
      fechaCreacion
    }
  }
`;

