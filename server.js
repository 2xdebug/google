const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const indexPath = path.join(__dirname, "index.html");

function now() {
  return new Date().toISOString();
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBody(req, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let total = 0;
    let raw = "";

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limit) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid_json"));
      }
    });

    req.on("error", reject);
  });
}

function formatIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function logEvent(kind, req, payload) {
  const ip = formatIP(req);
  console.log(`[${now()}] ${kind} ip=${ip} ua="${req.headers["user-agent"] || ""}"`);
  console.log(payload);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    sendJSON(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    try {
      const html = fs.readFileSync(indexPath, "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      sendJSON(res, 500, { ok: false, error: "index_not_found" });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/phase") {
    try {
      const body = await readBody(req);
      const phase = typeof body.phase === "string" ? body.phase : "unknown_phase";
      logEvent(`phase:${phase}`, req, body.data || body);
      sendJSON(res, 200, { ok: true });
    } catch (error) {
      sendJSON(res, 400, { ok: false, error: error.message });
    }
    return;
  }

  sendJSON(res, 404, { ok: false, error: "not_found" });
});

server.listen(PORT, HOST, () => {
  console.log(`[${now()}] Server running.`);
  console.log(`[${now()}] Local:   http://localhost:${PORT}`);
  console.log(`[${now()}] Network: http://127.0.0.1:${PORT}`);
});
