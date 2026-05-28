import { listarTodosTurnosService } from '../services/turno.service';

const turnosController = {
  getTurnos: async () => {
    try {
      const turnos = await listarTodosTurnosService();
      return { success: true, data: turnos.data, total: turnos.total };
    } catch (error) {
      console.error('Error en turnosController.getTurnos:', error);
      return { success: false, error: error.message };
    }
  },
};

export default turnosController;
