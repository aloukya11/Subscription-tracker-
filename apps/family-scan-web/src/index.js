const http = require("http");

const port = Number(process.env.WEB_PORT || 3000);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "family-scan-web" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`
    <html>
      <body style="font-family: sans-serif; margin: 40px;">
        <h1>Family Scan Web Scaffold</h1>
        <p>Parent consent and manual submission flow will be implemented in Builder phase.</p>
      </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log("family-scan-web listening on http://localhost:" + port);
});

