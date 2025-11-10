'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import EmpresaLocationForm from '@/components/map/EmpresaLocationForm'
import { apolloClient } from '@/lib/apollo-client'
import { gql } from '@apollo/client'
import { Loader2 } from 'lucide-react'

const GET_USER_LOCATION = gql`
  query GetUser($id: ID!) {
    usuario(id: $id) {
      id
      nombreCompleto
      email
      direccionEmpresa
      latitudEmpresa
      longitudEmpresa
      nombreEmpresa
    }
  }
`

interface UserLocation {
  id: string
  nombreCompleto: string
  email: string
  direccionEmpresa?: string
  latitudEmpresa?: number
  longitudEmpresa?: number
  nombreEmpresa?: string
}

export default function EmpresaUbicacionPage() {
  const { user } = useAuthStore()
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user?.id) return

      try {
        const { data }: any = await apolloClient.query({
          query: GET_USER_LOCATION,
          variables: { id: user.id }
        })

        if (data?.usuario) {
          setUserLocation(data.usuario)
        }
      } catch (err: any) {
        console.error('Error fetching user location:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserLocation()
  }, [user?.id])

  const handleSuccess = () => {
    // Refetch user data after successful update
    if (user?.id) {
      apolloClient.query({
        query: GET_USER_LOCATION,
        variables: { id: user.id }
      }).then(({ data }: any) => {
        if (data?.usuario) {
          setUserLocation(data.usuario)
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando información de ubicación...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error al cargar la información</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No se pudo obtener la información del usuario</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ubicación de Empresa</h1>
        <p className="text-gray-600 mt-2">
          Configura la ubicación exacta de tu empresa en Santa Cruz de la Sierra para optimizar las rutas de entrega.
        </p>
      </div>

      <EmpresaLocationForm
        userId={user.id}
        initialData={userLocation ? {
          nombreEmpresa: userLocation.nombreEmpresa,
          direccionEmpresa: userLocation.direccionEmpresa,
          latitudEmpresa: userLocation.latitudEmpresa,
          longitudEmpresa: userLocation.longitudEmpresa,
        } : undefined}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
