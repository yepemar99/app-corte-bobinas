import { ipcMain } from 'electron';
import flejesController from '../controllers/flejes.controller';

export default function flejesRoutes() {
  ipcMain.handle('flejes:getByPlanCorteId', flejesController.getFlejesPorPlan);
}
