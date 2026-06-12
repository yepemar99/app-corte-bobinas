import database from '../../db/database';
import { formatDateForInput, formatDateToDisplay } from '../utils/functions';

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const normalizeText = (value) => (value == null ? '' : String(value));

const guadarProdFlejes = async ({
  conn,
  flejes,
  colada_id,
  numero_bobina,
  turno_prefijo = '',
}) => {
  if (!flejes || !Array.isArray(flejes)) {
    throw new Error('Flejes debe ser un array válido');
  }
  if (numero_bobina <= 0) {
    throw new Error('Número de bobina no válido para guardar flejes');
  }
  let numero_fleje = 1;
  const cantidadFlejes = flejes.reduce((total, fleje) => {
    const numFlejes = toNumber(fleje?.num_flejes, 0);
    return total + numFlejes;
  }, 0);
  for (const fleje of flejes) {
    const cantidad_iteraciones = toNumber(fleje?.num_flejes, 0);
    for (let i = 0; i < cantidad_iteraciones; i++) {
      const fechaLote = formatDateForInput();
      const lote = `CL${fechaLote}${turno_prefijo}${numero_bobina}-${numero_fleje === cantidadFlejes ? 'U' : numero_fleje}`;
      await conn.query(
        `
          INSERT INTO Lotes_Flejes (lote, fleje_plan_corte_id, colada_id)
          VALUES (?, ?, ?)
        `,
        [lote, fleje.id, colada_id],
      );
      numero_fleje = numero_fleje + 1;
    }
  }
};

const getEtiquetasFleje = ({
  flejes,
  turno_prefijo,
  numero_bobina,
  fabricante = '',
}) => {
  let numero_fleje = 1;
  const etiquetas = [];
  const cantidadFlejes = flejes.reduce((total, fleje) => {
    const numFlejes = toNumber(fleje?.num_flejes, 0);
    return total + numFlejes;
  }, 0);
  for (const fleje of flejes) {
    const cantidad_iteraciones = toNumber(fleje?.num_flejes, 0);
    for (let i = 0; i < cantidad_iteraciones; i++) {
      const fechaActual = new Date();
      const fechaLote = formatDateForInput(fechaActual);
      const fechaEtiqueta = formatDateToDisplay(fechaActual);
      const lote = `CL${fechaLote}${turno_prefijo}${numero_bobina}-${numero_fleje === cantidadFlejes ? 'U' : numero_fleje}`;
      etiquetas.push({
        lote,
        calidad: fleje.calidad || '',
        fabricante: fabricante,
        ancho: fleje.ancho || '',
        espesor: fleje.espesor || '', // Ver como se calcula
        peso: fleje.peso_unit_definido || '', // Ver como se calcula
        num_fleje: numero_fleje,
        fecha: fechaEtiqueta,
      });
      numero_fleje = numero_fleje + 1;
    }
  }

  return etiquetas;
};

