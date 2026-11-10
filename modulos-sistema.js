'use strict';

/**
 * Módulos que se capturan para la demo "Sistema de gestión integral".
 *
 * Para agregar, quitar o reordenar módulos basta con editar este archivo.
 * `acciones` es opcional y acepta: { t: 'esperar', ms } | { t: 'scroll', px, ms }
 * | { t: 'hover', sel } | { t: 'click', sel }.
 *
 * `viewport` es opcional y permite capturar un módulo con más ancho.
 */

// Cliente con mayor cantidad de trámites, usado para mostrar una ficha con historial.
const ID_CLIENTE_DEMO = 4333;

const modulos = [
  {
    id: '01-panel',
    nombre: 'Panel principal',
    descripcion:
      'Punto de entrada del sistema. Desde acá se accede a todos los módulos, y la visibilidad de cada acceso depende del perfil del usuario que inició sesión.',
    ruta: 'index.php',
    acciones: [
      { t: 'esperar', ms: 900 },
      { t: 'scroll', px: 500, ms: 900 },
      { t: 'scroll', px: 500, ms: 900 },
      { t: 'scroll', px: -1000, ms: 700 },
    ],
  },
  {
    id: '02-clientes',
    nombre: 'Clientes registrados',
    descripcion:
      'Listado completo de clientes con el total a la vista: 13.761 registros. Cada fila trae vendedor asignado, estado de la venta, red social de origen, trámite inicial, costo, número de trámites y fecha de inicio. Se filtra por estado, red social, tipo de trámite y rango de fechas, o se busca por nombre, teléfono o código.',
    ruta: 'listado_clientes_nuevos.php',
    acciones: [
      { t: 'esperar', ms: 1400 },
      { t: 'scroll', px: 700, ms: 900 },
      { t: 'scroll', px: 700, ms: 900 },
      { t: 'scroll', px: 700, ms: 900 },
      { t: 'scroll', px: -2100, ms: 700 },
    ],
  },
  {
    id: '03-ficha-cliente',
    nombre: 'Ficha del cliente en PDF',
    descripcion:
      'La ficha del cliente generada como documento: datos, trámites, costo de cada uno y saldo pendiente. Se produce desde el sistema con los datos del expediente, sin re-tipear nada a mano.',
    ruta: `ficha_cliente.php?id_cliente=${ID_CLIENTE_DEMO}`,
    acciones: [{ t: 'esperar', ms: 2500 }],
  },
  {
    id: '04-cotizaciones',
    nombre: 'Cotizaciones',
    descripcion:
      'Historial de cotizaciones con su estado de venta. Cada cotización se genera en dos monedas y dos formatos, se puede reutilizar, reordenar ítems y dejarle notas.',
    ruta: 'historial_coti_clientes.php',
    acciones: [
      { t: 'esperar', ms: 1000 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -1200, ms: 700 },
    ],
  },
  {
    id: '05-tramites',
    nombre: 'Catálogo de trámites y precios',
    descripcion:
      'El catálogo de servicios con su costo: registro de marca, sociedades anónimas, patentes, contratos, declaraciones juradas. Es la base sobre la que se cotiza y se calcula cada expediente.',
    ruta: 'listado_tramites.php?pagina=1',
    acciones: [
      { t: 'esperar', ms: 1000 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -600, ms: 700 },
    ],
  },
  {
    id: '06-documentacion',
    nombre: 'Documentación de clientes',
    descripcion:
      'Estado de cada cliente frente a sus trámites: finalizados, en proceso o sin registrar, con la marca o sociedad asociada. Setenta y ocho páginas de expedientes navegables y filtrables.',
    ruta: 'doc_clientes.php',
    acciones: [
      { t: 'esperar', ms: 2500 },
      { t: 'click', sel: 'text=Entendido' },
      { t: 'esperar', ms: 1000 },
      { t: 'scroll', px: 500, ms: 900 },
      { t: 'scroll', px: -500, ms: 700 },
    ],
  },
  {
    id: '07-marcas',
    nombre: 'Administración de marcas',
    descripcion:
      'Gestión del registro marcario: expedientes por tipo de solicitud, comprobantes de pago, títulos y reportes de pago por período. Más de quinientos expedientes con sus archivos asociados.',
    ruta: 'listado_admon_marcas.php?page=1',
    viewport: { width: 1920, height: 1080 },
    acciones: [
      { t: 'esperar', ms: 1400 },
      { t: 'scroll', px: 700, ms: 900 },
      { t: 'scroll', px: 700, ms: 900 },
      { t: 'scroll', px: -1400, ms: 700 },
    ],
  },
  {
    id: '08-reporte-llamadas',
    nombre: 'Reporte de llamadas',
    descripcion:
      'Seguimiento de llamadas a clientes: quién llamó, cuándo, cuántos intentos y en qué quedó. Con búsqueda, filtros y exportación a PDF desde la misma pantalla.',
    ruta: 'reporte_llamadas.php',
    viewport: { width: 1920, height: 1080 },
    acciones: [
      { t: 'esperar', ms: 1200 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -1200, ms: 700 },
    ],
  },
  {
    id: '09-reporte-pagos',
    nombre: 'Reporte de pagos de marca',
    descripcion:
      'Estado de cuenta de cada expediente marcario: monto total, pagado, pendiente, pago de edicto y pago de título. Es el reporte que reemplaza el seguimiento manual de cobros.',
    ruta: 'marcas/reporte_pagos_marca.php',
    viewport: { width: 1920, height: 1080 },
    acciones: [
      { t: 'esperar', ms: 1500 },
      { t: 'scroll', px: 700, ms: 900 },
      { t: 'scroll', px: 700, ms: 900 },
      { t: 'scroll', px: -1400, ms: 700 },
    ],
  },
  {
    id: '10-bitacora',
    nombre: 'Bitácora de auditoría',
    descripcion:
      'Cada acción registrada: quién hizo qué y cuándo. Cuando hay un error en un expediente, esto es lo que permite reconstruir qué pasó en lugar de suponerlo.',
    ruta: 'bitacora.php',
    acciones: [
      { t: 'esperar', ms: 1200 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -600, ms: 700 },
    ],
  },
  {
    id: '11-asistencia',
    nombre: 'Asistencia y tareas',
    descripcion:
      'Marcaje de entrada y salida, control de almuerzos y salidas extraordinarias. Tareas del día con múltiples responsables, prioridad, comentarios, documentos adjuntos y notificaciones.',
    ruta: 'asistencia/tareas_dia.php',
    acciones: [
      { t: 'esperar', ms: 1200 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -1200, ms: 700 },
    ],
  },
];

module.exports = { modulos };
