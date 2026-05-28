import { ipcMain } from 'electron';
import planesController from '../controllers/planes.controller';

export default function planesRoutes() {
  ipcMain.handle('planes:getAll', planesController.getPlanesCorte);
}
