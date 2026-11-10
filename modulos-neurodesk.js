'use strict';

/**
 * Módulos que se capturan para la demo "Sistema de expediente clínico digital"
 * (NeuroDesk).
 *
 * `viewport` es opcional y permite capturar un módulo con más ancho.
 * `acciones` es opcional y acepta: { t: 'esperar', ms } | { t: 'scroll', px, ms }
 * | { t: 'hover', sel } | { t: 'click', sel }.
 */

const modulos = [
  {
    id: '01-dashboard',
    nombre: 'Dashboard',
    descripcion:
      'Panel de inicio del centro de salud: resumen de pacientes, expedientes clínicos, sesiones pendientes y realizadas, con acceso rápido a cada área.',
    ruta: 'dashboard',
    acciones: [
      { t: 'esperar', ms: 1200 },
      { t: 'scroll', px: 500, ms: 800 },
      { t: 'scroll', px: -500, ms: 600 },
    ],
  },
  {
    id: '02-pacientes',
    nombre: 'Pacientes',
    descripcion:
      'Listado de pacientes del sistema: nombre, edad, teléfono y acciones para editar o dar de baja cada uno.',
    ruta: 'pacientes',
    acciones: [
      { t: 'esperar', ms: 1000 },
      { t: 'scroll', px: 500, ms: 800 },
      { t: 'scroll', px: -500, ms: 600 },
    ],
  },
  {
    id: '03-expedientes',
    nombre: 'Expedientes clínicos',
    descripcion:
      'Listado de expedientes clínicos activos con paciente, estado y fecha de apertura.',
    ruta: 'expedientes',
    acciones: [
      { t: 'esperar', ms: 1000 },
      { t: 'scroll', px: 500, ms: 800 },
      { t: 'scroll', px: -500, ms: 600 },
    ],
  },
  {
    id: '04-expediente-detalle',
    nombre: 'Detalle del expediente',
    descripcion:
      'Expediente completo del paciente: consentimiento, historia clínica, examen mental, plan de tratamiento y registro de sesiones.',
    ruta: 'expedientes/cmrvl13wq000104l5w5vmed2h',
    acciones: [
      { t: 'esperar', ms: 1500 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -600, ms: 700 },
    ],
  },
  {
    id: '05-historia-clinica',
    nombre: 'Historia clínica',
    descripcion:
      'Historia clínica detallada del paciente: motivo de consulta, medicación, antecedentes psicosociales y diagnóstico.',
    ruta: 'expedientes/cmrvl13wq000104l5w5vmed2h/historia-clinica',
    acciones: [
      { t: 'esperar', ms: 1400 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -600, ms: 700 },
    ],
  },
  {
    id: '06-examen-mental',
    nombre: 'Examen mental',
    descripcion:
      'Evaluaciones del estado mental registradas: apariencia, actitud, lenguaje, orientación, conciencia, desempeño, percepción y ánimo.',
    ruta: 'expedientes/cmrvl13wq000104l5w5vmed2h/examen-mental',
    acciones: [
      { t: 'esperar', ms: 1400 },
      { t: 'scroll', px: 500, ms: 800 },
      { t: 'scroll', px: -500, ms: 600 },
    ],
  },
  {
    id: '07-examen-mental-detalle',
    nombre: 'Examen mental — detalle',
    descripcion:
      'Detalle de una evaluación del estado mental: apariencia y actitud, evaluación del lenguaje, orientación, conciencia, desempeño, percepción, ánimo y otros síntomas.',
    ruta: 'expedientes/cmrvl13wq000104l5w5vmed2h/examen-mental/cmrxtom23000004l9bbub2qa6',
    acciones: [
      { t: 'esperar', ms: 1800 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -600, ms: 700 },
    ],
  },
  {
    id: '08-evolucion-sesion',
    nombre: 'Hoja de evolución de sesión',
    descripcion:
      'Hoja de evolución de una sesión: vista previa de las 12 sesiones del expediente y evolución registrada por fecha.',
    ruta: 'expedientes/cmrvl13wq000104l5w5vmed2h/sesiones/cmrvl8r2o000004l2gomshl2r/evolucion',
    acciones: [
      { t: 'esperar', ms: 2500 },
      { t: 'scroll', px: 600, ms: 900 },
      { t: 'scroll', px: -600, ms: 700 },
    ],
  },
];

module.exports = { modulos };
