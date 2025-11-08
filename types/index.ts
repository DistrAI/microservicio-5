export enum Rol {
  ADMIN = "ADMIN",
  REPARTIDOR = "REPARTIDOR",
}

export interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: Rol;
  telefono?: string;
  activo: boolean;
  fechaCreacion?: string;
  ultimoAcceso?: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  userId: string;
  email: string;
  nombreCompleto: string;
  rol: Rol;
}
