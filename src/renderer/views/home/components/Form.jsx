import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { set, z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Checklist,
  Inventory2,
  Person,
  PrecisionManufacturing,
  Save,
  Straighten,
  ViewList,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import Select from '../../../components/common/Select';
import TextField from '../../../components/common/Textfield';
import { DataContext } from '../../../contexts/DataContext';
import Modal from '../../../components/common/Modal';
import LoadingModal from './LoadingModal';

const planCorteSchema = z.object({
  plan_corte_id: z.coerce.number().min(1, 'Requerido'),
  bobina_id: z.coerce.number().min(1, 'Requerido'),
  operario_id: z.coerce.number().min(1, 'Requerido'),
  turno_id: z.coerce.number().min(1, 'Requerido'),
  espesor_inicial_mm: z.coerce.number().min(1, 'Requerido'),
  ancho_inicial_mm: z.coerce.number().min(1, 'Requerido'),
  espesor_final_mm: z.coerce.number().min(1, 'Requerido'),
  ancho_final_mm: z.coerce.number().min(1, 'Requerido'),
  peso_kg: z.coerce.number().min(1, 'Requerido'),
  observaciones: z.string().optional(),
});

const emptyText = '-';

const readValue = (row, keys, fallback = emptyText) => {
  for (const key of keys) {
    const value = key.split('.').reduce((acc, part) => acc?.[part], row);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return fallback;
};

const normalizeRows = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

const normalizeRecord = (result) => {
  if (Array.isArray(result?.data)) return result.data[0] || null;
  if (result?.data && typeof result.data === 'object') return result.data;
  if (result && typeof result === 'object' && !Array.isArray(result))
    return result;
  return null;
};

const getWindowApiMethod = (paths) => {
  if (typeof window === 'undefined' || !window.api) return null;

  for (const path of paths) {
    const method = path.reduce((acc, key) => acc?.[key], window.api);
    if (typeof method === 'function') {
      return method;
    }
  }

  return null;
};

const loadApiRows = async (paths, args) => {
  const method = getWindowApiMethod(paths);

  if (!method) {
    return [];
  }

  const result = await method(args);
  return normalizeRows(result);
};

const loadApiRecord = async (paths, args) => {
  const method = getWindowApiMethod(paths);

  if (!method) {
    return null;
  }

  const result = await method(args);
  return normalizeRecord(result);
};

const TableShell = ({ title, icon, rows, columns, emptyMessage }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1,
      }}
    >
      {title && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          {icon}
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
      )}

      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  align={column.align || 'left'}
                  key={column.key}
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign={'center'}
                  >
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={row.id ?? row.fleje_id ?? row.bobina_id ?? index}
                >
                  {columns.map((column) => (
                    <TableCell
                      align={column.align || 'left'}
                      key={`${column.key}-${index}`}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {column.render
                        ? column.render(row, index)
                        : readValue(row, column.keys || [column.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const Form = () => {
  const { operarios, turnos } = useContext(DataContext);
  const [planesCorte, setPlanesCorte] = useState([]);
  const [flejesPlan, setFlejesPlan] = useState([]);
  const [bobinasCortadas, setBobinasCortadas] = useState([]);
  const [bobinas, setBobinas] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [calidadId, setCalidadId] = useState(null);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingFlejes, setLoadingFlejes] = useState(false);
  const [loadingBobinas, setLoadingBobinas] = useState(false);
  const [loadingBobinasCortadas, setLoadingBobinasCortadas] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error validacion
  const [error, setError] = useState(null);
  const [pendingData, setPendingData] = useState(null);

  const methods = useForm({
    resolver: zodResolver(planCorteSchema),
    defaultValues: {
      plan_corte_id: 0,
      bobina_id: 0,
      operario_id: 0,
      turno_id: 0,
      espesor_inicial_mm: '',
      ancho_inicial_mm: '',
      espesor_final_mm: '',
      ancho_final_mm: '',
      peso_kg: '',
      observaciones: '',
    },
  });

  const { handleSubmit, reset, setValue, watch } = methods;

  const watchPlanId = watch('plan_corte_id');
  const watchBobinaId = watch('bobina_id');

  const loadPlanes = async () => {
    try {
      setLoadingPlanes(true);
      const rows = await loadApiRows([['planes', 'getAll']]);
      setPlanesCorte(rows);
    } catch (error) {
      toast.error(
        error?.message || 'No se pudieron cargar los planes de corte',
      );
      setPlanesCorte([]);
    } finally {
      setLoadingPlanes(false);
    }
  };

  const loadPlanData = async (planId) => {
    if (!planId) {
      setPlanSeleccionado(null);
      setFlejesPlan([]);
      setBobinasCortadas([]);
      setCalidadId(null);
      setBobinas([]);
      return;
    }

    try {
      setLoadingPlan(true);
      setLoadingFlejes(true);
      setLoadingBobinasCortadas(true);
      setPlanSeleccionado(null);
      setFlejesPlan([]);
      setBobinasCortadas([]);
      setCalidadId(null);
      setLoadingBobinas(true);
      setBobinas([]);

      const plan = planesCorte.find((p) => p.id === Number(planId));

      if (!plan) {
        throw new Error('Plan de corte no encontrado');
      }

      const bobinasDelPlan = await loadApiRows(
        [['bobinasCortadas', 'getAll']],
        { plan_corte_id: planId },
      );
      const flejes = await loadApiRows([['flejes', 'getByPlanCorteId']], {
        planCorteId: planId,
      });

      setPlanSeleccionado(plan);
      setFlejesPlan(flejes);
      setBobinasCortadas(bobinasDelPlan);

      setPlanSeleccionado(plan);
      setFlejesPlan(flejes);
      setBobinasCortadas(bobinasDelPlan);

      const planCalidadId =
        flejes.find((row) => row?.calidad_id != null)?.calidad_id || null;

      console.log('planCalidadId determinado:', plan);

      const bobinas = await loadApiRows([['bobinas', 'getAllForSelects']], {
        calidadId: planCalidadId,
        ancho: plan?.ancho_estipulado || null,
      });

      setBobinas(bobinas);
      setLoadingBobinas(false);
      setCalidadId(planCalidadId ? Number(planCalidadId) : null);
    } catch (error) {
      toast.error(error?.message || 'No se pudieron cargar los datos del plan');
      setPlanSeleccionado(null);
      setFlejesPlan([]);
      setBobinasCortadas([]);
      setCalidadId(null);
    } finally {
      setLoadingPlan(false);
      setLoadingFlejes(false);
      setLoadingBobinasCortadas(false);
    }
  };

  const loadBobinas = async (calidad, ancho) => {
    if (!calidad || !ancho) {
      setBobinas([]);
      return;
    }

    try {
      setLoadingBobinas(true);
      const result = await window.api?.bobinas?.getAllForSelects({
        calidadId: calidad,
        ancho: ancho,
      });
      const rows = normalizeRows(result);
      setBobinas(rows);
    } catch (error) {
      toast.error(error?.message || 'No se pudieron cargar las bobinas');
      setBobinas([]);
    } finally {
      setLoadingBobinas(false);
    }
  };

  useEffect(() => {
    void loadPlanes();
  }, []);

  useEffect(() => {
    void loadPlanData(watchPlanId);
  }, [watchPlanId]);

  const planesOptions = useMemo(
    () =>
      planesCorte.map((plan) => ({
        value: plan.id,
        label:
          [plan.codigo, plan.nombre, plan.descripcion]
            .filter(Boolean)
            .join(' - ') || `Plan ${plan.id}`,
      })),
    [planesCorte],
  );

  const operarioOptions = useMemo(
    () =>
      operarios.map((operario) => ({
        value: operario.id,
        label:
          operario.nombre_completo ||
          [operario.nombre, operario.apellido1, operario.apellido2]
            .filter(Boolean)
            .join(' '),
      })),
    [operarios],
  );

  const turnoOptions = useMemo(
    () =>
      turnos.map((turno) => ({
        value: turno.id,
        label: turno.horario || `Turno ${turno.id}`,
      })),
    [turnos],
  );

  const bobinaOptions = useMemo(
    () =>
      bobinas.map((bobina) => ({
        value: bobina.id,
        label: bobina?.concepto || '',
      })),
    [bobinas],
  );

  const pesoTotalPlan = useMemo(() => {
    return flejesPlan.reduce((total, row) => {
      const peso = Number(
        readValue(
          row,
          ['peso', 'peso_kg', 'peso_unitario', 'peso_estimado'],
          0,
        ),
      );
      return total + (Number.isFinite(peso) ? peso : 0);
    }, 0);
  }, [flejesPlan]);

  const onSubmit = async (data) => {
    const valid = handleValidData(data);
    if (!valid) return;
    handleConfirm(data);
  };

  const handleCancel = () => {
    reset();
    setPlanSeleccionado(null);
    setFlejesPlan([]);
    setBobinasCortadas([]);
    setBobinas([]);
    setCalidadId(null);
  };

  const handleValidData = (data) => {
    if (
      data?.espesor_inicial_mm < 1 ||
      data?.espesor_inicial_mm > 6 ||
      data?.espesor_final_mm < 1 ||
      data?.espesor_final_mm > 6 ||
      data?.ancho_inicial_mm < 1000 ||
      data?.ancho_inicial_mm > 6000 ||
      data?.ancho_final_mm < 1000 ||
      data?.ancho_final_mm > 6000
    ) {
      setPendingData(data);
      setError(true);
      return false;
    }
    return true;
  };

  const handleConfirm = async (data) => {
    setPendingData(null);
    setError(null);
    setLoading(true);
    const turnoSeleccionado = turnos.find(
      (t) => t.id === Number(data.turno_id),
    );
    const findBobina = bobinas.find((b) => b.id === Number(data.bobina_id));
    const fabricante = findBobina?.fabricante || '';
    const payload = {
      plan_corte_id: Number(data.plan_corte_id),
      bobina_id: Number(data.bobina_id),
      fabricante: fabricante,
      operario_id: Number(data.operario_id),
      turno_id: Number(data.turno_id),
      turnoPrefijo: turnoSeleccionado?.prefijo || '',
      calidad_id: calidadId ? Number(calidadId) : null,
      espesor_inicial_mm: Number(data.espesor_inicial_mm),
      ancho_inicial_mm: Number(data.ancho_inicial_mm),
      espesor_final_mm: Number(data.espesor_final_mm),
      ancho_final_mm: Number(data.ancho_final_mm),
      peso_kg: Number(data.peso_kg),
      observaciones: data.observaciones || '',
      flejes: flejesPlan,
    };

    try {
      const saveMethod = getWindowApiMethod([['bobinasCortadas', 'save']]);

      if (!saveMethod) {
        toast.info('Formulario listo. Falta exponer la API de guardado.');
        return;
      }

      const result = await saveMethod({
        ...payload,
        numero: bobinasCortadas.length + 1,
      });
      if (result?.success === false) {
        throw new Error(result?.error || 'No se pudo guardar el registro');
      }

      const etiquetas = Array.isArray(result?.etiquetas)
        ? result.etiquetas
        : [];
      const printMethod = getWindowApiMethod([['zebra', 'printEtiquetas']]);

      if (printMethod && etiquetas.length > 0) {
        const printResult = await printMethod({ etiquetas });
        if (printResult?.success === false) {
          toast.error(
            printResult?.error ||
              'Se guardó el corte, pero no se pudo imprimir la Zebra',
          );
        }
      }

      reset({
        plan_corte_id: data.plan_corte_id,
        bobina_id: 0,
        operario_id: data.operario_id,
        turno_id: data.turno_id,
        espesor_inicial_mm: '',
        ancho_inicial_mm: '',
        espesor_final_mm: '',
        ancho_final_mm: '',
        peso_kg: '',
        observaciones: '',
      });
      setError(null);
      toast.success('Registro guardado correctamente');
      setLoading(false);
      loadPlanData(data.plan_corte_id);
    } catch (error) {
      toast.error(error?.message || 'No se pudo guardar el registro');
    }
  };

  return (
    <FormProvider {...methods}>
      <LoadingModal open={loading} />
      <Modal open={!!error} onClose={() => setError(null)}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Le recomendamos revisar los datos de la bobina
        </Typography>
        <Typography variant="body2">
          El espesor inicial y final deberia estar entre 1mm y 6mm
        </Typography>
        <Typography variant="body2">
          El ancho inicial y final deberia estar entre 1000mm y 6000mm
        </Typography>
        <Typography variant="body2">
          ¿ Desea continuar de igual forma ?
        </Typography>
        <Stack gap={2} justifyContent={'flex-end'}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleConfirm(pendingData)}
          >
            Continuar
          </Button>
          <Button
            variant="contained"
            color={'secondary'}
            size="small"
            onClick={() => setError(null)}
          >
            Volver a revisar
          </Button>
        </Stack>
      </Modal>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          height: 'calc(100vh - 120px)',
          p: 2,
        }}
      >
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box>
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={'space-between'}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ flex: 1 }}
                    >
                      <PrecisionManufacturing color="primary" />
                      <Typography variant="h6">Plan de corte</Typography>
                    </Stack>
                    <Chip
                      sx={{
                        '.MuiChip-label': { textTransform: 'none !important' },
                      }}
                      label={`Ancho (mm): ${readValue(planSeleccionado, [
                        'ancho_estipulado',
                      ])}`}
                      color="secondary"
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Stack sx={{ mt: 0.5 }}></Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 0.5 }}
                >
                  <Chip
                    label={`Flejes: ${flejesPlan.length}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Bobinas cortadas: ${bobinasCortadas.length}`}
                    color="secondary"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'repeat(12, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >
                <Box sx={{ gridColumn: { xs: '1', lg: 'span 4' } }}>
                  <Select
                    size="small"
                    name="plan_corte_id"
                    label="Plan de corte"
                    loading={loadingPlanes}
                    options={planesOptions}
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', lg: 'span 4' } }}>
                  <Select
                    size="small"
                    name="operario_id"
                    label="Operario"
                    options={operarioOptions}
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', lg: 'span 4' } }}>
                  <Select
                    size="small"
                    name="turno_id"
                    label="Turno"
                    options={turnoOptions}
                  />
                </Box>
              </Box>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Straighten color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Medidas y peso de la bobina
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Select
                    size="small"
                    name="bobina_id"
                    label="Bobina a cortar"
                    loading={loadingBobinas}
                    disabled={!calidadId || bobinas.length === 0}
                    options={bobinaOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    name="espesor_inicial_mm"
                    label="Espesor inicial (mm)"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    name="ancho_inicial_mm"
                    label="Ancho inicial (mm)"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    name="espesor_final_mm"
                    label="Espesor final (mm)"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    name="ancho_final_mm"
                    label="Ancho final (mm)"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    size="small"
                    name="peso_kg"
                    label="Peso (kg)"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    size="small"
                    name="observaciones"
                    label="Observaciones"
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                flex: 1,
                height: 'calc(50vh - 120px)',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                justifyContent={'space-between'}
                sx={{ mb: 1 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ViewList color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Flejes a cortar según el plan
                  </Typography>
                </Stack>
              </Stack>

              <TableShell
                icon={<Checklist color="primary" />}
                rows={flejesPlan}
                emptyMessage={
                  loadingPlan || loadingFlejes
                    ? 'Cargando flejes...'
                    : 'Selecciona un plan para ver sus flejes.'
                }
                columns={[
                  {
                    key: 'fleje',
                    label: 'Fleje',
                    keys: [
                      'fleje.concepto',
                      'fleje.nombre',
                      'concepto',
                      'nombre',
                    ],
                  },
                  {
                    key: 'num_flejes',
                    label: 'Cant. Flejes',
                    keys: ['num_flejes'],
                    render: (row) =>
                      `${readValue(row, ['num_flejes'], '-')} flejes`,
                  },
                  {
                    key: 'factor_proporcional_peso',
                    label: 'Factor Proporcional',
                    keys: ['factor_proporcional_peso'],
                    render: (row) =>
                      `${readValue(row, ['factor_proporcional_peso'], '-')} kg`,
                  },
                ]}
              />
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                mt: 1,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                flex: 1,
                height: 'calc(50vh - 120px)',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Inventory2 color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Bobinas cortadas del plan
                </Typography>
              </Stack>

              <TableShell
                icon={<Inventory2 color="primary" />}
                rows={bobinasCortadas}
                emptyMessage={
                  loadingPlan || loadingBobinasCortadas
                    ? 'Cargando bobinas cortadas...'
                    : 'Todavía no hay bobinas cortadas para este plan.'
                }
                columns={[
                  {
                    key: 'creado',
                    label: 'Fecha',
                    keys: ['creado'],
                    render: (row) => `${readValue(row, ['creado'], '-')}`,
                  },
                  {
                    key: 'plan_corte',
                    label: 'Plan de Corte',
                    align: 'center',
                    keys: ['plan_corte'],
                    render: (row) => `${readValue(row, ['plan_corte'], '-')}`,
                  },
                  {
                    key: 'numero',
                    label: 'Número',
                    align: 'center',
                    keys: ['numero'],
                    render: (row) => `${readValue(row, ['numero'], '-')}`,
                  },
                  {
                    key: 'bobina',
                    label: 'Bobina',
                    keys: ['concepto'],
                    render: (row) => readValue(row, ['bobina_concepto'], '-'),
                  },
                  {
                    key: 'espesor_inicial',
                    label: 'Espesor inicial (mm)',
                    align: 'center',
                    keys: ['espesor_inicial'],
                    render: (row) =>
                      `${readValue(row, ['espesor_inicial'], '-')}`,
                  },
                  {
                    key: 'espesor_final',
                    label: 'Espesor final (mm)',
                    align: 'center',
                    keys: ['espesor_final'],
                    render: (row) =>
                      `${readValue(row, ['espesor_final'], '-')}`,
                  },
                  {
                    key: 'ancho_inicial',
                    label: 'Ancho inicial (mm)',
                    align: 'center',
                    keys: ['ancho_inicial'],
                    render: (row) =>
                      `${readValue(row, ['ancho_inicial'], '-')}`,
                  },
                  {
                    key: 'ancho_final',
                    label: 'Ancho final (mm)',
                    align: 'center',
                    keys: ['ancho_final'],
                    render: (row) => `${readValue(row, ['ancho_final'], '-')}`,
                  },

                  {
                    key: 'peso',
                    label: 'Peso (kg)',
                    align: 'center',
                    keys: ['peso_real'],
                    render: (row) => `${readValue(row, ['peso_real'], '-')} kg`,
                  },
                  {
                    key: 'operario_nombre_completo',
                    label: 'Operario',
                    keys: ['operario_nombre_completo'],
                    render: (row) =>
                      `${readValue(row, ['operario_nombre_completo'], '-')}`,
                  },
                ]}
              />
            </Paper>
          </Grid>
        </Grid>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          flexWrap="wrap"
          sx={{ mt: 1 }}
        >
          <Button
            size="small"
            variant="contained"
            type="submit"
            startIcon={<Save />}
          >
            Guardar corte
          </Button>
        </Stack>
      </Box>
    </FormProvider>
  );
};

export default Form;
