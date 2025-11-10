'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Calendar, Users, TrendingUp, Package } from 'lucide-react';

export interface ReportData {
  title: string;
  period: string;
  generatedAt: Date;
  data: any;
}

interface ReportGeneratorProps {
  children?: React.ReactNode;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (elementId: string, filename: string) => {
    setIsGenerating(true);
    try {
      console.log('Iniciando generación de PDF para:', elementId);
      
      // Buscar el elemento del reporte
      const reportElement = document.getElementById(elementId);
      if (!reportElement) {
        console.error('Elemento no encontrado:', elementId);
        throw new Error(`Elemento con ID ${elementId} no encontrado`);
      }

      console.log('Elemento encontrado, preparando para renderizado...');

      // Crear un contenedor temporal para el reporte
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels (210mm at 96dpi)
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '0';
      tempContainer.style.margin = '0';
      
      // Clonar el elemento del reporte
      const clonedElement = reportElement.cloneNode(true) as HTMLElement;
      clonedElement.style.display = 'block';
      clonedElement.style.width = '100%';
      clonedElement.style.minHeight = 'auto';
      
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Esperar un momento para que se renderice
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Capturando elemento con html2canvas...');

      // Configurar el canvas para mejor calidad
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: clonedElement.scrollWidth,
        height: clonedElement.scrollHeight,
        ignoreElements: (element) => {
          // Ignorar elementos que puedan causar problemas
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          // Agregar CSS personalizado para sobrescribir colores problemáticos
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: rgb(17, 24, 39) !important;
              background-color: rgb(255, 255, 255) !important;
              border-color: rgb(229, 231, 235) !important;
            }
            .text-blue-600, [style*="color: #2563eb"] {
              color: rgb(37, 99, 235) !important;
            }
            .text-green-600, [style*="color: #16a34a"] {
              color: rgb(22, 163, 74) !important;
            }
            .text-purple-600 {
              color: rgb(147, 51, 234) !important;
            }
            .text-orange-600 {
              color: rgb(234, 88, 12) !important;
            }
            .text-red-600 {
              color: rgb(220, 38, 38) !important;
            }
            .text-yellow-600 {
              color: rgb(202, 138, 4) !important;
            }
            .text-indigo-600 {
              color: rgb(79, 70, 229) !important;
            }
            .bg-gray-50 {
              background-color: rgb(249, 250, 251) !important;
            }
            .bg-blue-50 {
              background-color: rgb(239, 246, 255) !important;
            }
            .bg-green-50 {
              background-color: rgb(240, 253, 244) !important;
            }
            .bg-red-50 {
              background-color: rgb(254, 242, 242) !important;
            }
            .bg-yellow-50 {
              background-color: rgb(254, 252, 232) !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // Limpiar el contenedor temporal
      document.body.removeChild(tempContainer);

      console.log('Canvas creado, generando PDF...');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calcular dimensiones para ajustar al PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.height / canvas.width;

      let imgWidth = pdfWidth - 20; // Margen de 10mm a cada lado
      let imgHeight = imgWidth * canvasAspectRatio;

      // Si la altura excede la página, dividir en múltiples páginas
      if (imgHeight > pdfHeight - 20) {
        const pageHeight = pdfHeight - 20;
        const totalPages = Math.ceil(imgHeight / pageHeight);
        
        console.log(`Creando PDF con ${totalPages} páginas...`);
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();
          
          const yOffset = -(i * pageHeight * (canvas.height / imgHeight));
          pdf.addImage(imgData, 'PNG', 10, 10 + yOffset, imgWidth, imgHeight);
        }
      } else {
        // Centrar verticalmente si cabe en una página
        const y = (pdfHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
      }

      const pdfFilename = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(pdfFilename);
      
      console.log('PDF generado exitosamente:', pdfFilename);
      
    } catch (error) {
      console.error('Error detallado generando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al generar el PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypes = [
    {
      id: 'sales',
      title: 'Reporte de Ventas del Mes',
      description: 'Análisis completo de ventas, ingresos y productos más vendidos',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    // Temporalmente deshabilitados hasta crear versiones simples
    // {
    //   id: 'customers',
    //   title: 'Análisis de Clientes',
    //   description: 'Segmentación de clientes y análisis de comportamiento',
    //   icon: Users,
    //   color: 'bg-blue-500',
    // },
    // {
    //   id: 'deliveries',
    //   title: 'Rendimiento de Entregas',
    //   description: 'Métricas de tiempo, rutas y eficiencia de entrega',
    //   icon: Calendar,
    //   color: 'bg-orange-500',
    // },
    {
      id: 'inventory',
      title: 'Inventario y Productos',
      description: 'Estado del inventario y análisis de productos',
      icon: Package,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{report.description}</p>
                <Button
                  onClick={() => {
                    console.log('Botón clickeado para reporte:', report.id);
                    generatePDF(`${report.id}-report`, report.title.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generando...' : 'Generar PDF'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {children}
    </div>
  );
};

export default ReportGenerator;
