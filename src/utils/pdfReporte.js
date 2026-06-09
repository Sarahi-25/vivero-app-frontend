function limpiarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escaparPdf(texto) {
  return limpiarTexto(texto).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function cortarLinea(texto, max = 92) {
  const palabras = limpiarTexto(texto).split(' ');
  const lineas = [];
  let actual = '';
  palabras.forEach(p => {
    if ((actual + ' ' + p).trim().length > max) {
      if (actual) lineas.push(actual);
      actual = p;
    } else {
      actual = (actual + ' ' + p).trim();
    }
  });
  if (actual) lineas.push(actual);
  return lineas.length ? lineas : [''];
}

function crearContenidoPagina(lineas) {
  let y = 785;
  const comandos = ['BT', '/F1 11 Tf', '50 805 Td'];
  lineas.forEach((linea, i) => {
    if (i === 0) {
      comandos.push(`(${escaparPdf(linea)}) Tj`);
    } else {
      y -= 16;
      comandos.push(`0 -16 Td (${escaparPdf(linea)}) Tj`);
    }
  });
  comandos.push('ET');
  return comandos.join('\n');
}

function crearPdf(lineas) {
  const lineasPorPagina = 46;
  const paginas = [];
  for (let i = 0; i < lineas.length; i += lineasPorPagina) {
    paginas.push(lineas.slice(i, i + lineasPorPagina));
  }

  const objetos = [];
  objetos.push('<< /Type /Catalog /Pages 2 0 R >>');
  const kids = paginas.map((_, i) => `${3 + i * 2} 0 R`).join(' ');
  objetos.push(`<< /Type /Pages /Kids [ ${kids} ] /Count ${paginas.length} >>`);

  paginas.forEach((pagina, i) => {
    const pageObj = 3 + i * 2;
    const contentObj = pageObj + 1;
    const stream = crearContenidoPagina(pagina);
    objetos.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObj} 0 R >>`);
    objetos.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objetos.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objetos.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export function descargarReportePdf({ plantas, movimientos, personal }) {
  const fecha = new Date().toLocaleString('es-MX');
  const totalStock = plantas.reduce((s, p) => s + Number(p.stock || 0), 0);
  const totalIngresos = movimientos
    .filter(m => m.tipo === 'salida' && m.motivo === 'Venta')
    .reduce((s, m) => s + Number(m.total || 0), 0);

  const lineas = [
    'REPORTE GENERAL DEL VIVERO',
    `Fecha de descarga: ${fecha}`,
    '',
    'RESUMEN',
    `Total de plantas registradas: ${plantas.length}`,
    `Stock total: ${totalStock}`,
    `Movimientos registrados: ${movimientos.length}`,
    `Personal registrado: ${personal.length}`,
    `Ingresos por ventas: $${totalIngresos.toFixed(2)}`,
    '',
    'INVENTARIO DE PLANTAS',
  ];

  if (plantas.length === 0) {
    lineas.push('Sin plantas registradas.');
  } else {
    plantas.forEach((p, i) => {
      cortarLinea(`${i + 1}. ${p.nombre} | Tipo: ${p.tipo || '-'} | Color: ${p.color || '-'} | Stock: ${p.stock} | Precio venta: $${Number(p.precioVenta || 0).toFixed(2)} | Estado: ${p.estado || '-'}`)
        .forEach(l => lineas.push(l));
    });
  }

  lineas.push('', 'MOVIMIENTOS');
  if (movimientos.length === 0) {
    lineas.push('Sin movimientos registrados.');
  } else {
    movimientos.forEach((m, i) => {
      cortarLinea(`${i + 1}. ${m.fecha || '-'} ${m.hora || ''} | ${m.tipo} | ${m.motivo} | ${m.planta} | Cantidad: ${m.cantidad} ${m.total ? `| Total: $${Number(m.total).toFixed(2)}` : ''}`)
        .forEach(l => lineas.push(l));
    });
  }

  lineas.push('', 'PERSONAL');
  if (personal.length === 0) {
    lineas.push('Sin personal registrado.');
  } else {
    personal.forEach((p, i) => {
      cortarLinea(`${i + 1}. ${p.name || p.nombre || '-'} | Rol: ${p.rol || '-'} | Turno: ${p.turno || '-'} | Estado: ${p.estado || '-'} | Contacto: ${p.telefono || p.email || '-'}`)
        .forEach(l => lineas.push(l));
    });
  }

  const pdf = crearPdf(lineas);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-vivero-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
