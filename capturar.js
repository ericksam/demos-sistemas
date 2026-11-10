'use strict';

/**
 * Captura de pantallas y video de las demos.
 *
 * Uso:
 *   npm run demo                -> recorre todas las demos de demos.json
 *   npm run demo -- --demo neurodesk
 *   npm run demo -- --login     -> fuerza un login nuevo
 *
 * El script abre el navegador en la pantalla de login de la demo. La sesión
 * la inicia la persona a mano: la contraseña nunca se escribe en ningún
 * archivo. Cuando detecta que se entró al sistema, recorre los módulos de
 * esa demo y genera salida/<carpeta>/informe.html con capturas y videos.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = __dirname;
const SALIDA = RAIZ;
const CONFIG = path.join(RAIZ, 'demos.json');

const VIEWPORT_POR_DEFECTO = { width: 1600, height: 900 };
const LIMITE_ANCHO = 2400;
const LIMITE_ALTO = 3200;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function leerDemos() {
  const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  return config.demos || [];
}

function cargarModulos(demo) {
  const ruta = path.join(RAIZ, demo.modulos);
  const { modulos } = require(ruta);
  if (!Array.isArray(modulos) || modulos.length === 0) {
    throw new Error('El archivo ' + demo.modulos + ' no exporta módulos.');
  }
  return modulos;
}

function prepararCarpetas(demo) {
  const carpeta = path.join(SALIDA, demo.carpeta);
  fs.rmSync(carpeta, { recursive: true, force: true });
  for (const dir of ['capturas', 'videos', '.video-temporal']) {
    fs.mkdirSync(path.join(carpeta, dir), { recursive: true });
  }
  return {
    carpeta,
    capturas: path.join(carpeta, 'capturas'),
    videos: path.join(carpeta, 'videos'),
    temporal: path.join(carpeta, '.video-temporal'),
    sesion: path.join(RAIZ, demo.sesion),
    informe: path.join(SALIDA, demo.archivo),
  };
}

function formatearSegundos(ms) {
  return Math.round(ms / 1000) + ' s';
}

function esPaginaDeLogin(url, patron) {
  return new RegExp(patron, 'i').test(new URL(url).pathname);
}

async function iniciarSesion(navegador, demo, rutas) {
  console.log('\n=== Inicio de sesión ===');
  const contexto = await navegador.newContext({ viewport: VIEWPORT_POR_DEFECTO });
  const pagina = await contexto.newPage();

  const urlLogin = new URL(demo.login.ruta, demo.baseUrl).toString();
  await pagina.goto(urlLogin, { waitUntil: 'domcontentloaded' });
  await esperar(1200);
  await pagina.screenshot({
    path: path.join(rutas.capturas, '00-login.png'),
    fullPage: true,
  });
  console.log('Captura de la pantalla de login: lista.');

  console.log('\n>>> Iniciá sesión en la ventana del navegador que se abrió.');
  console.log('>>> El script continúa solo cuando entres al sistema.\n');

  await pagina.waitForFunction(
    (patron) => !new RegExp(patron, 'i').test(location.pathname),
    demo.login.patron,
    { timeout: 300000 }
  );

  await esperar(2000);
  await contexto.storageState({ path: rutas.sesion });
  await contexto.close();

  console.log('Sesión iniciada y capturada.\n');
  return rutas.sesion;
}

async function sesionSigueValida(navegador, demo, rutas) {
  if (!fs.existsSync(rutas.sesion)) return false;

  const contexto = await navegador.newContext({ storageState: rutas.sesion });
  const pagina = await contexto.newPage();

  try {
    await pagina.goto(new URL(demo.login.verificar, demo.baseUrl).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await esperar(800);
    return !esPaginaDeLogin(pagina.url(), demo.login.patron);
  } catch {
    return false;
  } finally {
    await contexto.close();
  }
}

async function capturarModulo(navegador, demo, modulo, archivoSesion, rutas) {
  const vp = modulo.viewport || VIEWPORT_POR_DEFECTO;
  const contexto = await navegador.newContext({
    viewport: vp,
    storageState: archivoSesion,
    recordVideo: { dir: rutas.temporal, size: vp },
  });
  const pagina = await contexto.newPage();

  const url = new URL(modulo.ruta, demo.baseUrl).toString();
  const resultado = { ...modulo, url, estado: 'ok', detalle: '' };
  const inicio = Date.now();

  try {
    const respuesta = await pagina.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    if (respuesta && respuesta.status() >= 400) {
      resultado.estado = 'error';
      resultado.detalle = 'HTTP ' + respuesta.status();
    }

    await esperar(1000);
    await pagina.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await esperar(700);

    for (const paso of modulo.acciones || []) {
      if (paso.t === 'esperar') {
        await esperar(paso.ms);
      } else if (paso.t === 'scroll') {
        await pagina.evaluate(
          (px) => window.scrollBy({ top: px, behavior: 'smooth' }),
          paso.px
        );
        await esperar(paso.ms || 700);
      } else if (paso.t === 'hover') {
        await pagina.hover(paso.sel, { timeout: 5000 }).catch(() => {});
        await esperar(600);
      } else if (paso.t === 'click') {
        await pagina.click(paso.sel, { timeout: 5000 }).catch(() => {});
        await esperar(1000);
      }
    }

    await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await esperar(700);

    const medidas = await pagina.evaluate(() => ({
      ancho: Math.max(
        document.documentElement.scrollWidth,
        document.body ? document.body.scrollWidth : 0
      ),
      alto: Math.max(
        document.documentElement.scrollHeight,
        document.body ? document.body.scrollHeight : 0
      ),
    }));

    // Una captura de página completa de una tabla muy larga o muy ancha sale
    // ilegible. En esos casos se captura solo lo que se ve en pantalla.
    if (medidas.ancho > LIMITE_ANCHO || medidas.alto > LIMITE_ALTO) {
      resultado.capturaParcial = true;
    }

    await pagina.screenshot({
      path: path.join(rutas.capturas, modulo.id + '.png'),
      fullPage: medidas.ancho <= LIMITE_ANCHO && medidas.alto <= LIMITE_ALTO,
    });
  } catch (error) {
    resultado.estado = 'error';
    resultado.detalle = String(error.message || error).split('\n')[0];
    await pagina
      .screenshot({
        path: path.join(rutas.capturas, modulo.id + '-error.png'),
        fullPage: true,
      })
      .catch(() => {});
  }

  resultado.duracion = formatearSegundos(Date.now() - inicio);

  const video = pagina.video();
  await contexto.close();

  if (video) {
    try {
      const origen = await video.path();
      fs.renameSync(origen, path.join(rutas.videos, modulo.id + '.webm'));
      resultado.video = true;
    } catch {
      resultado.video = false;
    }
  }

  return resultado;
}

function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generarInforme(demo, resultados, rutas) {
  const tarjetas = resultados
    .map((r, indice) => {
      const tieneVideo =
        r.video && fs.existsSync(path.join(rutas.videos, r.id + '.webm'));
      const tieneCaptura = fs.existsSync(
        path.join(rutas.capturas, r.id + '.png')
      );
      const error =
        r.estado === 'ok'
          ? ''
          : `<p class="aviso">No se pudo capturar: ${escapar(r.detalle)}</p>`;

      return `
      <article class="modulo">
        <header class="modulo-encabezado">
          <span class="numero">${String(indice + 1).padStart(2, '0')}</span>
          <div>
            <h2>${escapar(r.nombre)}</h2>
            <p class="ruta">${escapar(r.ruta)}</p>
          </div>
          <span class="duracion">${escapar(r.duracion)}</span>
        </header>
        <p class="descripcion">${escapar(r.descripcion)}</p>
        ${error}
        ${
          tieneVideo
            ? `<div class="bloque">
                 <h3>Recorrido en video</h3>
                 <video src="videos/${r.id}.webm" controls preload="metadata" playsinline></video>
               </div>`
            : ''
        }
        ${
          tieneCaptura
            ? `<div class="bloque">
                 <h3>Captura de pantalla</h3>
                 <a href="capturas/${r.id}.png" target="_blank">
                   <img src="capturas/${r.id}.png" alt="${escapar(r.nombre)}" loading="lazy">
                 </a>
               </div>`
            : ''
        }
      </article>`;
    })
    .join('\n');

  const correctos = resultados.filter((r) => r.estado === 'ok').length;
  const fallidos = resultados.length - correctos;
  const fecha = new Date().toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Informe de capturas — ${escapar(demo.nombre)}</title>
<style>
  :root {
    --fondo: #0e1116;
    --panel: #161b22;
    --borde: #262d38;
    --texto: #e6edf3;
    --tenue: #8b949e;
    --acento: #4f8cff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--fondo);
    color: var(--texto);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
  }
  .contenedor { max-width: 1180px; margin: 0 auto; padding: 48px 24px 96px; }
  .volver {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--tenue);
    text-decoration: none;
    font-size: 0.85rem;
    border: 1px solid var(--borde);
    border-radius: 8px;
    padding: 7px 16px;
    margin-bottom: 24px;
    transition: color 0.16s ease, border-color 0.16s ease;
  }
  .volver:hover { color: var(--texto); border-color: var(--acento); }
  .portada { border-bottom: 1px solid var(--borde); padding-bottom: 32px; margin-bottom: 48px; }
  .portada h1 { font-size: 2rem; margin: 0 0 8px; letter-spacing: -0.02em; }
  .portada p { margin: 0; color: var(--tenue); }
  .resumen { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 24px; }
  .dato {
    background: var(--panel); border: 1px solid var(--borde); border-radius: 10px;
    padding: 14px 20px; min-width: 150px;
  }
  .dato .valor { font-size: 1.5rem; font-weight: 600; }
  .dato .etiqueta { font-size: 0.8rem; color: var(--tenue); text-transform: uppercase; letter-spacing: 0.06em; }
  .modulo {
    background: var(--panel); border: 1px solid var(--borde); border-radius: 14px;
    padding: 28px; margin-bottom: 28px;
  }
  .modulo-encabezado { display: flex; align-items: flex-start; gap: 16px; }
  .numero {
    font-size: 0.85rem; font-weight: 700; color: var(--acento);
    border: 1px solid var(--acento); border-radius: 8px; padding: 4px 10px;
    flex-shrink: 0; margin-top: 4px;
  }
  .modulo-encabezado h2 { margin: 0; font-size: 1.25rem; }
  .ruta { margin: 2px 0 0; font-size: 0.8rem; color: var(--tenue); font-family: ui-monospace, monospace; }
  .duracion { margin-left: auto; font-size: 0.8rem; color: var(--tenue); flex-shrink: 0; }
  .descripcion { color: #c2ccd6; margin: 16px 0 24px; }
  .aviso {
    background: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.4);
    color: #ff9b95; padding: 10px 14px; border-radius: 8px; font-size: 0.9rem;
  }
  .bloque { margin-top: 20px; }
  .bloque h3 {
    font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--tenue); margin: 0 0 10px; font-weight: 600;
  }
  video, img {
    width: 100%; border-radius: 10px; border: 1px solid var(--borde);
    display: block; background: #000;
  }
  img { cursor: zoom-in; }
  footer { color: var(--tenue); font-size: 0.85rem; text-align: center; margin-top: 56px; }
</style>
</head>
<body>
<div class="contenedor">
  <a class="volver" href="../index.html">&larr; Volver a las demos</a>
  <div class="portada">
    <h1>Informe de capturas — ${escapar(demo.nombre)}</h1>
    <p>Recorrido de módulos con captura de pantalla y video. Generado el ${escapar(fecha)}.</p>
    <div class="resumen">
      <div class="dato"><div class="valor">${resultados.length}</div><div class="etiqueta">Módulos</div></div>
      <div class="dato"><div class="valor">${correctos}</div><div class="etiqueta">Capturados</div></div>
      <div class="dato"><div class="valor">${fallidos}</div><div class="etiqueta">Con error</div></div>
    </div>
  </div>
${tarjetas}
  <footer>Los videos están en formato WebM y se reproducen en el navegador. Las capturas abren a tamaño completo.</footer>
</div>
</body>
</html>`;
}

async function capturarDemo(navegador, demo, opciones) {
  const modulos = cargarModulos(demo);
  const rutas = prepararCarpetas(demo);

  console.log('\n=== ' + demo.nombre + ' ===');
  console.log('Sistema: ' + demo.baseUrl);
  console.log('Módulos a capturar: ' + modulos.length);

  let archivoSesion = rutas.sesion;

  if (!opciones.forzarLogin && (await sesionSigueValida(navegador, demo, rutas))) {
    console.log('\nSesión previa reutilizada (usá --login para forzar un login nuevo).');
  } else {
    archivoSesion = await iniciarSesion(navegador, demo, rutas);
  }

  const resultados = [];

  for (let i = 0; i < modulos.length; i++) {
    const modulo = modulos[i];
    process.stdout.write(`[${i + 1}/${modulos.length}] ${modulo.nombre} ... `);
    const resultado = await capturarModulo(
      navegador,
      demo,
      modulo,
      archivoSesion,
      rutas
    );
    resultados.push(resultado);
    console.log(
      resultado.estado === 'ok'
        ? `ok (${resultado.duracion})`
        : `ERROR: ${resultado.detalle}`
    );
  }

  fs.writeFileSync(rutas.informe, generarInforme(demo, resultados, rutas), 'utf8');
  fs.rmSync(rutas.temporal, { recursive: true, force: true });

  console.log('\n--- ' + demo.nombre + ' ---');
  console.log('Informe: ' + rutas.informe);
  console.log(
    'Capturas: ' + correctosDe(resultados) + '/' + resultados.length
  );

  return resultados;
}

function correctosDe(resultados) {
  return resultados.filter((r) => r.estado === 'ok').length;
}

/**
 * Lee los argumentos de la línea de comandos.
 *
 * En Windows, `npm run demo -- --demo neurodesk` pierde las banderas que
 * empiezan con guiones, así que la forma confiable es posicional:
 *
 *   npm run demo -- neurodesk
 *   npm run demo -- neurodesk login
 *
 * Igual se aceptan `--demo <id>` y `--login` cuando se llama a node directo.
 */
