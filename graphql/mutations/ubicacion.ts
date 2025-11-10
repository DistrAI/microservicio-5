import { gql } from '@apollo/client'

export const ACTUALIZAR_UBICACION_EMPRESA = gql`
  mutation ActualizarUbicacionEmpresa($id: ID!, $input: ActualizarUbicacionEmpresaInput!) {
    actualizarUbicacionEmpresa(id: $id, input: $input) {
      id
      nombreCompleto
      email
      direccionEmpresa
      latitudEmpresa
      longitudEmpresa
      nombreEmpresa
      fechaActualizacion
    }
  }
`

export const ACTUALIZAR_UBICACION_CLIENTE = gql`
  mutation ActualizarUbicacionCliente($id: ID!, $input: ActualizarUbicacionClienteInput!) {
    actualizarUbicacionCliente(id: $id, input: $input) {
      id
      nombre
      email
      direccion
      latitudCliente
      longitudCliente
      referenciaDireccion
      fechaActualizacion
    }
  }
`
