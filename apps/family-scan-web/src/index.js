const http = require("http");
const { URL } = require("url");

const port = Number(process.env.WEB_PORT || 3000);
const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:4000";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFamilyScanPage(sessionId, uploadToken) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Family Scan Consent</title>
  <style>
    :root {
      --bg: #f6f8fb;
      --panel: #ffffff;
      --text: #1a2333;
      --muted: #5f6b80;
      --accent: #0b7a75;
      --danger: #c53030;
      --line: #dce3ef;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "Noto Sans", sans-serif;
      background: linear-gradient(140deg, #f6f8fb 0%, #edf2fb 100%);
      color: var(--text);
    }
    .wrap {
      max-width: 840px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 14px;
      box-shadow: 0 8px 24px rgba(35, 45, 80, 0.07);
    }
    h1 { margin: 0 0 8px; font-size: 28px; }
    p { margin: 8px 0; color: var(--muted); line-height: 1.4; }
    label { display: block; font-size: 14px; margin: 10px 0 6px; color: #26324a; }
    input, textarea {
      width: 100%;
      border: 1px solid #c9d4e6;
      border-radius: 6px;
      padding: 10px;
      font-size: 14px;
      font-family: inherit;
    }
    textarea { min-height: 92px; resize: vertical; }
    .row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .btn {
      border: 0;
      border-radius: 6px;
      padding: 10px 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-outline { background: #fff; color: var(--text); border: 1px solid #c9d4e6; }
    .consent {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      margin-top: 10px;
    }
    .consent input { width: 18px; margin-top: 3px; }
    .error { color: var(--danger); font-size: 13px; margin-top: 6px; }
    .ok { color: #0f7a38; font-size: 13px; margin-top: 6px; }
    .footer { font-size: 12px; color: var(--muted); margin-top: 8px; }
    @media (max-width: 700px) {
      .row { grid-template-columns: 1fr; }
      h1 { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="panel">
      <h1>Family Scan Request</h1>
      <p>Your child has requested a subscription audit summary. You control what is shared, and this flow sends only the summary you approve.</p>
      <p><strong>Session:</strong> ${escapeHtml(sessionId)}</p>
    </div>

    <div class="panel">
      <h2 style="margin:0 0 8px; font-size:22px;">What Will Be Shared</h2>
      <p>Merchant names and amounts you enter below will be encrypted by your child app before final interpretation. Raw SMS and email content is not submitted through this form.</p>
      <div class="consent">
        <input id="consent" type="checkbox" />
        <label for="consent" style="margin:0; color:#24314a;">I understand and consent to sharing this subscription summary with my child.</label>
      </div>
      <div id="consentError" class="error" style="display:none;"></div>
    </div>

    <div class="panel">
      <h2 style="margin:0 0 8px; font-size:22px;">Subscription Summary</h2>
      <p>Add subscriptions you want to share. Amount should be monthly equivalent in INR.</p>
      <div id="rows"></div>
      <button class="btn btn-outline" id="addRow" type="button">Add Subscription</button>

      <label for="notes">Optional note to child</label>
      <textarea id="notes" placeholder="Example: Netflix is used by family, keep active."></textarea>

      <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-primary" id="submitBtn" type="button">Submit Summary</button>
      </div>
      <div id="submitError" class="error" style="display:none;"></div>
      <div id="submitOk" class="ok" style="display:none;"></div>
      <div class="footer">Reference: consent version 2026-05-05</div>
    </div>
  </div>

  <script>
    const sessionId = ${JSON.stringify(sessionId)};
    const uploadToken = ${JSON.stringify(uploadToken)};
    const apiBaseUrl = ${JSON.stringify(apiBaseUrl)};

    const rowsNode = document.getElementById("rows");
    const addRowBtn = document.getElementById("addRow");
    const submitBtn = document.getElementById("submitBtn");
    const consentCheckbox = document.getElementById("consent");
    const consentError = document.getElementById("consentError");
    const submitError = document.getElementById("submitError");
    const submitOk = document.getElementById("submitOk");

    function addRow(merchant = "", amount = "") {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = \`
        <input type="text" placeholder="Merchant (e.g., Netflix)" value="\${merchant}" />
        <input type="number" min="1" step="1" placeholder="Monthly INR" value="\${amount}" />
      \`;
      rowsNode.appendChild(row);
    }

    function buildPayload() {
      const rows = Array.from(document.querySelectorAll(".row"));
      const subscriptions = rows.map((row) => {
        const inputs = row.querySelectorAll("input");
        return {
          merchant: inputs[0].value.trim(),
          amount: Number(inputs[1].value.trim())
        };
      }).filter((item) => item.merchant && Number.isFinite(item.amount) && item.amount > 0);

      const notes = document.getElementById("notes").value.trim();
      const plaintext = JSON.stringify({
        subscriptions,
        notes
      });

      return {
        subscriptions,
        resultCiphertext: btoa(unescape(encodeURIComponent(plaintext)))
      };
    }

    async function onSubmit() {
      submitError.style.display = "none";
      submitOk.style.display = "none";
      consentError.style.display = "none";

      if (!consentCheckbox.checked) {
        consentError.textContent = "Please provide consent before submitting.";
        consentError.style.display = "block";
        return;
      }

      const payload = buildPayload();
      if (payload.subscriptions.length === 0) {
        submitError.textContent = "Add at least one valid subscription before submitting.";
        submitError.style.display = "block";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        const res = await fetch(apiBaseUrl + "/api/v1/family-scan/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + uploadToken
          },
          body: JSON.stringify({
            sessionId,
            parentConsentVersion: "2026-05-05",
            resultSchemaVersion: 1,
            summaryCounts: {
              subscriptions: payload.subscriptions.length
            },
            resultCiphertext: payload.resultCiphertext
          })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "submit_failed" }));
          throw new Error(err.error || "submit_failed");
        }

        submitOk.textContent = "Summary submitted successfully. You can close this page.";
        submitOk.style.display = "block";
      } catch (error) {
        submitError.textContent = "Submission failed: " + error.message;
        submitError.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Summary";
      }
    }

    addRow("Netflix", "649");
    addRow();

    addRowBtn.addEventListener("click", () => addRow());
    submitBtn.addEventListener("click", onSubmit);
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://localhost:${port}`);

  if (requestUrl.pathname === "/health") {
    return sendJson(res, 200, { status: "ok", service: "family-scan-web" });
  }

  const routeMatch = requestUrl.pathname.match(/^\/family-scan\/([0-9a-fA-F-]{36})$/);
  if (!routeMatch) {
    return sendHtml(res, 404, "<h1>Not Found</h1>");
  }

  const sessionId = routeMatch[1];
  const uploadToken = requestUrl.searchParams.get("uploadToken");
  if (!uploadToken || uploadToken.length < 12) {
    return sendHtml(res, 400, "<h1>Invalid Link</h1><p>Upload token is missing or malformed.</p>");
  }

  return sendHtml(res, 200, renderFamilyScanPage(sessionId, uploadToken));
});

server.listen(port, () => {
  console.log("family-scan-web listening on http://localhost:" + port);
});

