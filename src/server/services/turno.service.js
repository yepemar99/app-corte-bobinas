import database from '../../db/database';

export const listarTodosTurnosService = async () => {
  try {
    const conn = database.getConnection();
    const query = `
      SELECT id, entrada, salida
      FROM Turnos
      ORDER BY id ASC 
    `;

    const rows = await conn.query(query);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        entrada: row.entrada,
        salida: row.salida,
        horario: `${row.entrada} - ${row.salida}`,
      })),
      total: rows.length,
    };
  } catch (error) {
    console.error('Error listando turnos:', error.message);
    throw error;
  }
};
