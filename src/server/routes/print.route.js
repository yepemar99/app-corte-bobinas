import { ipcMain } from 'electron';
import { printEtiquetasZebraService } from '../services/print.service';

export default function printRoutes() {
  ipcMain.handle('zebra:printEtiquetas', async (_, payload) =>
    printEtiquetasZebraService(payload),
  );
}
