import { gql } from "@apollo/client";

export const USUARIOS_POR_ROL_QUERY = gql`
  query UsuariosPorRol($rol: Rol!) {
    usuariosPorRol(rol: $rol) {
      id
      nombreCompleto
      email
      rol
      activo
    }
  }
`;

export const USUARIOS_ACTIVOS_POR_ROL_QUERY = gql`
  query UsuariosActivosPorRol($rol: Rol!) {
    usuariosActivosPorRol(rol: $rol) {
      id
      nombreCompleto
      email
      rol
      activo
    }
  }
`;
