import { ipcMain } from 'electron';
import bobinaController from '../controllers/bobina.controller';

export default function bobinaRoutes() {
  ipcMain.handle('bobinas:getAllForSelects', bobinaController.getAllForSelects);
}
