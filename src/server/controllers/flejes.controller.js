import { listarFlejesPorPlanService } from '../services/flejes.service';
import { listarTodosPlanesCorteService } from '../services/plan.service';

const flejesController = {
  getFlejesPorPlan: async (_, payload) => {
    try {
      const flejes = await listarFlejesPorPlanService(payload);
      return { success: true, data: flejes.data, total: flejes.total };
    } catch (error) {
      console.error('Error en flejesController.getFlejesPorPlan:', error);
      return { success: false, error: error.message };
    }
  },
};

export default flejesController;
