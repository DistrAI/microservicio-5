'use client'

import { useState, useEffect } from 'react'
import { apolloClient } from '@/lib/apollo-client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { MapPin, Building2, Save, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import LocationMap from './LocationMap'
import { ACTUALIZAR_UBICACION_EMPRESA } from '@/graphql/mutations/ubicacion'

const empresaLocationSchema = z.object({
  nombreEmpresa: z.string().min(1, 'El nombre de la empresa es obligatorio'),
  direccionEmpresa: z.string().min(1, 'La dirección es obligatoria'),
  latitudEmpresa: z.number().min(-90).max(90),
  longitudEmpresa: z.number().min(-180).max(180),
})

type EmpresaLocationForm = z.infer<typeof empresaLocationSchema>

interface EmpresaLocationFormProps {
  userId: string
  initialData?: {
    nombreEmpresa?: string
    direccionEmpresa?: string
    latitudEmpresa?: number
    longitudEmpresa?: number
  }
  onSuccess?: () => void
}

export default function EmpresaLocationForm({ 
  userId, 
  initialData, 
  onSuccess 
}: EmpresaLocationFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    address?: string
  } | undefined>(
    initialData?.latitudEmpresa && initialData?.longitudEmpresa
      ? {
          lat: initialData.latitudEmpresa,
          lng: initialData.longitudEmpresa,
          address: initialData.direccionEmpresa
        }
      : undefined
  )

  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<EmpresaLocationForm>({
    resolver: zodResolver(empresaLocationSchema),
    defaultValues: {
      nombreEmpresa: initialData?.nombreEmpresa || '',
      direccionEmpresa: initialData?.direccionEmpresa || '',
      latitudEmpresa: initialData?.latitudEmpresa || -17.783327,
      longitudEmpresa: initialData?.longitudEmpresa || -63.182140,
    }
  })

  const watchedLat = watch('latitudEmpresa')
  const watchedLng = watch('longitudEmpresa')

  useEffect(() => {
    if (watchedLat && watchedLng) {
      setSelectedLocation({
        lat: watchedLat,
        lng: watchedLng,
        address: watch('direccionEmpresa')
      })
    }
  }, [watchedLat, watchedLng, watch])

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation({ ...location, address: watch('direccionEmpresa') })
    setValue('latitudEmpresa', location.lat, { shouldDirty: true })
    setValue('longitudEmpresa', location.lng, { shouldDirty: true })
  }

  const onSubmit = async (data: EmpresaLocationForm) => {
    setLoading(true)
    try {
      await apolloClient.mutate({
        mutation: ACTUALIZAR_UBICACION_EMPRESA,
        variables: {
          id: userId,
          input: {
            nombreEmpresa: data.nombreEmpresa,
            direccionEmpresa: data.direccionEmpresa,
            latitudEmpresa: data.latitudEmpresa,
            longitudEmpresa: data.longitudEmpresa,
          }
        }
      })
      toast.success('Ubicación de empresa actualizada exitosamente')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al actualizar ubicación:', error)
      toast.error(`Error al actualizar ubicación: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Configuración de Ubicación de Empresa
          </CardTitle>
          <CardDescription>
            Configura la ubicación exacta de tu empresa en Santa Cruz de la Sierra para optimizar las rutas de entrega.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
                <Input
                  id="nombreEmpresa"
                  placeholder="Ej: Mi PYME Distribuidora"
                  {...register('nombreEmpresa')}
                />
                {errors.nombreEmpresa && (
                  <p className="text-sm text-red-500">{errors.nombreEmpresa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccionEmpresa">Dirección Completa</Label>
                <Input
                  id="direccionEmpresa"
                  placeholder="Ej: Av. Cristo Redentor #123, Santa Cruz"
                  {...register('direccionEmpresa')}
                  onChange={(e) => {
                    register('direccionEmpresa').onChange(e)
                    if (selectedLocation) {
                      setSelectedLocation({
                        ...selectedLocation,
                        address: e.target.value
                      })
                    }
                  }}
                />
                {errors.direccionEmpresa && (
                  <p className="text-sm text-red-500">{errors.direccionEmpresa.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitudEmpresa">Latitud</Label>
                <Input
                  id="latitudEmpresa"
                  type="number"
                  step="any"
                  placeholder="-17.783327"
                  {...register('latitudEmpresa', { valueAsNumber: true })}
                />
                {errors.latitudEmpresa && (
                  <p className="text-sm text-red-500">{errors.latitudEmpresa.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitudEmpresa">Longitud</Label>
                <Input
                  id="longitudEmpresa"
                  type="number"
                  step="any"
                  placeholder="-63.182140"
                  {...register('longitudEmpresa', { valueAsNumber: true })}
                />
                {errors.longitudEmpresa && (
                  <p className="text-sm text-red-500">{errors.longitudEmpresa.message}</p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !isDirty}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Ubicación
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seleccionar en el Mapa
          </CardTitle>
          <CardDescription>
            Haz clic en el mapa para seleccionar la ubicación exacta de tu empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationMap
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            height="500px"
            className="w-full"
          />
          {selectedLocation && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Ubicación seleccionada:</strong><br />
                Latitud: {selectedLocation.lat.toFixed(6)}<br />
                Longitud: {selectedLocation.lng.toFixed(6)}
                {selectedLocation.address && (
                  <>
                    <br />
                    Dirección: {selectedLocation.address}
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
