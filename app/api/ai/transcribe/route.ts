import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Archivo de audio requerido' },
        { status: 400 }
      );
    }

    // Por ahora, implementamos una transcripción simulada
    // En el futuro se puede integrar con OpenAI Whisper, Google Speech-to-Text, etc.
    
    // Simulación de transcripción (para desarrollo)
    const mockTranscriptions = [
      "Muéstrame las ventas de esta semana",
      "¿Cuáles son los productos más vendidos?",
      "Necesito un reporte de inventario",
      "¿Cómo van las entregas de hoy?",
      "Optimiza la ruta para mañana",
      "¿Qué clientes compran más frecuentemente?",
      "Analiza la demanda del producto X",
      "Genera un reporte de satisfacción del cliente"
    ];

    // Seleccionar una transcripción aleatoria para simular
    const randomTranscription = mockTranscriptions[
      Math.floor(Math.random() * mockTranscriptions.length)
    ];

    // En producción, aquí iría la lógica real de transcripción
    // Ejemplo con OpenAI Whisper:
    /*
    if (process.env.OPENAI_API_KEY) {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const result = await response.json();
      return NextResponse.json({
        transcription: result.text,
        confidence: 0.95,
        language: 'es'
      });
    }
    */

    return NextResponse.json({
      transcription: randomTranscription,
      confidence: 0.85,
      language: 'es',
      note: 'Transcripción simulada para desarrollo. Integrar con Whisper o Google Speech-to-Text en producción.'
    });

  } catch (error) {
    console.error('Error en transcripción:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar el audio',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
