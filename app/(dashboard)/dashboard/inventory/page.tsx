"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { INVENTARIOS_QUERY, INVENTARIOS_STOCK_BAJO_QUERY, BUSCAR_INVENTARIOS_POR_NOMBRE_QUERY, MOVIMIENTOS_POR_PRODUCTO_QUERY } from "@/graphql/queries/inventario";
import { AJUSTAR_INVENTARIO_MUTATION, DESACTIVAR_INVENTARIO_MUTATION } from "@/graphql/mutations/inventario";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Producto {
  id: string;
  nombre: string;
  sku: string;
  precio: number;
}

interface Inventario {
  id: string;
  producto: Producto;
  cantidad: number;
  ubicacion: string;
  stockMinimo: number;
  activo: boolean;
  fechaCreacion: string;
  fechaUltimaActualizacion?: string;
}

interface MovimientoInventario {
  id: string;
  producto: Producto;
  tipo: string;
  cantidad: number;
  motivo?: string;
  fechaMovimiento: string;
  cantidadAnterior: number;
  cantidadNueva: number;
}

interface InventarioPage {
  content: Inventario[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

interface MovimientoPage {
  content: MovimientoInventario[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

const TIPOS_MOVIMIENTO = [
  { value: "ENTRADA", label: "Entrada", color: "bg-green-100 text-green-800" },
  { value: "SALIDA", label: "Salida", color: "bg-red-100 text-red-800" },
  { value: "AJUSTE", label: "Ajuste", color: "bg-blue-100 text-blue-800" }
];

export default function InventoryPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [data, setData] = useState<InventarioPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low-stock">("all");

  // ADMIN form state
  const isAdmin = user?.rol === "ADMIN";
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState<Inventario | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    productoId: "",
    cantidad: 0,
    motivo: "",
    ubicacion: "",
    stockMinimo: 0
  });

  // Movimientos state
  const [showMovimientos, setShowMovimientos] = useState(false);
  const [movimientos, setMovimientos] = useState<MovimientoPage | null>(null);
  const [movimientosLoading, setMovimientosLoading] = useState(false);

  const fetchPage = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      let query = INVENTARIOS_QUERY;
      let variables: any = { page: p, size };

      if (search.trim().length > 0) {
        query = BUSCAR_INVENTARIOS_POR_NOMBRE_QUERY;
        variables.nombre = search.trim();
      } else if (filter === "low-stock") {
        query = INVENTARIOS_STOCK_BAJO_QUERY;
      }

      const { data } = await apolloClient.query({
        query,
        variables,
        fetchPolicy: "network-only"
      });

      if (search.trim().length > 0) {
        setData(data.buscarInventariosPorNombre);
      } else if (filter === "low-stock") {
        setData(data.inventariosStockBajo);
      } else {
        setData(data.inventarios);
      }
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "FORBIDDEN") {
        setError("No tienes permisos para ver el inventario");
      } else if (err.graphQLErrors?.[0]?.extensions?.code === "UNAUTHENTICATED") {
        logout();
        router.replace("/sign-in");
        return;
      } else {
        setError("Error al cargar el inventario");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMovimientos = async (productoId: string) => {
    setMovimientosLoading(true);
    try {
      const { data } = await apolloClient.query({
        query: MOVIMIENTOS_POR_PRODUCTO_QUERY,
        variables: { productoId, page: 0, size: 20 },
        fetchPolicy: "network-only"
      });
      setMovimientos(data.movimientosPorProducto);
    } catch (err) {
      console.error("Error fetching movements:", err);
      toast.error("Error al cargar los movimientos");
    } finally {
      setMovimientosLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    fetchPage(0);
  }, [isAuthenticated, checkAuth, router, search, filter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPage(page);
    }
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchPage(0);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(0);
  };

  const handleFilterChange = (newFilter: "all" | "low-stock") => {
    setFilter(newFilter);
    setPage(0);
  };

  const startAdjust = (inventario: Inventario) => {
    setSelectedInventario(inventario);
    setAdjustForm({
      productoId: inventario.producto.id,
      cantidad: 0,
      motivo: "",
      ubicacion: inventario.ubicacion,
      stockMinimo: inventario.stockMinimo
    });
    setShowAdjustForm(true);
  };

  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedInventario) return;

    if (adjustForm.cantidad === 0) {
      toast.error("La cantidad debe ser diferente de 0");
      return;
    }