export const listarBobinasCortadasService = async (planCorteId) => {
  try {
    const conn = database.getConnection();
    const idParaFiltro = toNumber(planCorteId);
    const idValido = idParaFiltro > 0;

    // 1. Usamos prefijos (bobinas_cortadas.) para evitar la ambigüedad
    // 2. Mantenemos 'observacion' al final por el problema del Descriptor Index
    const query = `
      SELECT 
        bobinas_cortadas.id, 
        bobinas_cortadas.numero,
        bobinas_cortadas.bobina_id, 
        bobina.concepto AS bobina_concepto,
        bobinas_cortadas.plan_corte_id, 
        bobinas_cortadas.turno_id, 
        bobinas_cortadas.operario_id, 
        bobinas_cortadas.ancho_inicial, 
        bobinas_cortadas.ancho_final,
        bobinas_cortadas.espesor_inicial,
        bobinas_cortadas.espesor_final,
        bobinas_cortadas.peso_real,
        bobinas_cortadas.creado,
        plan_corte_tbl.id AS plan_corte,
        operario.nombre AS operario_nombre,
        operario.apellido1 AS operario_apellido1,
        operario.apellido2 AS operario_apellido2,
        bobinas_cortadas.observacion
      FROM Bobinas_Cortadas AS bobinas_cortadas
      LEFT JOIN Bobinas AS bobina ON bobina.id = bobinas_cortadas.bobina_id
      LEFT JOIN Planes_Corte AS plan_corte_tbl ON plan_corte_tbl.id = bobinas_cortadas.plan_corte_id
      LEFT JOIN Operarios AS operario ON operario.id = bobinas_cortadas.operario_id
      ${idValido ? 'WHERE bobinas_cortadas.plan_corte_id = ?' : ''}
      ORDER BY bobinas_cortadas.id DESC
    `;

    const params = idValido ? [idParaFiltro] : [];

    const rows = await conn.query(query, params);

    return {
      data: rows.map((row) => ({
        ...row,
        id: Number(row?.id),
        numero: Number(row?.numero),
        bobina_id: Number(row?.bobina_id),
        plan_corte_id: Number(row?.plan_corte_id),
        turno_id: Number(row?.turno_id),
        operario_id: Number(row?.operario_id),
        ancho_inicial: Number(row?.ancho_inicial),
        ancho_final: Number(row?.ancho_final),
        espesor_inicial: Number(row?.espesor_inicial),
        espesor_final: Number(row?.espesor_final),
        peso_real: Number(row?.peso_real),
        operario_nombre_completo:
          `${row?.operario_nombre ?? ''} ${row?.operario_apellido1 ?? ''} ${row?.operario_apellido2 ?? ''}`.trim(),
        plan_corte: Number(row?.plan_corte),
      })),
      total: rows.length,
    };
  } catch (error) {
    console.error('Error detallado en servicio:', error);
    throw error;
  }
};

