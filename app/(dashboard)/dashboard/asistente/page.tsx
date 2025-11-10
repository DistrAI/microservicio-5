'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { AIChat } from '@/components/ai-assistant/AIChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Brain, Mic, MessageSquare, TrendingUp, Route, Package, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AsistentePage() {
  const { user } = useAuthStore();

  // Verificar que sea administrador
  if (user?.rol !== 'ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600">
                El asistente de IA está disponible solo para administradores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="px-4 py-2 rounded border bg-white hover:bg-gray-50 flex items-center gap-2"
          >
            ← 
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asistente DistrIA</h1>
            <p className="text-gray-600 mt-1">
              Tu asistente inteligente para optimizar la logística de tu empresa
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Asistente Inteligente
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Principal */}
        <div className="lg:col-span-2">
          <AIChat />
        </div>

        {/* Panel de Ayuda */}
        <div className="space-y-4">
          {/* Capacidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-blue-600" />
                ¿Qué puedo hacer?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Análisis de Ventas</p>
                  <p className="text-xs text-gray-600">Reportes y métricas de negocio</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Route className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Optimización de Rutas</p>
                  <p className="text-xs text-gray-600">Mejores rutas de entrega</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Gestión de Inventario</p>
                  <p className="text-xs text-gray-600">Control de stock y productos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Análisis de Clientes</p>
                  <p className="text-xs text-gray-600">Segmentación y comportamiento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ejemplos de Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
                Ejemplos de Consultas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">"¿Cuáles son mis productos más vendidos esta semana?"</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">"Optimiza la ruta para las entregas de mañana"</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">"Genera un reporte de inventario bajo"</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">"¿Qué clientes no han comprado recientemente?"</p>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones de Audio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mic className="h-5 w-5 text-red-600" />
                Comandos de Voz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Mantén presionado el botón del micrófono</p>
                <p>• Habla claramente en español</p>
                <p>• Suelta para enviar tu mensaje</p>
                <p>• El audio se transcribirá automáticamente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
