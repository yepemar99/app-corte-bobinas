import { ipcMain } from 'electron';
import bobinasCortadasController from '../controllers/bobinasCortadas.controller';

export default function bobinasCortadasRoutes() {
  ipcMain.handle('bobinasCortadas:getAll', bobinasCortadasController.getAll);
  ipcMain.handle('bobinasCortadas:save', bobinasCortadasController.save);
}
