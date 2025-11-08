"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apolloClient } from "@/lib/apollo-client";
import { CREATE_USER_MUTATION, LOGIN_MUTATION } from "@/graphql/mutations/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { Rol, type AuthResponse } from "@/types";

const signUpSchema = z
  .object({
    nombreCompleto: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    telefono: z.string().optional(),
    rol: z.nativeEnum(Rol),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema), defaultValues: { rol: Rol.ADMIN } });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const { data: userData } = await apolloClient.mutate<{ crearUsuario: { id: string } }>({
        mutation: CREATE_USER_MUTATION,
        variables: {
          input: {
            nombreCompleto: data.nombreCompleto,
            email: data.email,
            password: data.password,
            telefono: data.telefono ?? null,
            rol: data.rol,
          },
        },
      });

      if (userData?.crearUsuario) {
        const { data: loginData } = await apolloClient.mutate<{ login: AuthResponse }>({
          mutation: LOGIN_MUTATION,
          variables: { email: data.email, password: data.password },
        });
        if (loginData?.login) {
          const auth: AuthResponse = loginData.login;
          login(auth);
          router.push("/dashboard");
        }
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo crear la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto border rounded-lg p-6 bg-white shadow">
      <h2 className="text-2xl font-semibold mb-1">Crear cuenta</h2>
      <p className="text-sm text-gray-500 mb-6">Regístrate para comenzar</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre completo</label>
          <input className="mt-1 w-full border rounded px-3 py-2" {...register("nombreCompleto")} />
          {errors.nombreCompleto && <p className="text-sm text-red-600 mt-1">{errors.nombreCompleto.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="mt-1 w-full border rounded px-3 py-2" {...register("email")} />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono (opcional)</label>
          <input className="mt-1 w-full border rounded px-3 py-2" {...register("telefono")} />
        </div>
        <div>
          <label className="block text-sm font-medium">Rol</label>
          <select className="mt-1 w-full border rounded px-3 py-2" {...register("rol")}
            onChange={(e) => setValue("rol", e.target.value as unknown as Rol)}>
            <option value={Rol.ADMIN}>ADMIN</option>
            <option value={Rol.REPARTIDOR}>REPARTIDOR</option>
          </select>
          {errors.rol && <p className="text-sm text-red-600 mt-1">{errors.rol.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input type="password" className="mt-1 w-full border rounded px-3 py-2" {...register("password")} />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Confirmar contraseña</label>
          <input type="password" className="mt-1 w-full border rounded px-3 py-2" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-black text-white rounded py-2">
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        ¿Ya tienes cuenta? <a href="/sign-in" className="text-blue-600 hover:underline">Inicia sesión</a>
      </div>
    </div>
  );
}
