'use client';

import { useState } from 'react';
import ReportGenerator from './ReportGenerator';
import SalesReportSimple from './SalesReportSimple';
import InventoryReportSimple from './InventoryReportSimple';
import PageHeader from '@/components/ui/page-header';
// Temporalmente comentamos los reportes que aún usan componentes UI problemáticos
// import CustomersReport from './CustomersReport';
// import DeliveryReport from './DeliveryReport';

const ReportsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header con navegación */}
      <PageHeader
        title="Reportes de Negocio"
        description="Genera reportes en PDF para análisis detallado de tu empresa"
        backUrl="/dashboard"
      />
      
      {/* Generador de Reportes */}
      <ReportGenerator />
      
      {/* Reportes Ocultos para Generación de PDF */}
      <div style={{ display: 'none' }}>
        <SalesReportSimple />
      </div>
      <div style={{ display: 'none' }}>
        <InventoryReportSimple />
      </div>
      {/* Temporalmente comentados hasta crear versiones simples
      <div style={{ display: 'none' }}>
        <CustomersReport />
      </div>
      <div style={{ display: 'none' }}>
        <DeliveryReport />
      </div>
      */}
    </div>
  );
};

export default ReportsPage;
