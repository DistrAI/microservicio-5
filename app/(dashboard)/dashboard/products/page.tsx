"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { PRODUCTOS_QUERY } from "@/graphql/queries/productos";
import { BUSCAR_PRODUCTOS_QUERY } from "@/graphql/queries/buscarProductos";
import { CREAR_PRODUCTO_MUTATION, ACTUALIZAR_PRODUCTO_MUTATION, DESACTIVAR_PRODUCTO_MUTATION, ACTIVAR_PRODUCTO_MUTATION } from "@/graphql/mutations/productos";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface Producto {
  id: string;
  nombre: string;
  sku: string;
  precio: number;
  activo: boolean;
}

interface ProductoPage {
  content: Producto[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [data, setData] = useState<ProductoPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ADMIN form state
  const isAdmin = user?.rol === "ADMIN";
  const [form, setForm] = useState<{ id?: string; nombre: string; sku: string; precio: string; descripcion?: string }>({ nombre: "", sku: "", precio: "", descripcion: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPage = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      if (search.trim().length > 0) {
        const { data } = await apolloClient.query<{ buscarProductosPorNombre: ProductoPage}>({
          query: BUSCAR_PRODUCTOS_QUERY,
          variables: { nombre: search.trim(), page: p, size },
          fetchPolicy: "no-cache",
        });
        if (data && data.buscarProductosPorNombre) setData(data.buscarProductosPorNombre);
      } else {
        const { data } = await apolloClient.query<{ productos: ProductoPage}>({
          query: PRODUCTOS_QUERY,
          variables: { page: p, size },
          fetchPolicy: "no-cache",
        });
        if (data && data.productos) setData(data.productos);
      }
    } catch (e: any) {
      setError("No se pudieron cargar los productos");
      if (e?.message?.includes("acceso") || e?.message?.includes("autoriz")) {
        logout();
        router.replace("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isAuthenticated, search]);

  const resetForm = () => {
    setForm({ nombre: "", sku: "", precio: "", descripcion: "" });
    setEditingId(null);
  };

  const submitForm = async () => {
    try {
      setLoading(true);
      setError(null);
      const variables: any = {
        input: {
          nombre: form.nombre,
          sku: form.sku,
          descripcion: form.descripcion || null,
          precio: parseFloat(form.precio),
        },
      };
      if (editingId) {
        await apolloClient.mutate({ mutation: ACTUALIZAR_PRODUCTO_MUTATION, variables: { id: editingId, input: variables.input } });
      } else {
        await apolloClient.mutate({ mutation: CREAR_PRODUCTO_MUTATION, variables });
      }
      resetForm();
      fetchPage(page);
    } catch (e: any) {
      setError(e?.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (p: Producto) => {
    try {
      setLoading(true);
      setError(null);
      if (p.activo) {
        await apolloClient.mutate({ mutation: DESACTIVAR_PRODUCTO_MUTATION, variables: { id: p.id } });
      } else {
        await apolloClient.mutate({ mutation: ACTIVAR_PRODUCTO_MUTATION, variables: { id: p.id } });
      }
      fetchPage(page);
    } catch (e: any) {
      setError(e?.message || "Error al cambiar estado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Productos</h1>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => { setPage(0); setSearch(e.target.value); }}
            placeholder="Buscar por nombre"
            className="border rounded px-2 py-1 text-sm"
          />
          <div className="text-sm text-gray-500">Página {data ? data.page + 1 : page + 1} de {data?.totalPages ?? 1}</div>
        </div>
      </div>

      {isAdmin && (
        <div className="mb-4 border rounded p-3">
          <h2 className="font-medium mb-2">{editingId ? "Editar producto" : "Crear producto"}</h2>
          <div className="grid md:grid-cols-4 gap-2">
            <input className="border rounded px-2 py-1" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Precio" type="number" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 border rounded" onClick={submitForm} disabled={loading || !form.nombre || !form.sku || !form.precio}>Guardar</button>
            {editingId && <button className="px-3 py-1 border rounded" onClick={resetForm}>Cancelar</button>}
          </div>
        </div>
      )}

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">SKU</th>
                <th className="text-left p-2">Precio</th>
                <th className="text-left p-2">Activo</th>
                {isAdmin && <th className="text-left p-2">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {data?.content?.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">${p.precio.toFixed(2)}</td>
                  <td className="p-2">
                    <span className={p.activo ? "text-green-600" : "text-red-600"}>
                      {p.activo ? "Sí" : "No"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-2 flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => { setEditingId(p.id); setForm({ id: p.id, nombre: p.nombre, sku: p.sku, precio: String(p.precio), descripcion: "" }); }}>Editar</button>
                      <button className="px-2 py-1 border rounded" onClick={() => toggleActivo(p)}>
                        {p.activo ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {data?.content?.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={4}>Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page <= 0}
        >
          Anterior
        </button>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => (data && p + 1 < data.totalPages ? p + 1 : p))}
          disabled={!data || page + 1 >= (data.totalPages || 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
