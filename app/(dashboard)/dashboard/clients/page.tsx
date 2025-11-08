"use client";

import { useEffect, useState } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { CLIENTES_QUERY } from "@/graphql/queries/clientes";
import { BUSCAR_CLIENTES_QUERY } from "@/graphql/queries/buscarClientes";
import { CREAR_CLIENTE_MUTATION, ACTUALIZAR_CLIENTE_MUTATION, DESACTIVAR_CLIENTE_MUTATION, ACTIVAR_CLIENTE_MUTATION } from "@/graphql/mutations/clientes";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  fechaCreacion: string;
}

interface ClientePage {
  content: Cliente[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [data, setData] = useState<ClientePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ADMIN form state
  const isAdmin = user?.rol === "ADMIN";
  const [form, setForm] = useState<{ id?: string; nombre: string; email: string; telefono: string; direccion: string }>({ 
    nombre: "", 
    email: "", 
    telefono: "", 
    direccion: "" 
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPage = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      if (search.trim().length > 0) {
        const { data } = await apolloClient.query({
          query: BUSCAR_CLIENTES_QUERY,
          variables: { nombre: search.trim(), page: p, size },
          fetchPolicy: "network-only"
        });
        setData((data as any).buscarClientesPorNombre);
      } else {
        const { data } = await apolloClient.query({
          query: CLIENTES_QUERY,
          variables: { page: p, size },
          fetchPolicy: "network-only"
        });
        setData((data as any).clientes);
      }
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "FORBIDDEN") {
        setError("No tienes permisos para ver los clientes");
      } else if (err.graphQLErrors?.[0]?.extensions?.code === "UNAUTHENTICATED") {
        logout();
        router.replace("/sign-in");
        return;
      } else {
        setError("Error al cargar los clientes");
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
    fetchPage(0);
  }, [isAuthenticated, checkAuth, router, search]);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    try {
      await apolloClient.mutate({
        mutation: CREAR_CLIENTE_MUTATION,
        variables: {
          input: {
            nombre: form.nombre,
            email: form.email,
            telefono: form.telefono,
            direccion: form.direccion
          }
        }
      });
      toast.success("Cliente creado exitosamente");
      setForm({ nombre: "", email: "", telefono: "", direccion: "" });
      fetchPage(page);
    } catch (err: any) {
      console.error("Error creating client:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "BAD_REQUEST") {
        const errors = err.graphQLErrors[0].extensions.errors;
        toast.error(`Error de validación: ${errors?.join(", ") || "Datos inválidos"}`);
      } else {
        toast.error("Error al crear el cliente");
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingId) return;
    
    try {
      await apolloClient.mutate({
        mutation: ACTUALIZAR_CLIENTE_MUTATION,
        variables: {
          id: editingId,
          input: {
            nombre: form.nombre,
            email: form.email,
            telefono: form.telefono,
            direccion: form.direccion
          }
        }
      });
      toast.success("Cliente actualizado exitosamente");
      setForm({ nombre: "", email: "", telefono: "", direccion: "" });
      setEditingId(null);
      fetchPage(page);
    } catch (err: any) {
      console.error("Error updating client:", err);
      if (err.graphQLErrors?.[0]?.extensions?.code === "BAD_REQUEST") {
        const errors = err.graphQLErrors[0].extensions.errors;
        toast.error(`Error de validación: ${errors?.join(", ") || "Datos inválidos"}`);
      } else {
        toast.error("Error al actualizar el cliente");
      }
    }
  };

  const handleToggleActive = async (cliente: Cliente) => {
    if (!isAdmin) return;
    
    try {
      const mutation = cliente.activo ? DESACTIVAR_CLIENTE_MUTATION : ACTIVAR_CLIENTE_MUTATION;
      await apolloClient.mutate({
        mutation,
        variables: { id: cliente.id }
      });
      toast.success(`Cliente ${cliente.activo ? 'desactivado' : 'activado'} exitosamente`);
      fetchPage(page);
    } catch (err: any) {
      console.error("Error toggling client status:", err);
      toast.error("Error al cambiar el estado del cliente");
    }
  };

  const startEdit = (cliente: Cliente) => {
    setForm({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion
    });
    setEditingId(cliente.id);
  };

  const cancelEdit = () => {
    setForm({ nombre: "", email: "", telefono: "", direccion: "" });
    setEditingId(null);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
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

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre..."
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

      {/* ADMIN Form */}
      {isAdmin && (
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-medium mb-4">
            {editingId ? "Editar Cliente" : "Crear Cliente"}
          </h2>
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Dirección"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {editingId ? "Actualizar" : "Crear"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading && <p className="text-center py-4">Cargando clientes...</p>}
      {error && <p className="text-center py-4 text-red-600">{error}</p>}
      
      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Teléfono</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Dirección</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Fecha Creación</th>
                  {isAdmin && <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {data.content.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{cliente.nombre}</td>
                    <td className="border border-gray-300 px-4 py-2">{cliente.email}</td>
                    <td className="border border-gray-300 px-4 py-2">{cliente.telefono}</td>
                    <td className="border border-gray-300 px-4 py-2">{cliente.direccion}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        cliente.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {format(new Date(cliente.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    {isAdmin && (
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(cliente)}
                            className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActive(cliente)}
                            className={`px-2 py-1 text-sm rounded ${
                              cliente.activo 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {cliente.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {data.content.length} de {data.totalElements} clientes
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
