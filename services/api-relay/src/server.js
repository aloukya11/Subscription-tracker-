const http = require("http");

const port = Number(process.env.API_PORT || 4000);

function json(res, code, payload) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    return json(res, 200, { status: "ok", service: "api-relay" });
  }

  if (req.method === "POST" && req.url === "/api/v1/family-scan/init") {
    return json(res, 200, { sessionId: "scaffold-session", parentUrl: "http://localhost:3000/family-scan/scaffold" });
  }

  if (req.method === "POST" && req.url === "/api/v1/family-scan/submit") {
    return json(res, 202, { accepted: true });
  }

  if (req.method === "GET" && req.url.startsWith("/api/v1/family-scan/results/")) {
    return json(res, 200, { status: "pending" });
  }

  if (req.method === "DELETE" && req.url.startsWith("/api/v1/family-scan/")) {
    res.writeHead(204);
    return res.end();
  }

  return json(res, 404, { error: "not_found" });
});

server.listen(port, () => {
  console.log("api-relay listening on http://localhost:" + port);
});

