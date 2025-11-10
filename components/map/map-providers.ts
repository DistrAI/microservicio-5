/**
 * Configuración de proveedores de mapas para LocationMap
 * Puedes cambiar entre diferentes estilos fácilmente
 */

export interface MapProvider {
  name: string
  url: string
  attribution: string
  maxZoom: number
  subdomains?: string
  requiresApiKey?: boolean
  description: string
}

/**
 * Proveedores de mapas disponibles (todos gratuitos excepto los marcados)
 */
export const MAP_PROVIDERS: Record<string, MapProvider> = {
  // ============================================================================
  // RECOMENDADOS (Gratis, Rápidos, Modernos)
  // ============================================================================
  
  CARTO_VOYAGER: {
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd',
    requiresApiKey: false,
    description: '🌍 Colorido, moderno, excelente para ubicaciones urbanas (ACTUAL)'
  },
  
  CARTO_POSITRON: {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd',
    requiresApiKey: false,
    description: '⚪ Minimalista blanco/gris, limpio y elegante'
  },
  
  CARTO_DARK: {
    name: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    subdomains: 'abcd',
    requiresApiKey: false,
    description: '⚫ Modo oscuro, perfecto para dark theme'
  },
  
  // ============================================================================
  // OPENSTREETMAP (Original, más lento)
  // ============================================================================
  
  OSM_STANDARD: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: 'abc',
    requiresApiKey: false,
    description: '🗺️ Clásico OSM, puede ser lento en horas pico'
  },
  
  // ============================================================================
  // ESRI / ArcGIS (Buenos para satélite)
  // ============================================================================
  
  ESRI_WORLD_IMAGERY: {
    name: 'ESRI World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
    subdomains: '',
    requiresApiKey: false,
    description: '🛰️ Vista satelital de alta calidad'
  },
  
  ESRI_WORLD_STREET: {
    name: 'ESRI World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
    subdomains: '',
    requiresApiKey: false,
    description: '🗺️ Mapa de calles estilo ESRI, muy limpio'
  },
  
  // ============================================================================
  // STAMEN (Diseños artísticos)
  // ============================================================================
  
  STAMEN_TERRAIN: {
    name: 'Stamen Terrain',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
    subdomains: '',
    requiresApiKey: false,
    description: '⛰️ Con relieve y topografía, excelente para áreas rurales'
  },
  
  STAMEN_TONER: {
    name: 'Stamen Toner',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 20,
    subdomains: '',
    requiresApiKey: false,
    description: '🖤 Blanco y negro, estilo tinta, muy artístico'
  }
}

/**
 * Provider por defecto (actualmente ESRI World Street Map)
 */
export const DEFAULT_PROVIDER: MapProvider = MAP_PROVIDERS.ESRI_WORLD_STREET

/**
 * Helper para obtener un provider por nombre
 */
export function getMapProvider(key: keyof typeof MAP_PROVIDERS): MapProvider {
  return MAP_PROVIDERS[key] || DEFAULT_PROVIDER
}
