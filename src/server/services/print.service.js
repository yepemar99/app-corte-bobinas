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

// 1. Esta función genera el HTML completo y autónomo para una SOLA etiqueta
const buildEtiquetaHtmlIndividual = (etiqueta = {}) => {
  const lote = escapeHtml(etiqueta?.lote);
  const calidad = escapeHtml(etiqueta?.calidad);
  const fabricante = escapeHtml(etiqueta?.fabricante);
  const ancho = escapeHtml(etiqueta?.ancho);
  const espesor = escapeHtml(etiqueta?.espesor);
  const peso = escapeHtml(etiqueta?.peso);
  const fecha = escapeHtml(etiqueta?.fecha);
  const numero = escapeHtml(etiqueta?.num_fleje);

  // El estándar Code 39 requiere asteriscos al inicio y al final para ser escaneable
  const loteParaCodigo = `*${lote}*`;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
        

       <style>
      @page {
        size: auto;
        margin: 0;
      }
      html,
      body {
        height: 98vh;
        width: 100%;
        margin: 0;
        padding: 1mm;
        background-color: #ffffff;
      }
      .label-card {
        width: 100%;
        margin: 0;
        padding: 0;
        color: #000000;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      }
      .label-row {
        width: 100%;
        display: flex;
        margin-bottom: 5px;
        font-size: 14pt;
      }
      .label-key {
        font-weight: bold;
        margin-right: 7px;
      }
      .label-value {
        font-weight: bold;
      }
      .label-lote-title {
        font-weight: bold;
        font-size: 14pt;
        margin-bottom: 3px;
      }
      .label-lote-code {
        font-size: 16pt;
        font-weight: bold;
        letter-spacing: 0.5px;
      }

      /* --- CÔö£├┤DIGO DE BARRAS REAL --- */
      .label-barcode-real {
        font-family: "Libre Barcode 39", sans-serif;
        font-size: 30pt; /* Ajusta el tamaÔö£ÔûÆo para controlar el alto y ancho de las barras */
        line-height: 1;
        margin-top: 5px;
        display: inline-block;
      }
    </style>
      </head>
      <body>
        <div class="label-card">
          <div class="label-row">
            <div class="label-key">Fecha:</div>
            <div class="label-value">${fecha}</div>
          </div>
          
          <div class="label-row">
            <div class="label-key">Calidad:</div>
            <div class="label-value">${calidad}</div>
          </div>
          
          <div class="label-row">
            <div class="label-key">Proveedor:</div>
            <div class="label-value">${fabricante}</div>
          </div>
          
          <div class="label-row">
            <div class="label-key">Ancho (mm):</div>
            <div class="label-value">${ancho}</div>
          </div>
          
          <div class="label-row">
            <div class="label-key">Espesor (mm):</div>
            <div class="label-value">${espesor}</div>
          </div>
          
          <div class="label-row">
            <div class="label-key">Peso (Tn):</div>
            <div class="label-value">${peso}</div>
          </div>
          
          <div class="label-row">
            <div class="label-key">Número de fleje:</div>
            <div class="label-value">${numero}</div>
          </div>
          
          <div class="label-lote-block">
            <div class="label-lote-title">Lote de fabricación:</div>
            <div class="label-lote-code">${lote}</div>
          </div>
          
          <div class="label-barcode-container">
            <div class="label-barcode-real">${loteParaCodigo}</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// 2. Esta función procesa la lista y te devuelve un ARRAY de HTMLs independientes
const generarListaDeHtmls = (etiquetas = []) => {
  return etiquetas.map((etiqueta) => buildEtiquetaHtmlIndividual(etiqueta));
};

const printEtiquetasZebraService = async (payload) => {
  const etiquetas = Array.isArray(payload?.etiquetas) ? payload.etiquetas : [];

  if (etiquetas.length === 0) {
    return { success: false, error: 'No hay etiquetas para imprimir' };
  }

  // Creamos la ventana oculta una sola vez para reutilizarla
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  try {
    const listaHtmls = generarListaDeHtmls(etiquetas);

    // Iteramos secuencialmente sobre cada HTML independiente
    for (let i = 0; i < listaHtmls.length; i++) {
      const html = listaHtmls[i];
      console.log('Html', i);
      console.log(html);
      if (printWindow.isDestroyed()) break;

      // 1. Cargamos el HTML de la etiqueta actual
      await printWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
      );

      // 2. Esperamos un breve instante para asegurar que el motor de renderizado procese el CSS/Código de barras
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (printWindow.isDestroyed()) break;

      // 3. Promisificamos la impresión para pausar el bucle 'for' hasta que la impresora termine con este HTML
      await new Promise((resolve, reject) => {
        printWindow.webContents.print(
          { silent: true, printBackground: true, deviceName: '' },
          (success, errorType) => {
            if (!success) {
              console.error(`Error al imprimir etiqueta ${i + 1}:`, errorType);
              // Decidimos si continuar con las demás o romper el flujo lanzando un error
              return reject(new Error(`Fallo en impresora: ${errorType}`));
            }
            console.log(`Etiqueta ${i + 1} enviada a cola con éxito.`);
            resolve(); // Continuar con la siguiente iteración
          },
        );
      });
    }

    // Una vez impresas todas, cerramos la ventana de manera segura
    if (!printWindow.isDestroyed()) {
      printWindow.close();
    }

    return { success: true, total: etiquetas.length };
  } catch (error) {
    // Si algo falla en cualquier punto del bucle, cerramos la ventana para evitar fugas de memoria
    if (!printWindow.isDestroyed()) {
      printWindow.close();
    }
    return { success: false, error: error.message };
  }
};
module.exports = { printEtiquetasZebraService };
