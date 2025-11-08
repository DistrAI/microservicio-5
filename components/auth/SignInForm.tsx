"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apolloClient } from "@/lib/apollo-client";
import { LOGIN_MUTATION } from "@/graphql/mutations/auth";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthResponse } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function SignInForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { data: responseData } = await apolloClient.mutate<{ login: AuthResponse }>({
        mutation: LOGIN_MUTATION,
        variables: { email: data.email, password: data.password },
      });
      if (responseData?.login) {
        const authResponse: AuthResponse = responseData.login;
        login(authResponse);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto border rounded-lg p-6 bg-white shadow">
      <h2 className="text-2xl font-semibold mb-1">Iniciar sesión</h2>
      <p className="text-sm text-gray-500 mb-6">Accede con tu cuenta</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" type="email" placeholder="admin@distria.com" className="mt-1 w-full border rounded px-3 py-2"
            {...register("email")}/>
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
          <input id="password" type="password" placeholder="••••••••" className="mt-1 w-full border rounded px-3 py-2"
            {...register("password")}/>
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-black text-white rounded py-2">
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        ¿No tienes cuenta? <a href="/sign-up" className="text-blue-600 hover:underline">Regístrate</a>
      </div>
    </div>
  );
}
