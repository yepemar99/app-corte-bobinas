import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('versions', {
  chrome: process.versions['chrome'],
  node: process.versions['node'],
  electron: process.versions['electron'],
});

contextBridge.exposeInMainWorld('api', {
  operarios: {
    getAll: () => ipcRenderer.invoke('operarios:getAll'),
  },
  turnos: {
    getAll: () => ipcRenderer.invoke('turnos:getAll'),
  },
  planes: {
    getAll: () => ipcRenderer.invoke('planes:getAll'),
  },
  bobinas: {
    getAllForSelects: (payload) =>
      ipcRenderer.invoke('bobinas:getAllForSelects', payload),
  },
  bobinasCortadas: {
    save: (payload) => ipcRenderer.invoke('bobinasCortadas:save', payload),
    getAll: (payload) => ipcRenderer.invoke('bobinasCortadas:getAll', payload),
  },
  flejes: {
    getByPlanCorteId: (payload) =>
      ipcRenderer.invoke('flejes:getByPlanCorteId', payload),
  },
});
