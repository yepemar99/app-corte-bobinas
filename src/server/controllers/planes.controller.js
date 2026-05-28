import { listarTodosPlanesCorteService } from '../services/plan.service';

const planesController = {
  getPlanesCorte: async (_, payload) => {
    try {
      const planes = await listarTodosPlanesCorteService();
      return { success: true, data: planes.data, total: planes.total };
    } catch (error) {
      console.error('Error en planesController.getPlanesCorte:', error);
      return { success: false, error: error.message };
    }
  },
};

export default planesController;
