const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
// Permite usar una URL alternativa en pruebas; en producción se usa Jolpica.
const API_BASE = (process.env.JOLPICA_API_BASE || "https://api.jolpi.ca/ergast/f1").replace(/\/$/, "");
const API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS) || 12000;
const CACHE_TTL_MS = Number(process.env.API_CACHE_TTL_MS) || 5 * 60 * 1000;
const USER_AGENT = "GridStartF1/2.0 (academic project; Node.js)";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const photoCache = new Map();
const PHOTO_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const routes = {
  "/api/standings/drivers": "/2026/driverstandings.json?limit=100",
  "/api/standings/constructors": "/2026/constructorstandings.json?limit=100",
  "/api/calendar": "/2026/races.json?limit=100"
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const cache = new Map();

function sendJson(res, status, data, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
}


function normalizarTituloWiki(urlTexto) {
  try {
    const url = new URL(urlTexto);
    if (url.hostname !== "en.wikipedia.org" || !url.pathname.startsWith("/wiki/")) return null;
    const titulo = decodeURIComponent(url.pathname.slice("/wiki/".length)).replace(/_/g, " ").trim();
    return titulo && titulo.length <= 180 ? titulo : null;
  } catch {
    return null;
  }
}

async function proxyDriverPhotos(requestUrl, res) {
  const urls = (requestUrl.searchParams.get("urls") || "").split("|").slice(0, 30);
  const requested = urls.map(originalUrl => ({ originalUrl, title: normalizarTituloWiki(originalUrl) }))
    .filter(item => item.title);
  const photos = {};
  const missing = [];

  for (const item of requested) {
    const cached = photoCache.get(item.title.toLowerCase());
    if (cached && Date.now() - cached.savedAt < PHOTO_CACHE_TTL_MS) {
      photos[item.originalUrl] = cached.image;
    } else {
      missing.push(item);
    }
  }

  if (missing.length) {
    try {
      const titles = [...new Set(missing.map(item => item.title))];
      const wikiUrl = new URL(WIKIPEDIA_API);
      wikiUrl.search = new URLSearchParams({
        action: "query",
        format: "json",
        redirects: "1",
        prop: "pageimages",
        piprop: "thumbnail",
        pithumbsize: "900",
        titles: titles.join("|")
      }).toString();
      const response = await fetch(wikiUrl, {
        headers: { Accept: "application/json", "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(9000)
      });
      if (!response.ok) throw new Error(`Wikipedia respondió ${response.status}.`);
      const data = await response.json();
      const paginas = Object.values(data?.query?.pages || {});
      const imagenesPorTitulo = new Map(paginas.map(page => [String(page.title || "").toLowerCase(), page.thumbnail?.source || null]));
      const alias = new Map();
      for (const ajuste of [...(data?.query?.normalized || []), ...(data?.query?.redirects || [])]) {
        alias.set(String(ajuste.from || "").toLowerCase(), String(ajuste.to || "").toLowerCase());
      }

      for (const item of missing) {
        const llave = item.title.toLowerCase();
        const tituloCanonico = alias.get(llave) || llave;
        const image = imagenesPorTitulo.get(llave) || imagenesPorTitulo.get(tituloCanonico) || null;
        photoCache.set(llave, { image, savedAt: Date.now() });
        photos[item.originalUrl] = image;
      }
    } catch (error) {
      console.warn("No fue posible consultar fotografías de Wikipedia:", error.message);
      for (const item of missing) photos[item.originalUrl] = null;
    }
  }

  sendJson(res, 200, { photos }, { "Cache-Control": "public, max-age=3600" });
}

async function proxyApi(route, res) {
  const cached = cache.get(route);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "X-GridStart-Cache": "HIT"
    });
    res.end(cached.body);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}${routes[route]}`, {
      method: "GET",
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(API_TIMEOUT_MS)
    });

    const body = await response.text();
    if (!response.ok) {
      sendJson(res, response.status, {
        error: "Jolpica F1 API respondió con un error.",
        upstreamStatus: response.status,
        message: "Intenta actualizar los datos más tarde."
      });
      return;
    }

    // Verifica que el servicio realmente haya devuelto JSON válido.
    JSON.parse(body);
    cache.set(route, { body, savedAt: Date.now() });
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "X-GridStart-Cache": "MISS"
    });
    res.end(body);
  } catch (error) {
    const timeout = error.name === "TimeoutError" || error.name === "AbortError";
    sendJson(res, 502, {
      error: timeout ? "La consulta a Jolpica superó el tiempo de espera." : "No se pudo consultar Jolpica F1 API.",
      message: "Comprueba la conexión e inténtalo de nuevo."
    });
  }
}

const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "Método no permitido." }, { Allow: "GET, HEAD" });
    return;
  }

  let requestUrl;
  try {
    requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  } catch {
    sendJson(res, 400, { error: "Solicitud no válida." });
    return;
  }

  if (requestUrl.pathname === "/api/driver-photos") {
    await proxyDriverPhotos(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/health") {
    sendJson(res, 200, { status: "ok", app: "GridStart F1", version: "2.0.0", season: 2026 });
    return;
  }

  if (Object.hasOwn(routes, requestUrl.pathname)) {
    await proxyApi(requestUrl.pathname, res);
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Ruta no válida.");
    return;
  }
  if (pathname === "/") pathname = "/index.html";

  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Acceso denegado.");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      const status = error.code === "ENOENT" ? 404 : 500;
      res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(status === 404 ? "Archivo no encontrado." : "No se pudo leer el archivo.");
      return;
    }
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "public, max-age=300" });
    res.end(req.method === "HEAD" ? undefined : content);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`GridStart F1 v2 disponible en http://localhost:${PORT}`);
  console.log(`Servidor escuchando en ${HOST}:${PORT}`);
  console.log(`API externa: ${API_BASE}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
