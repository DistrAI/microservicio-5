import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import type { AuthResponse, Usuario, Rol } from '@/types'

interface AuthState {
  user: Usuario | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (authResponse: AuthResponse) => void
  logout: () => void
  setUser: (user: Usuario) => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (authResponse: AuthResponse) => {
        const { token, userId, email, nombreCompleto, rol } = authResponse
        Cookies.set('auth_token', token, { expires: 1 })
        const user: Usuario = {
          id: userId,
          nombreCompleto,
          email,
          rol,
          activo: true,
        }
        set({ user, token, isAuthenticated: true, isLoading: false })
      },

      logout: () => {
        Cookies.remove('auth_token')
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },

      setUser: (user: Usuario) => set({ user }),

      checkAuth: () => {
        const token = Cookies.get('auth_token')
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          return
        }
        try {
          const decoded: any = jwtDecode(token)
          const now = Date.now() / 1000
          if (decoded.exp && decoded.exp < now) {
            get().logout()
            return
          }
          const user: Usuario = {
            id: decoded.userId,
            nombreCompleto: decoded.sub || '',
            email: decoded.sub,
            rol: decoded.rol as Rol,
            activo: true,
          }
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch (e) {
          get().logout()
        }
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user }) }
  )
)
