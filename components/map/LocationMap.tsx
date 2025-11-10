'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { LatLngExpression } from 'leaflet'
import { DEFAULT_PROVIDER, MAP_PROVIDERS } from './map-providers'

// Importar dinámicamente para evitar problemas de SSR con Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Componente para manejar clicks en el mapa
function MapClickHandler({ 
  onLocationSelect, 
  onTempLocationSet,
  readonly 
}: { 
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  onTempLocationSet?: (location: { lat: number; lng: number }) => void
  readonly?: boolean 
}) {
  const [useMapEvents, setUseMapEvents] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-leaflet').then((mod) => {
        setUseMapEvents(() => mod.useMapEvents)
      })
    }
  }, [])

  if (!useMapEvents) return null

  const MapEventsComponent = () => {
    const map = useMapEvents({
      click: (e: any) => {
        if (!readonly && onLocationSelect) {
          const { lat, lng } = e.latlng
          // Feedback inmediato - marcador temporal
          onTempLocationSet?.({ lat, lng })
          // Callback al padre
          onLocationSelect({ lat, lng })
        }
      }
    })
    
    // Cambiar cursor a pointer cuando no es readonly
    useEffect(() => {
      if (map && !readonly) {
        const container = map.getContainer()
        container.style.cursor = 'crosshair'
      }
    }, [map])
    
    return null
  }

  return <MapEventsComponent />
}

// Coordenadas de Santa Cruz de la Sierra, Bolivia
const SANTA_CRUZ_CENTER: LatLngExpression = [-17.783327, -63.182140]
const DEFAULT_ZOOM = 13

interface LocationMapProps {
  selectedLocation?: {
    lat: number
    lng: number
    address?: string
  }
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  height?: string
  className?: string
  readonly?: boolean
}

export default function LocationMap({
  selectedLocation,
  onLocationSelect,
  height = "400px",
  className = "",
  readonly = false
}: LocationMapProps) {
  const [mounted, setMounted] = useState(false)
  const [map, setMap] = useState<any>(null)
  // Estado para marcador temporal (feedback inmediato)
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(null)
  // Estado para manejar errores de carga de tiles
  const [tileError, setTileError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Sincronizar tempLocation con selectedLocation
  useEffect(() => {
    if (selectedLocation) {
      setTempLocation(null) // Limpiar temporal cuando el padre actualiza
    }
  }, [selectedLocation])

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      // Importar Leaflet solo en el cliente
      import('leaflet').then((L) => {
        // Eliminar iconos por defecto para evitar errores 404
        delete (L.Icon.Default.prototype as any)._getIconUrl
        
        // Configurar icono por defecto con un pin SVG inline
        L.Icon.Default.mergeOptions({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <!-- Sombra -->
              <ellipse cx="20" cy="47" rx="10" ry="3" fill="rgba(0,0,0,0.2)"/>
              <!-- Pin principal -->
              <path d="M20 0 C9 0 0 9 0 20 C0 28 20 50 20 50 C20 50 40 28 40 20 C40 9 31 0 20 0 Z" 
                    fill="#ef4444" stroke="white" stroke-width="2"/>
              <!-- Círculo interno -->
              <circle cx="20" cy="18" r="7" fill="white"/>
              <!-- Punto central -->
              <circle cx="20" cy="18" r="4" fill="#ef4444"/>
            </svg>
          `),
          iconRetinaUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="47" rx="10" ry="3" fill="rgba(0,0,0,0.2)"/>
              <path d="M20 0 C9 0 0 9 0 20 C0 28 20 50 20 50 C20 50 40 28 40 20 C40 9 31 0 20 0 Z" 
                    fill="#ef4444" stroke="white" stroke-width="2"/>
              <circle cx="20" cy="18" r="7" fill="white"/>
              <circle cx="20" cy="18" r="4" fill="#ef4444"/>
            </svg>
          `),
          shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          iconSize: [40, 50],
          iconAnchor: [20, 50],
          popupAnchor: [0, -50],
          shadowSize: [0, 0]
        })
      })
    }
  }, [mounted])


  if (!mounted) {
    return (
      <div 
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    )
  }

  // Determinar qué ubicación mostrar (prioridad: selectedLocation > tempLocation)
  const displayLocation = selectedLocation || tempLocation

  return (
    <div className={`rounded-lg overflow-hidden border relative ${className}`} style={{ height }}>
      <MapContainer
        center={displayLocation ? [displayLocation.lat, displayLocation.lng] : SANTA_CRUZ_CENTER}
        zoom={displayLocation ? 15 : DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Tile Layer con fallback automático */}
        <TileLayer
          attribution={tileError ? MAP_PROVIDERS.OSM_STANDARD.attribution : DEFAULT_PROVIDER.attribution}
          url={tileError ? MAP_PROVIDERS.OSM_STANDARD.url : DEFAULT_PROVIDER.url}
          maxZoom={tileError ? MAP_PROVIDERS.OSM_STANDARD.maxZoom : DEFAULT_PROVIDER.maxZoom}
          {...(tileError ? 
            (MAP_PROVIDERS.OSM_STANDARD.subdomains ? { subdomains: MAP_PROVIDERS.OSM_STANDARD.subdomains } : {}) : 
            (DEFAULT_PROVIDER.subdomains ? { subdomains: DEFAULT_PROVIDER.subdomains } : {})
          )}
          eventHandlers={{
            tileerror: () => {
              console.warn('Error cargando tiles, cambiando a OpenStreetMap...')
              setTileError(true)
            }
          }}
        />
        
        <MapClickHandler 
          onLocationSelect={onLocationSelect} 
          onTempLocationSet={setTempLocation}
          readonly={readonly} 
        />
        
        {/* Mostrar marcador temporal o definitivo */}
        {displayLocation && (
          <Marker position={[displayLocation.lat, displayLocation.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">
                  {selectedLocation ? '📍 Ubicación seleccionada' : '⏳ Ubicación temporal'}
                </p>
                {selectedLocation?.address && (
                  <p className="text-gray-600 mt-1">{selectedLocation.address}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Lat:</strong> {displayLocation.lat.toFixed(6)}<br/>
                  <strong>Lng:</strong> {displayLocation.lng.toFixed(6)}
                </p>
                {!selectedLocation && tempLocation && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    ⚠️ Click procesando...
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {!readonly && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border text-sm text-gray-700 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span>Haz clic en el mapa para seleccionar ubicación</span>
        </div>
      )}
      
      {displayLocation && !readonly && (
        <div className="absolute top-4 right-4 bg-green-500/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span>Ubicación marcada</span>
        </div>
      )}
      
      {tileError && (
        <div className="absolute top-4 left-4 bg-amber-500/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>Usando mapa de respaldo</span>
        </div>
      )}
    </div>
  )
}