    try {
      await apolloClient.mutate({
        mutation: AJUSTAR_INVENTARIO_MUTATION,
        variables: {
          input: {
            productoId: adjustForm.productoId,
            cantidad: adjustForm.cantidad,
            motivo: adjustForm.motivo || null,
            ubicacion: adjustForm.ubicacion || null,
            stockMinimo: adjustForm.stockMinimo || null
          }
        }
      });

      toast.success("Inventario ajustado exitosamente");
      setAdjustForm({
        productoId: "",
        cantidad: 0,
        motivo: "",
        ubicacion: "",
        stockMinimo: 0
      });
      setSelectedInventario(null);
      setShowAdjustForm(false);
      fetchPage(page);
    } catch (err: any) {
      console.error("Error adjusting inventory:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "BAD_REQUEST") {
        const errors = err.graphQLErrors[0].extensions.errors;
        toast.error(`Error de validación: ${errors?.join(", ") || "Datos inválidos"}`);
      } else {
        toast.error("Error al ajustar el inventario");
      }
    }
  };

  const handleDesactivarInventario = async (productoId: string) => {
    if (!isAdmin) return;

    try {
      await apolloClient.mutate({
        mutation: DESACTIVAR_INVENTARIO_MUTATION,
        variables: { productoId }
      });
      toast.success("Inventario desactivado exitosamente");
      fetchPage(page);
    } catch (err: any) {
      console.error("Error deactivating inventory:", err);
      toast.error("Error al desactivar el inventario");
    }
  };

  const showMovimientosModal = (inventario: Inventario) => {
    setSelectedInventario(inventario);
    setShowMovimientos(true);
    fetchMovimientos(inventario.producto.id);
  };

  const getTipoMovimientoConfig = (tipo: string) => {
    return TIPOS_MOVIMIENTO.find(t => t.value === tipo) || TIPOS_MOVIMIENTO[0];
  };

  const getStockStatus = (inventario: Inventario) => {
    if (inventario.cantidad === 0) {
      return { label: "Sin Stock", color: "bg-red-100 text-red-800" };
    } else if (inventario.cantidad <= inventario.stockMinimo) {
      return { label: "Stock Bajo", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Stock OK", color: "bg-green-100 text-green-800" };
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Inventario</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            onClick={() => { logout(); router.replace("/sign-in"); }}
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre de producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Buscar
          </button>
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Limpiar
            </button>
          )}
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-1 rounded text-sm ${
              filter === "all" ? "bg-blue-600 text-white" : "border hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => handleFilterChange("low-stock")}
            className={`px-3 py-1 rounded text-sm ${
              filter === "low-stock" ? "bg-blue-600 text-white" : "border hover:bg-gray-50"
            }`}
          >
            Stock Bajo
          </button>
        </div>
      </div>

      {/* ADMIN Adjust Form Modal */}
      {isAdmin && showAdjustForm && selectedInventario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-medium mb-4">
              Ajustar Inventario: {selectedInventario.producto.nombre}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Stock actual: {selectedInventario.cantidad} unidades
            </p>
            <form onSubmit={handleAdjustInventory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cantidad (+ para agregar, - para quitar)
                </label>
                <input
                  type="number"
                  value={adjustForm.cantidad}
                  onChange={(e) => setAdjustForm({ ...adjustForm, cantidad: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivo</label>
                <input
                  type="text"
                  placeholder="Motivo del ajuste (opcional)"
                  value={adjustForm.motivo}
                  onChange={(e) => setAdjustForm({ ...adjustForm, motivo: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input
                  type="text"
                  value={adjustForm.ubicacion}
                  onChange={(e) => setAdjustForm({ ...adjustForm, ubicacion: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={adjustForm.stockMinimo}
                  onChange={(e) => setAdjustForm({ ...adjustForm, stockMinimo: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Ajustar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustForm(false);
                    setSelectedInventario(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movimientos Modal */}
      {showMovimientos && selectedInventario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">
                Movimientos: {selectedInventario.producto.nombre}
              </h2>
              <button
                onClick={() => {
                  setShowMovimientos(false);
                  setSelectedInventario(null);
                  setMovimientos(null);
                }}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
            
            {movimientosLoading && <p className="text-center py-4">Cargando movimientos...</p>}
            
            {movimientos && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Cantidad</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Anterior</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Nueva</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.content.map((mov) => {
                      const tipoConfig = getTipoMovimientoConfig(mov.tipo);
                      return (
                        <tr key={mov.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            {format(new Date(mov.fechaMovimiento), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm ${tipoConfig.color}`}>
                              {tipoConfig.label}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {mov.tipo === "SALIDA" ? "-" : "+"}{mov.cantidad}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{mov.cantidadAnterior}</td>
                          <td className="border border-gray-300 px-4 py-2">{mov.cantidadNueva}</td>
                          <td className="border border-gray-300 px-4 py-2">{mov.motivo || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {loading && <p className="text-center py-4">Cargando inventario...</p>}
      {error && <p className="text-center py-4 text-red-600">{error}</p>}
      
      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Producto</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">SKU</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Stock Actual</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Stock Mínimo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ubicación</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Última Actualización</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((inventario) => {
                  const stockStatus = getStockStatus(inventario);
                  return (
                    <tr key={inventario.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <div className="font-medium">{inventario.producto.nombre}</div>
                          <div className="text-sm text-gray-500">${inventario.producto.precio}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{inventario.producto.sku}</td>
                      <td className="border border-gray-300 px-4 py-2 font-medium text-lg">
                        {inventario.cantidad}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{inventario.stockMinimo}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{inventario.ubicacion}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {inventario.fechaUltimaActualizacion 
                          ? format(new Date(inventario.fechaUltimaActualizacion), 'dd/MM/yyyy HH:mm', { locale: es })
                          : format(new Date(inventario.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })
                        }
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => showMovimientosModal(inventario)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Ver Movimientos
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => startAdjust(inventario)}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Ajustar Stock
                              </button>
                              {inventario.activo && (
                                <button
                                  onClick={() => handleDesactivarInventario(inventario.producto.id)}
                                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Desactivar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {data.content.length} de {data.totalElements} productos en inventario
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {page + 1} de {data.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                disabled={page >= data.totalPages - 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
