import { listarBobinasParaSelectService } from '../services/bobina.service';

const bobinaController = {
  getAllForSelects: async (_, payload) => {
    try {
      console.log('Payload recibido en getAllForSelects:', payload);
      const bobinas = await listarBobinasParaSelectService(payload);
      return { success: true, data: bobinas.data, total: bobinas.total };
    } catch (error) {
      console.error('Error en bobinaController.getAllForSelects:', error);
      return { success: false, error: error.message };
    }
  },
};

export default bobinaController;
