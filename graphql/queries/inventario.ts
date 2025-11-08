import { gql } from "@apollo/client";

export const INVENTARIOS_QUERY = gql`
  query Inventarios($page: Int, $size: Int) {
    inventarios(page: $page, size: $size) {
      content {
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
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const INVENTARIOS_ACTIVOS_QUERY = gql`
  query InventariosActivos($page: Int, $size: Int) {
    inventariosActivos(page: $page, size: $size) {
      content {
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
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const INVENTARIOS_STOCK_BAJO_QUERY = gql`
  query InventariosStockBajo($page: Int, $size: Int) {
    inventariosStockBajo(page: $page, size: $size) {
      content {
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
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const BUSCAR_INVENTARIOS_POR_NOMBRE_QUERY = gql`
  query BuscarInventariosPorNombre($nombre: String!, $page: Int, $size: Int) {
    buscarInventariosPorNombre(nombre: $nombre, page: $page, size: $size) {
      content {
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
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const INVENTARIO_POR_PRODUCTO_QUERY = gql`
  query InventarioPorProducto($productoId: ID!) {
    inventarioPorProducto(productoId: $productoId) {
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

export const MOVIMIENTOS_POR_PRODUCTO_QUERY = gql`
  query MovimientosPorProducto($productoId: ID!, $page: Int, $size: Int) {
    movimientosPorProducto(productoId: $productoId, page: $page, size: $size) {
      content {
        id
        producto {
          id
          nombre
          sku
        }
        tipo
        cantidad
        motivo
        fechaMovimiento
        cantidadAnterior
        cantidadNueva
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;