function leerArgumentos() {
  const args = process.argv.slice(2);
  let pedido = null;
  let forzarLogin = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--demo') {
      pedido = args[i + 1] || null;
      i++;
    } else if (arg === '--login' || arg === 'login') {
      forzarLogin = true;
    } else if (!arg.startsWith('-')) {
      pedido = arg;
    }
  }

  return { pedido, forzarLogin };
}

async function principal() {
  const todas = leerDemos();
  const { pedido, forzarLogin } = leerArgumentos();

  const objetivos = pedido
    ? todas.filter((d) => d.id === pedido || d.carpeta === pedido)
    : todas;

  if (objetivos.length === 0) {
    console.error(
      'No existe una demo con id "' +
        pedido +
        '". Disponibles: ' +
        todas.map((d) => d.id).join(', ')
    );
    process.exitCode = 1;
    return;
  }

  const navegador = await chromium.launch({ headless: false });

  try {
    for (const demo of objetivos) {
      await capturarDemo(navegador, demo, { forzarLogin });
    }

    const portal = require('./portal');
    const indice = portal.generar();
    console.log('\n=== Listo ===');
    console.log('Portal: ' + indice);
  } finally {
    await navegador.close();
  }
}

function leerArgumento(nombre) {
  const i = process.argv.indexOf(nombre);
  return i === -1 ? null : process.argv[i + 1] || null;
}

principal().catch((error) => {
  console.error('\nFalló la ejecución:', error.message);
  process.exitCode = 1;
});
