import database from '../../db/database';

export const listarFlejesPorPlanService = async (payload) => {
  try {
    const { planCorteId } = payload;

    if (!planCorteId) {
      throw new Error('plan_corte_id es requerido');
    }

    const conn = database.getConnection();
    const planId = Number(planCorteId);

    if (isNaN(planId) || planId <= 0) {
      throw new Error('plan_corte_id debe ser un número válido');
    }

    const query = `
      SELECT fpc.*, f.concepto, f.calidad_id, tc.nombre AS calidad, f.espesor, f.ancho
      FROM Flejes_Plan_Corte fpc
      LEFT JOIN Flejes f ON f.id = fpc.fleje_id
      LEFT JOIN Tipos_Calidad tc ON f.calidad_id = tc.id
      WHERE fpc.plan_corte_id = ?
      ORDER BY tc.nombre, f.espesor, f.ancho, f.concepto, f.id DESC
    `;
    const rows = await conn.query(query, [planId]);
    return {
      data: rows.map((row) => ({
        ...row,
        id: Number(row?.id),
        num_flejes: Number(row?.num_flejes),
        peso_unit_definido: Number(row?.peso_unit_definido),
        factor_proporcional_peso: Number(row?.factor_proporcional_peso),
        fleje_id: Number(row?.fleje_id),
        plan_corte_id: Number(row?.plan_corte_id),
        calidad_id: Number(row?.calidad_id),
        calidad: row?.calidad || null,
      })),
      total: rows.length,
    };
  } catch (error) {
    console.error('Error listando flejes por plan:', error.message);
    throw error;
  }
};
