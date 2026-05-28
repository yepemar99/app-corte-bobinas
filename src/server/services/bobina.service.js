import database from '../../db/database';

export const listarBobinasParaSelectService = async (calidadId) => {
  try {
    const calidad = Number(calidadId);

    if (Number.isNaN(calidad) || calidad <= 0) {
      throw new Error('calidad_id debe ser un número válido');
    }

    const conn = database.getConnection();
    const query = `
      SELECT b.id, b.concepto
      FROM Bobinas AS b
      LEFT JOIN Tipos_Calidad AS tc ON b.calidad_id = tc.id
      WHERE b.calidad_id = ?
      ORDER BY tc.nombre, b.concepto ASC
    `;

    const rows = await conn.query(query, [calidad]);

    return {
      data: rows.map((row) => ({
        ...row,
        id: Number(row?.id),
      })),
      total: rows.length,
    };
  } catch (error) {
    console.error('Error listando bobinas para select:', error.message);
    throw error;
  }
};