export const guardarBobinaCortadaService = async (payload) => {
  const conn = database.getConnection();

  const planCorteId = toNumber(payload?.plan_corte_id);
  const bobinaId = toNumber(payload?.bobina_id);
  const operarioId = toNumber(payload?.operario_id);
  const turnoId = toNumber(payload?.turno_id);
  const turnoPrefijo = normalizeText(payload?.turnoPrefijo);
  const pesoKg = toNumber(payload?.peso_kg);
  const espesorInicialMm = toNumber(payload?.espesor_inicial_mm);
  const anchoInicialMm = toNumber(payload?.ancho_inicial_mm);
  const espesorFinalMm = toNumber(payload?.espesor_final_mm);
  const anchoFinalMm = toNumber(payload?.ancho_final_mm);
  const observaciones = normalizeText(
    payload?.observaciones ?? payload?.observacion,
  );
  const fabricante = normalizeText(payload?.fabricante);
  const flejes = Array.isArray(payload?.flejes) ? payload.flejes : [];
  const numero = toNumber(payload?.numero);

  if (planCorteId <= 0) {
    throw new Error('plan_corte_id es requerido');
  }

  if (bobinaId <= 0) {
    throw new Error('bobina_id es requerido');
  }

  if (turnoId <= 0) {
    throw new Error('turno_id es requerido');
  }

  if (operarioId <= 0) {
    throw new Error('operario_id es requerido');
  }

  if (!Number.isFinite(pesoKg) || pesoKg < 0) {
    throw new Error('peso_kg debe ser un número válido');
  }

  if (flejes.length === 0) {
    throw new Error(
      'Debe enviar el array de flejes para actualizar los totales',
    );
  }

  try {
    await conn.query('BEGIN TRANSACTION');

    const bobinasCortadasPrevias = await conn.query(
      'SELECT COUNT(1) AS total FROM Bobinas_Cortadas WHERE plan_corte_id = ?',
      [planCorteId],
    );

    const flejesTotalesPlan = flejes.length;
    const bobinasCortadasActuales = toNumber(
      bobinasCortadasPrevias?.[0]?.total,
    );

    const insertQuery = `
      INSERT INTO Bobinas_Cortadas (
        espesor_inicial,
        ancho_inicial,
        espesor_final,
        ancho_final,
        peso_real,
        observacion,
        turno_id,
        operario_id,
        plan_corte_id,
        bobina_id,
        numero
      )
      OUTPUT INSERTED.id 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertResult = await conn.query(insertQuery, [
      espesorInicialMm,
      anchoInicialMm,
      espesorFinalMm,
      anchoFinalMm,
      pesoKg,
      observaciones,
      turnoId,
      operarioId,
      planCorteId,
      bobinaId,
      numero,
    ]);

    const coladaId = Number(insertResult[0]?.colada_id);
    const etiquetas = await getEtiquetasFleje({
      flejes,
      turno_prefijo: turnoPrefijo,
      numero_bobina: numero,
      fabricante,
    });

    await guadarProdFlejes({
      conn,
      flejes: flejes,
      numero_bobina: numero,
      colada_id: coladaId,
      turno_prefijo: turnoPrefijo,
    });

    const bobinaRows = await conn.query(
      'SELECT unidades FROM Bobinas WHERE id = ?',
      [bobinaId],
    );

    if (!bobinaRows.length) {
      throw new Error('No se encontró la bobina seleccionada');
    }

    const bobinaActual = bobinaRows[0];
    const bobinaUnidadesActuales = toNumber(bobinaActual?.unidades);

    await conn.query('UPDATE Bobinas SET unidades = ? WHERE id = ?', [
      Math.max(bobinaUnidadesActuales - 1, 0),
      bobinaId,
    ]);

    for (const fleje of flejes) {
      const flejeId = toNumber(fleje?.fleje_id);
      const numFlejes = toNumber(fleje?.num_flejes);
      const factorProporcionalPeso = toNumber(fleje?.factor_proporcional_peso);

      if (flejeId <= 0) {
        throw new Error('Cada fleje debe incluir fleje_id');
      }

      const flejeRows = await conn.query(
        'SELECT unidades, peso_total, peso_medio FROM Flejes WHERE id = ?',
        [flejeId],
      );

      if (!flejeRows.length) {
        throw new Error(`No se encontró el fleje con id ${flejeId}`);
      }

      const flejeActual = flejeRows[0];
      const unidadesActuales = toNumber(flejeActual?.unidades);
      const pesoTotalActual = toNumber(flejeActual?.peso_total);
      const pesoMedioActual = toNumber(flejeActual?.peso_medio);
      const pesoCalculado = (factorProporcionalPeso * pesoKg) / 1000;
      const nuevasUnidades = unidadesActuales + numFlejes;
      const nuevoPesoTotal = pesoTotalActual + pesoCalculado;
      const nuevoPesoMedio =
        nuevasUnidades > 0 ? nuevoPesoTotal / nuevasUnidades : pesoMedioActual;

      await conn.query(
        `
          UPDATE Flejes
          SET unidades = ?, peso_total = ?, peso_medio = ?
          WHERE id = ?
        `,
        [nuevasUnidades, nuevoPesoTotal, nuevoPesoMedio, flejeId],
      );
    }

    const bobinasCortadasDespues = await conn.query(
      'SELECT COUNT(1) AS total FROM Bobinas_Cortadas WHERE plan_corte_id = ?',
      [planCorteId],
    );

    const bobinasCortadasFinales = toNumber(bobinasCortadasDespues?.[0]?.total);

    await conn.query('COMMIT');

    return {
      data: insertResult,
      etiquetas,
      message: 'Bobina cortada guardada correctamente',
    };
  } catch (error) {
    try {
      await conn.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error haciendo rollback:', rollbackError.message);
    }

    console.error('Error guardando bobina cortada:', error.message);
    throw error;
  }
};
