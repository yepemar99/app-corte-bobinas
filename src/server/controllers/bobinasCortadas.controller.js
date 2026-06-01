import {
  guardarBobinaCortadaService,
  listarBobinasCortadasService,
} from '../services/bobinasCortadas.service';

const bobinasCortadasController = {
  getAll: async (_, payload) => {
    try {
      const planCorteId = payload?.plan_corte_id ?? payload;
      const result = await listarBobinasCortadasService(planCorteId);
      return { success: true, data: result.data, total: result.total };
    } catch (error) {
      console.error('Error en bobinasCortadasController.getAll:', error);
      return { success: false, error: error.message };
    }
  },

  save: async (_, payload) => {
    try {
      const result = await guardarBobinaCortadaService(payload);
      return {
        success: true,
        data: result.data,
        etiquetas: result.etiquetas,
        message: result.message,
      };
    } catch (error) {
      console.error('Error en bobinasCortadasController.save:', error);
      return { success: false, error: error.message };
    }
  },
};

export default bobinasCortadasController;
