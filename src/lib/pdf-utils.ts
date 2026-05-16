import { formatInColombiaTime, COLOMBIA_TIMEZONE } from '@/lib/date-utils'

/**
 * Genera un Carné de Cliente en formato PDF (85mm x 55mm)
 */
export const generateClientCard = async (cliente: any) => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85, 55]
  })

  // Colores corporativos
  const primaryColor = [30, 58, 138] // #1e3a8a
  const accentColor = [255, 90, 0]   // Naranja

  // Fondo y Bordes
  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, 85, 55, 'F')
  
  // Franja Superior
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 85, 12, 'F')

  // Texto "GYM CONTROL"
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('GYM CONTROL', 42.5, 8, { align: 'center' })

  // Info Cliente
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.text('NOMBRE DEL SOCIO', 5, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(cliente.nombre.toUpperCase(), 5, 25)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('DOCUMENTO', 5, 32)
  doc.setFont('helvetica', 'bold')
  doc.text(cliente.numero_documento || 'N/A', 5, 36)

  doc.setFont('helvetica', 'normal')
  doc.text('PLAN', 5, 43)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
  doc.text(cliente.planes?.nombre || 'ACTIVO', 5, 47)

  // Foto o Iniciales
  if (cliente.foto_url) {
    try {
      // Intentar añadir la foto si existe
      doc.addImage(cliente.foto_url, 'JPEG', 35, 30, 18, 18)
    } catch (e) {
      console.error('Error al cargar foto:', e)
    }
  }

  // QR Code
  const qrData = cliente.id
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`
  
  try {
    doc.addImage(qrUrl, 'PNG', 55, 18, 25, 25)
  } catch (e) {
    console.error('Error al cargar QR:', e)
  }

  // Footer
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 52, 85, 3, 'F')

  doc.save(`carne_${cliente.numero_documento || 'cliente'}.pdf`)
}

/**
 * Genera un Recibo de Pago en PDF
 */
export const generateReceiptPDF = async (pago: any, gimnasio: any) => {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ format: 'letter' })

  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFontSize(22)
  doc.setTextColor(30, 58, 138)
  doc.setFont('helvetica', 'bold')
  doc.text(gimnasio?.nombre || 'GymControl', margin, 30)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(gimnasio?.direccion || 'Dirección no configurada', margin, 37)
  doc.text(`NIT: ${gimnasio?.nit || 'N/A'} | Tel: ${gimnasio?.telefono || 'N/A'}`, margin, 42)

  // Título del Documento
  doc.setFontSize(16)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE PAGO', pageWidth - margin, 30, { align: 'right' })
  doc.setFontSize(12)
  doc.text(`N° ${pago.recibo_numero || pago.id.substring(0,8)}`, pageWidth - margin, 37, { align: 'right' })

  // Info Pago
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, 50, pageWidth - margin, 50)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTE:', margin, 60)
  doc.setFont('helvetica', 'normal')
  doc.text(pago.clientes?.nombre || 'N/A', margin + 20, 60)

  doc.setFont('helvetica', 'bold')
  doc.text('FECHA:', margin, 67)
  doc.setFont('helvetica', 'normal')
  doc.text(formatInColombiaTime(pago.fecha_pago, 'date'), margin + 20, 67)

  // Tabla de Detalle
  autoTable(doc, {
    startY: 75,
    head: [['Descripción', 'Método', 'Total']],
    body: [
      [
        pago.concepto || 'Membresía',
        pago.metodo_pago?.toUpperCase() || 'EFECTIVO',
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pago.monto)
      ]
    ],
    headStyles: { fillColor: [30, 58, 138] },
    theme: 'striped'
  })

  // Totales
  const finalY = (doc as any).lastAutoTable.finalY + 10
  
  if (pago.iva_monto > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('SUBTOTAL:', pageWidth - margin - 40, finalY)
    doc.text(new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pago.subtotal), pageWidth - margin, finalY, { align: 'right' })
    
    doc.text('IVA (19%):', pageWidth - margin - 40, finalY + 7)
    doc.text(new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pago.iva_monto), pageWidth - margin, finalY + 7, { align: 'right' })
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', pageWidth - margin - 40, finalY + 17)
    doc.text(new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pago.monto), pageWidth - margin, finalY + 17, { align: 'right' })
  } else {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', pageWidth - margin - 40, finalY)
    doc.text(new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pago.monto), pageWidth - margin, finalY, { align: 'right' })
  }

  // Footer
  doc.setFontSize(9)
  doc.setTextColor(150, 150, 150)
  doc.text('¡Gracias por elegirnos! Este recibo es un soporte válido de tu pago.', pageWidth / 2, 280, { align: 'center' })

  doc.save(`recibo_${pago.recibo_numero || pago.id.substring(0,8)}.pdf`)
}

/**
 * Genera un Reporte Tabular Genérico
 */
export const generateReportPDF = async (title: string, columns: string[], data: any[][]) => {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ format: 'letter' })
  
  // Fondo decorativo en la cabecera
  doc.setFillColor(30, 58, 138)
  doc.rect(0, 0, 215.9, 40, 'F') // Ancho carta: 215.9mm

  // Logo / Nombre del Gimnasio
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('GYMCONTROL', 14, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('SISTEMA DE GESTIÓN INTELIGENTE', 14, 27)

  // Título del Reporte
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title.toUpperCase(), 201.9, 25, { align: 'right' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`GENERADO: ${new Date().toLocaleString('es-CO', { timeZone: COLOMBIA_TIMEZONE })}`, 201.9, 32, { align: 'right' })

  autoTable(doc, {
    startY: 50,
    head: [columns],
    body: data,
    headStyles: { 
      fillColor: [30, 58, 138],
      fontSize: 10,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 50 }
  })

  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Página ${i} de ${pageCount}`, 107.9, 270, { align: 'center' }) // Altura carta: ~279mm
  }

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`)
}

/**
 * Genera un Reporte de Cierre de Caja Detallado
 */
export const generateClosurePDF = async (caja: any, movimientos: any[], gimnasio?: any) => {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ format: 'letter' })
  
  const margin = 14
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // 1. Encabezado
  doc.setFontSize(18)
  doc.setTextColor(30, 58, 138)
  doc.setFont('helvetica', 'bold')
  doc.text(gimnasio?.nombre?.toUpperCase() || 'GIMRONAL', margin, 20)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`NIT: ${gimnasio?.nit || 'N/A'} | Dirección: ${gimnasio?.direccion || 'N/A'} | Tel: ${gimnasio?.telefono || 'N/A'}`, margin, 25)
  
  doc.setFontSize(14)
  doc.setTextColor(71, 85, 105)
  doc.text('REPORTE FISCAL DE CIERRE DE CAJA', margin, 33)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  const fechaStr = formatInColombiaTime(caja.fecha_apertura, 'full')
  const fechaCierreStr = caja.fecha_cierre ? formatInColombiaTime(caja.fecha_cierre, 'full') : 'EN CURSO'
  doc.text(`Apertura: ${fechaStr}`, margin, 40)
  doc.text(`Cierre: ${fechaCierreStr}`, margin, 45)
  doc.text(`Usuario: ${caja.perfil_apertura?.nombre || 'N/A'}`, pageWidth - margin, 40, { align: 'right' })

  // 2. Resumen Financiero (Tabla Pequeña)
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)

  const ingresosTotales = movimientos
    .filter(m => m.tipo === 'ingreso')
    .reduce((acc, curr) => acc + Number(curr.monto), 0)
  
  const egresosTotales = movimientos
    .filter(m => m.tipo === 'egreso')
    .reduce((acc, curr) => acc + Number(curr.monto), 0)

  const ingresosEfectivo = movimientos
    .filter(m => m.tipo === 'ingreso' && m.metodo_pago === 'efectivo')
    .reduce((acc, curr) => acc + Number(curr.monto), 0)

  const ingresosOtros = ingresosTotales - ingresosEfectivo
  
  const ivaTotal = movimientos
    .filter(m => m.tipo === 'ingreso')
    .reduce((acc, curr) => acc + Number(curr.iva_monto || 0), 0)

  autoTable(doc, {
    startY: 52,
    head: [['RESUMEN FINANCIERO', 'VALOR']],
    body: [
      ['Monto Apertura (Base)', formatCurrency(caja.monto_apertura)],
      ['Total Ingresos (Efectivo + Otros)', formatCurrency(ingresosTotales)],
      ['(-) IVA Recaudado (Incluido)', formatCurrency(ivaTotal)],
      ['(=) Ingresos Netos (Sin IVA)', formatCurrency(ingresosTotales - ivaTotal)],
      ['Total Egresos', formatCurrency(egresosTotales)],
      ['Saldo Esperado en Efectivo', formatCurrency(Number(caja.monto_apertura) + ingresosEfectivo - egresosTotales)],
      ['Saldo Real Reportado', caja.monto_cierre_real ? formatCurrency(caja.monto_cierre_real) : '—'],
      ['Diferencia / Descuadre', caja.diferencia !== null ? formatCurrency(caja.diferencia) : '—']
    ],
    headStyles: { fillColor: [30, 58, 138] },
    theme: 'grid',
    styles: { fontSize: 9 }
  })

  // 3. Desglose por Método de Pago (Solo Ingresos)
  const metodos = [...new Set(movimientos.filter(m => m.tipo === 'ingreso').map(m => m.metodo_pago))]
  const bodyMetodos = metodos.map(m => [
    m.toUpperCase(),
    formatCurrency(movimientos.filter(mov => mov.tipo === 'ingreso' && mov.metodo_pago === m).reduce((acc, curr) => acc + Number(curr.monto), 0))
  ])

  if (bodyMetodos.length > 0) {
    doc.setFontSize(12)
    doc.setTextColor(30, 58, 138)
    doc.text('INGRESOS POR MÉTODO DE PAGO', margin, (doc as any).lastAutoTable.finalY + 10)

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['MÉTODO', 'VALOR']],
      body: bodyMetodos,
      headStyles: { fillColor: [71, 85, 105] }, // Slate 600
      theme: 'striped',
      styles: { fontSize: 8 },
      margin: { left: margin, right: pageWidth / 2 + 10 }
    })
  }

  // 4. Detalle de Movimientos
  doc.setFontSize(12)
  doc.setTextColor(30, 58, 138)
  doc.text('LISTADO DETALLADO DE MOVIMIENTOS', margin, (doc as any).lastAutoTable.finalY + 10)

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['HORA', 'CONCEPTO', 'CLIENTE', 'TIPO', 'MÉTODO', 'SUBTOTAL', 'IVA', 'TOTAL']],
    body: movimientos.map(m => {
      const clienteNombre = m.pagos?.clientes?.nombre || m.ventas?.clientes?.nombre || '—'
      return [
        formatInColombiaTime(m.fecha, 'time'),
        m.concepto,
        clienteNombre,
        m.tipo.toUpperCase(),
        m.metodo_pago.toUpperCase(),
        formatCurrency(m.subtotal || m.monto),
        formatCurrency(m.iva_monto || 0),
        formatCurrency(m.monto)
      ]
    }),
    headStyles: { fillColor: [30, 58, 138] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 8 }
  })

  // 5. Observaciones
  if (caja.observaciones) {
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('OBSERVACIONES:', margin, finalY)
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    doc.text(caja.observaciones, margin, finalY + 5, { maxWidth: pageWidth - (margin * 2) })
  }

  doc.save(`cierre_caja_${formatInColombiaTime(caja.fecha_apertura, 'shortDate')}_${Date.now()}.pdf`)
}

/**
 * Genera la Carta de Compromiso y Exoneración de Responsabilidad
 */
export const generateCommitmentLetterPDF = async (cliente: any, gimnasio: any) => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ format: 'letter' })
  const margin = 25
  const pageWidth = doc.internal.pageSize.getWidth()
  let currentY = 30

  // 1. Encabezado del Gimnasio
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(gimnasio?.nombre?.toUpperCase() || 'GYMCONTROL', pageWidth / 2, currentY, { align: 'center' })
  
  currentY += 8
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(`NIT: ${gimnasio?.nit || 'N/A'} | Dirección: ${gimnasio?.direccion || 'N/A'}`, pageWidth / 2, currentY, { align: 'center' })
  
  currentY += 15
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, currentY, pageWidth - margin, currentY)

  // 2. Título del Documento
  currentY += 15
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('CARTA DE COMPROMISO, EXONERACIÓN DE RESPONSABILIDAD', pageWidth / 2, currentY, { align: 'center' })
  currentY += 6
  doc.text('Y ACEPTACIÓN DE TÉRMINOS Y CONDICIONES (HABEAS DATA)', pageWidth / 2, currentY, { align: 'center' })

  // 3. Introducción
  currentY += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const introText = `Yo, ${cliente.nombre.toUpperCase()}, identificado(a) con el documento número ${cliente.numero_documento || '_______'}, actuando en nombre propio, declaro voluntariamente lo siguiente:`
  const introLines = doc.splitTextToSize(introText, pageWidth - (margin * 2))
  doc.text(introLines, margin, currentY)
  currentY += (introLines.length * 5) + 5

  // 4. Puntos de Compromiso
  const points = [
    "1. Declaro que me encuentro en óptimas condiciones de salud física y mental para realizar actividad física y que no tengo conocimiento de ninguna limitación médica que lo impida.",
    "2. Entiendo que la práctica de ejercicio físico conlleva riesgos inherentes. Exonero de toda responsabilidad legal a " + (gimnasio?.nombre || 'el establecimiento') + " por cualquier lesión, accidente o percance de salud derivado de mi entrenamiento.",
    "3. Me comprometo a seguir las normas de convivencia, seguridad e higiene del establecimiento, así como a hacer un uso adecuado de las máquinas y equipos.",
    "4. AUTORIZACIÓN HABEAS DATA: De manera libre, expresa e informada, autorizo a " + (gimnasio?.nombre || 'el gimnasio') + " para recolectar, almacenar y tratar mis datos personales para fines administrativos, comerciales y de seguridad, cumpliendo con la Ley 1581 de 2012.",
    "5. Entiendo que el carné o QR de acceso es personal e intransferible."
  ]

  points.forEach(point => {
    const lines = doc.splitTextToSize(point, pageWidth - (margin * 2))
    doc.text(lines, margin, currentY)
    currentY += (lines.length * 5) + 3
  })

  // 5. Fecha y Firmas
  currentY += 20
  doc.text(`Fecha: ${formatInColombiaTime(new Date().toISOString(), 'full')}`, margin, currentY)

  currentY += 40
  // Línea de firma Cliente
  doc.line(margin, currentY, margin + 70, currentY)
  doc.text('FIRMA DEL SOCIO', margin, currentY + 5)
  doc.text(`CC: ${cliente.numero_documento || '_______'}`, margin, currentY + 10)

  // Línea de firma Gimnasio
  doc.line(pageWidth - margin - 70, currentY, pageWidth - margin, currentY)
  doc.text('RECIBIDO POR GIMNASIO', pageWidth - margin - 70, currentY + 5)

  // Espacio para huella (Opcional pero común en Colombia)
  currentY += 15
  doc.setDrawColor(150, 150, 150)
  doc.rect(margin + 75, currentY - 25, 20, 25)
  doc.setFontSize(8)
  doc.text('HUELLA', margin + 80, currentY + 4)

  doc.save(`carta_compromiso_${cliente.numero_documento || 'cliente'}.pdf`)
}
