import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key de Gemini no configurada' },
        { status: 500 }
      );
    }

    // Configurar el modelo
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Contexto específico para DistrIA
    const systemPrompt = `
Eres un asistente inteligente para DistrIA, una plataforma de logística de última milla para PYMEs.

CONTEXTO DE DISTRAIA:
- Sistema de gestión logística integral
- Funcionalidades: gestión de productos, inventario, clientes, pedidos, rutas de entrega
- Ubicado en Santa Cruz de la Sierra, Bolivia
- Enfocado en optimización de entregas y análisis predictivo
- Usuarios principales: administradores de PYMEs y repartidores

CAPACIDADES QUE PUEDES AYUDAR:
- Análisis de datos de ventas y clientes
- Optimización de rutas de entrega
- Gestión de inventario y stock
- Reportes y métricas de negocio
- Predicción de demanda
- Segmentación de clientes
- Consejos de logística y distribución

INSTRUCCIONES:
- Responde en español
- Sé conciso pero informativo
- Enfócate en soluciones prácticas para logística
- Si no tienes datos específicos, sugiere cómo obtenerlos
- Mantén un tono profesional pero amigable

Usuario: ${message}
`;

    // Generar respuesta
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en Gemini API:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
