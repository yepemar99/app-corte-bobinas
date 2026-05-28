import { listarBobinasParaSelectService } from '../services/bobina.service';

const bobinaController = {
  getAllForSelects: async (_, payload) => {
    try {
      const calidadId = payload?.calidad_id ?? payload?.id ?? payload;
      const bobinas = await listarBobinasParaSelectService(calidadId);
      return { success: true, data: bobinas.data, total: bobinas.total };
    } catch (error) {
      console.error('Error en bobinaController.getAllForSelects:', error);
      return { success: false, error: error.message };
    }
  },
};

export default bobinaController;
