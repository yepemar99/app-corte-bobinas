import database from '../../db/database';

export const listarBobinasParaSelectService = async ({ calidadId, ancho }) => {
  try {
    const calidad = Number(calidadId);
    const anchoNum = Number(ancho);

    if (Number.isNaN(calidad) || calidad <= 0) {
      throw new Error('calidad_id debe ser un número válido');
    }
    if (Number.isNaN(anchoNum)) {
      throw new Error('ancho debe ser un número válido');
    }

    const conn = database.getConnection();
    const query = `
      SELECT b.id, b.concepto, f.nombre AS fabricante
      FROM Bobinas AS b
      LEFT JOIN Tipos_Calidad AS tc ON b.calidad_id = tc.id
      LEFT JOIN Fabricantes AS f ON b.fabricante_id = f.id
      WHERE b.calidad_id = ? AND b.ancho = ?
      ORDER BY tc.nombre, b.concepto ASC
    `;

    const rows = await conn.query(query, [calidad, anchoNum]);

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
