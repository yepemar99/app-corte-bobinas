import database from '../../db/database';

export const listarTodosPlanesCorteService = async () => {
  try {
    const conn = database.getConnection();
    const query = `
      SELECT id, ancho_estipulado
      FROM Planes_Corte
      ORDER BY id DESC
    `;
    const rows = await conn.query(query);
    return {
      data: rows.map((row) => ({ ...row, id: Number(row?.id) })),
      total: rows.length,
    };
  } catch (error) {
    console.error('Error listando planes de corte:', error.message);
    throw error;
  }
};
