"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { INVENTARIOS_QUERY, INVENTARIOS_STOCK_BAJO_QUERY, BUSCAR_INVENTARIOS_POR_NOMBRE_QUERY, MOVIMIENTOS_POR_PRODUCTO_QUERY } from "@/graphql/queries/inventario";
import { CREAR_INVENTARIO_MUTATION, AJUSTAR_INVENTARIO_MUTATION, DESACTIVAR_INVENTARIO_MUTATION } from "@/graphql/mutations/inventario";
import { PRODUCTOS_QUERY } from "@/graphql/queries/productos";
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState<Inventario | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [createForm, setCreateForm] = useState({
    productoId: "",
    cantidadInicial: 0,
    ubicacion: "",
    stockMinimo: 0
  });
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
        setData((data as any).buscarInventariosPorNombre);
      } else if (filter === "low-stock") {
        setData((data as any).inventariosStockBajo);
      } else {
        setData((data as any).inventarios);
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

  const fetchProductos = async () => {
    try {
      const { data } = await apolloClient.query({
        query: PRODUCTOS_QUERY,
        variables: { page: 0, size: 100 },
        fetchPolicy: "network-only"
      });
      // Solo productos activos que no tengan inventario
      const productosActivos = (data as any).productos.content.filter((p: any) => p.activo);
      setProductos(productosActivos);
    } catch (err) {
      console.error("Error fetching products:", err);
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
      setMovimientos((data as any).movimientosPorProducto);
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
    if (isAdmin) {
      fetchProductos();
    }
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

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      await apolloClient.mutate({
        mutation: CREAR_INVENTARIO_MUTATION,
        variables: {
          input: {
            productoId: createForm.productoId,
            cantidadInicial: createForm.cantidadInicial,
            ubicacion: createForm.ubicacion,
            stockMinimo: createForm.stockMinimo
          }
        }
      });

      toast.success("Inventario creado exitosamente");
      setCreateForm({
        productoId: "",
        cantidadInicial: 0,
        ubicacion: "",
        stockMinimo: 0
      });
      setShowCreateForm(false);
      fetchPage(page);
      fetchProductos(); // Refresh products list
    } catch (err: any) {
      console.error("Error creating inventory:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "BAD_REQUEST") {
        const errors = err.graphQLErrors[0].extensions.errors;
        toast.error(`Error de validación: ${errors?.join(", ") || "Datos inválidos"}`);
      } else {
        toast.error("Error al crear el inventario");
      }
    }
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

      {/* ADMIN Create Button */}
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {showCreateForm ? "Cancelar" : "Crear Inventario"}
          </button>
        </div>
      )}

      {/* ADMIN Create Form */}
      {isAdmin && showCreateForm && (
        <div className="mb-8 p-6 border-2 border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="bg-green-600 text-white p-2 rounded-full mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Inventario</h2>
          </div>
          
          <form onSubmit={handleCreateInventory} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Selector de Producto */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Producto a inventariar
                </label>
                <select
                  value={createForm.productoId}
                  onChange={(e) => setCreateForm({ ...createForm, productoId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                  required
                >
                  <option value="">🔍 Seleccionar producto...</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      📦 {producto.nombre} - {producto.sku} (${producto.precio})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad Inicial */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Cantidad inicial en stock
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ej: 50"
                    min="0"
                    value={createForm.cantidadInicial}
                    onChange={(e) => setCreateForm({ ...createForm, cantidadInicial: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
                    required
                  />
                  <span className="absolute left-3 top-3 text-gray-500">📊</span>
                  <span className="absolute right-3 top-3 text-sm text-gray-500">unidades</span>
                </div>
                <p className="text-xs text-gray-600">💡 Cantidad de productos que tienes disponible ahora</p>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ubicación física
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: Almacén A, Estante 2, Nivel 3"
                    value={createForm.ubicacion}
                    onChange={(e) => setCreateForm({ ...createForm, ubicacion: e.target.value })}
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
                    required
                  />
                  <span className="absolute left-3 top-3 text-gray-500">🏪</span>
                </div>
                <p className="text-xs text-gray-600">💡 Dónde están físicamente almacenados los productos</p>
              </div>

              {/* Stock Mínimo */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Stock mínimo (alerta)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ej: 10"
                    min="0"
                    value={createForm.stockMinimo}
                    onChange={(e) => setCreateForm({ ...createForm, stockMinimo: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
                    required
                  />
                  <span className="absolute left-3 top-3 text-gray-500">⚠️</span>
                  <span className="absolute right-3 top-3 text-sm text-gray-500">unidades</span>
                </div>
                <p className="text-xs text-gray-600">💡 Cuando queden estas unidades o menos, te avisaremos para reabastecer</p>
              </div>
            </div>

            {/* Validación visual */}
            {createForm.cantidadInicial > 0 && createForm.stockMinimo > 0 && (
              <div className={`p-4 rounded-lg border-2 ${
                createForm.cantidadInicial <= createForm.stockMinimo 
                  ? 'bg-yellow-50 border-yellow-300' 
                  : 'bg-green-50 border-green-300'
              }`}>
                {createForm.cantidadInicial <= createForm.stockMinimo ? (
                  <div className="flex items-center text-yellow-800">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="font-medium">⚠️ Advertencia: Este inventario aparecerá inmediatamente como "Stock Bajo" porque la cantidad inicial ({createForm.cantidadInicial}) es menor o igual al stock mínimo ({createForm.stockMinimo})</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-800">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">✅ Perfecto: Tendrás {createForm.cantidadInicial - createForm.stockMinimo} unidades de margen antes de la alerta</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear Inventario
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateForm({
                    productoId: "",
                    cantidadInicial: 0,
                    ubicacion: "",
                    stockMinimo: 0
                  });
                }}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-lg transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
