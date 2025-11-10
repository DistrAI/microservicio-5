# 🗺️ Guía para Cambiar el Proveedor de Mapas

## 🚀 Cambio Rápido (30 segundos)

Para cambiar entre los mapas disponibles, edita `map-providers.ts`:

```typescript
// Línea 115 - Cambia DEFAULT_PROVIDER
export const DEFAULT_PROVIDER: MapProvider = MAP_PROVIDERS.CARTO_VOYAGER

// Opciones disponibles:
// CARTO_VOYAGER    ← Actual (colorido, moderno) ⭐
// CARTO_POSITRON   ← Minimalista blanco/gris
// CARTO_DARK       ← Modo oscuro
// ESRI_WORLD_IMAGERY ← Vista satelital 🛰️
// ESRI_WORLD_STREET  ← Calles ESRI
// STAMEN_TERRAIN     ← Con relieve
// STAMEN_TONER       ← Blanco y negro artístico
```

**Ejemplo - Cambiar a vista satelital:**
```typescript
export const DEFAULT_PROVIDER: MapProvider = MAP_PROVIDERS.ESRI_WORLD_IMAGERY
```

---

## 📊 Comparación de Proveedores

| Provider | Velocidad | Estilo | Costo | Recomendado Para |
|----------|-----------|--------|-------|------------------|
| **CARTO_VOYAGER** ⭐ | ⚡⚡⚡⚡⚡ | Colorido | Gratis | General, urbano |
| **CARTO_POSITRON** | ⚡⚡⚡⚡⚡ | Minimalista | Gratis | Apps profesionales |
| **CARTO_DARK** | ⚡⚡⚡⚡⚡ | Oscuro | Gratis | Dark mode |
| **ESRI_WORLD_IMAGERY** | ⚡⚡⚡⚡ | Satélite | Gratis | Ver edificios reales |
| **ESRI_WORLD_STREET** | ⚡⚡⚡⚡ | Calles | Gratis | Navegación |
| **STAMEN_TERRAIN** | ⚡⚡⚡ | Relieve | Gratis | Áreas rurales |
| **OSM_STANDARD** | ⚡⚡ | Clásico | Gratis | No recomendado |

---

## 🌍 Opción: Integrar Google Maps

Si prefieres Google Maps (más conocido pero requiere tarjeta de crédito):

### 1️⃣ Obtener API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita "Maps JavaScript API"
4. Crea credenciales (API Key)
5. Restringe la key a tu dominio

**Costo:** $200 USD gratis/mes, después ~$7/1000 cargas

### 2️⃣ Instalar dependencias

```bash
npm install @react-google-maps/api
```

### 3️⃣ Crear componente GoogleMap

```tsx
// components/map/GoogleLocationMap.tsx
'use client'

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { useState } from 'react'

const SANTA_CRUZ = { lat: -17.783327, lng: -63.182140 }

export default function GoogleLocationMap({ 
  selectedLocation, 
  onLocationSelect 
}: any) {
  const [map, setMap] = useState(null)

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '500px' }}
        center={selectedLocation || SANTA_CRUZ}
        zoom={15}
        onClick={(e) => {
          if (e.latLng) {
            onLocationSelect({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            })
          }
        }}
      >
        {selectedLocation && (
          <Marker position={selectedLocation} />
        )}
      </GoogleMap>
    </LoadScript>
  )
}
```

### 4️⃣ Agregar API key a .env.local

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 5️⃣ Reemplazar en tu formulario

```tsx
// Cambiar de:
import LocationMap from './LocationMap'

// A:
import GoogleLocationMap from './GoogleLocationMap'
```

---

## 🎯 Opción: Integrar Mapbox (Recomendado si quieres cambiar)

Mapbox es **mejor que Google Maps** en rendimiento y es más barato:

### 1️⃣ Obtener Access Token

1. Regístrate en [Mapbox](https://www.mapbox.com/)
2. Crea access token gratuito

**Costo:** 50,000 cargas gratis/mes, después muy barato

### 2️⃣ Instalar dependencias

```bash
npm install mapbox-gl react-map-gl
```

### 3️⃣ Crear componente Mapbox

```tsx
// components/map/MapboxLocationMap.tsx
'use client'

import { useState } from 'react'
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const SANTA_CRUZ = { lat: -17.783327, lng: -63.182140 }

export default function MapboxLocationMap({
  selectedLocation,
  onLocationSelect
}: any) {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
      initialViewState={{
        latitude: selectedLocation?.lat || SANTA_CRUZ.lat,
        longitude: selectedLocation?.lng || SANTA_CRUZ.lng,
        zoom: 15
      }}
      style={{ width: '100%', height: '500px' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onClick={(e) => {
        onLocationSelect({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        })
      }}
    >
      {selectedLocation && (
        <Marker
          latitude={selectedLocation.lat}
          longitude={selectedLocation.lng}
        />
      )}
    </Map>
  )
}
```

### 4️⃣ Agregar token a .env.local

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_aqui
```

---

## ⚡ Mi Recomendación Final

### Para TU caso (DistrIA):

1. **Prueba primero CARTO_VOYAGER** (ya configurado) ← **GRATIS, RÁPIDO**
2. Si quieres satélite: **ESRI_WORLD_IMAGERY** ← **GRATIS**
3. Si necesitas más features: **Mapbox** ← **GRATIS hasta 50k/mes**
4. Solo si te exigen Google Maps: **Google Maps** ← **Requiere tarjeta**

---

## 📝 Ejemplos de Uso

### Ver diferentes estilos:

```typescript
// Minimalista blanco
export const DEFAULT_PROVIDER = MAP_PROVIDERS.CARTO_POSITRON

// Dark mode
export const DEFAULT_PROVIDER = MAP_PROVIDERS.CARTO_DARK

// Vista satélite
export const DEFAULT_PROVIDER = MAP_PROVIDERS.ESRI_WORLD_IMAGERY

// Con relieve
export const DEFAULT_PROVIDER = MAP_PROVIDERS.STAMEN_TERRAIN
```

---

## 🎨 Preview de Estilos

**CARTO_VOYAGER (Actual):**
- 🎨 Colorido, moderno
- 🏙️ Excelente para ciudades
- ⚡ Muy rápido

**ESRI_WORLD_IMAGERY:**
- 🛰️ Vista satelital real
- 🏢 Ver edificios y calles reales
- 📍 Perfecta para ubicaciones exactas

**CARTO_POSITRON:**
- ⚪ Minimalista
- 🎨 Blanco/gris elegante
- 💼 Profesional para dashboards

---

**🎯 Prueba CartoDB Voyager primero - es gratis, rápido y se ve genial!**

Si no te gusta, solo cambia una línea en `map-providers.ts` 🚀
