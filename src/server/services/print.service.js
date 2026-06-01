const { BrowserWindow, app } = require('electron');
const fs = require('fs');
const path = require('path');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildEtiquetaHtml = (etiquetas = []) => {
  const labels = etiquetas
    .map((etiqueta) => {
      const lote = escapeHtml(etiqueta?.lote);
      const calidad = escapeHtml(etiqueta?.calidad);
      const fabricante = escapeHtml(etiqueta?.fabricante);
      const ancho = escapeHtml(etiqueta?.ancho);
      const espesor = escapeHtml(etiqueta?.espesor);
      const peso = escapeHtml(etiqueta?.peso);
      const fecha = escapeHtml(etiqueta?.fecha);
      const numero = escapeHtml(etiqueta?.num_fleje);

      return `
        <section class="label">
          <div class="header">
            <div class="brand">Zebra</div>
            <div class="date">${fecha}</div>
          </div>
          <div class="lote">${lote}</div>
          <div class="grid">
            <div><span>Calidad</span><strong>${calidad}</strong></div>
            <div><span>Fabricante</span><strong>${fabricante}</strong></div>
            <div><span>Ancho</span><strong>${ancho}</strong></div>
            <div><span>Espesor</span><strong>${espesor}</strong></div>
            <div><span>Peso</span><strong>${peso}</strong></div>
            <div><span>Fleje</span><strong>${numero}</strong></div>
          </div>
        </section>
      `;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: 80mm 50mm; margin: 0; }
          html, body { width: 80mm; height: 50mm; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; color: #000; }
          .label {
            width: 80mm;
            height: 50mm;
            box-sizing: border-box;
            padding: 3mm 4mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
          }
          .label:last-child { page-break-after: auto; }
          .header { display: flex; justify-content: space-between; font-size: 9pt; font-weight: 700; }
          .lote { font-size: 18pt; font-weight: 700; letter-spacing: 0.5px; text-align: center; margin: 2mm 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm 2mm; font-size: 8pt; }
          .grid div { display: flex; flex-direction: column; }
          .grid span { font-size: 7pt; text-transform: uppercase; opacity: 0.75; }
          .grid strong { font-size: 9pt; }
        </style>
      </head>
      <body>
        ${labels}
      </body>
    </html>
  `;
};

const printEtiquetasZebraService = async (payload) => {
  const etiquetas = Array.isArray(payload?.etiquetas) ? payload.etiquetas : [];

  if (etiquetas.length === 0) {
    return { success: false, error: 'No hay etiquetas para imprimir' };
  }

  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  try {
    const html = buildEtiquetaHtml(etiquetas);

    await printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    );

    setTimeout(() => {
      printWindow.webContents.print(
        { silent: true, printBackground: true, deviceName: '' },
        (success, errorType) => {
          if (!success) {
            console.error('Error al imprimir etiquetas:', errorType);
          }
        },
      );
    }, 300);

    return { success: true, total: etiquetas.length };
  } finally {
    if (!printWindow.isDestroyed()) {
      printWindow.close();
    }
  }
};

module.exports = { printEtiquetasZebraService };
