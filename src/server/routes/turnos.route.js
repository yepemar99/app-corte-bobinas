import { ipcMain } from 'electron';
import turnosController from '../controllers/turnos.controller';

export default function turnosRoutes() {
  ipcMain.handle('turnos:getAll', turnosController.getTurnos);
}
