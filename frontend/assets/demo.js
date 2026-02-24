const runButton = document.querySelector("#runBtn");
const meta = document.querySelector("#meta");
const backendMeta = document.querySelector("#backendMeta");
const txMeta = document.querySelector("#txMeta");
const summary = document.querySelector("#summary");
const balances = document.querySelector("#balances");
const cards = document.querySelector("#cards");
const txList = document.querySelector("#txList");
const cardTemplate = document.querySelector("#cardTemplate");

const API_BASE = getApiBase();
let lastResultsPayload = null;
let lastTransactionsPayload = null;

backendMeta.textContent = `Backend: ${API_BASE}`;

async function run(force = false) {
  setBusy(true);
  try {
    const params = new URLSearchParams();
    if (force) params.set("force", "1");
    params.set("_", String(Date.now()));
    const { response, payload } = await fetchJson(`${API_BASE}/demo/results?${params.toString()}`, "demo results");
    if (response.status === 304) {
      if (lastResultsPayload) {
        renderResults(lastResultsPayload);
        await refreshTransactions();
      }
      return;
    }
    if (!response.ok) {
      renderError(payload?.error ?? `Request failed with ${response.status}`);
      return;
    }
    lastResultsPayload = payload;
    renderResults(payload);
    await refreshTransactions();
  } catch (error) {
    renderError(error?.message ?? "Unknown dashboard error");
  } finally {
    setBusy(false);
  }
}

async function refreshTransactions() {
  try {
    const params = new URLSearchParams();
    params.set("limit", "25");
    params.set("_", String(Date.now()));
    const { response, payload } = await fetchJson(`${API_BASE}/ops/transactions?${params.toString()}`, "transaction feed");
    if (response.status === 304) {
      if (lastTransactionsPayload) {
        renderTransactions(lastTransactionsPayload);
      }
      return;
    }
    if (!response.ok) {
      txMeta.textContent = `Transaction feed error: ${payload?.error ?? response.status}`;
      return;
    }
    lastTransactionsPayload = payload;
    renderTransactions(payload);
  } catch (error) {
    txMeta.textContent = `Transaction feed error: ${error?.message ?? "unknown error"}`;
  }
}

async function fetchJson(url, contextLabel) {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, max-age=0",
      Pragma: "no-cache",
    },
  });
  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      throw new Error(`${contextLabel} returned non-JSON payload (${response.status}): ${error?.message ?? "parse error"}`);
    }
  }
  return { response, payload };
}

function renderResults(payload) {
  const okCount = payload.endpoints.filter(item => item.ok).length;
  const avgLatency = Math.round(
    payload.endpoints.reduce((sum, item) => sum + item.durationMs, 0) /
      Math.max(payload.endpoints.length, 1),
  );

  meta.textContent = [
    `Generated ${formatTime(payload.generatedAt)}`,
    payload.cached ? "cached" : "live",
    `target ${payload.targetServer}`,
  ].join(" | ");

  summary.innerHTML = "";
  summary.append(
    buildStat("Passing", `${okCount}/${payload.endpoints.length}`),
    buildStat("Average Latency", `${avgLatency} ms`),
    buildStat("x402 Network", payload.network),
  );

  balances.innerHTML = "";
  if (payload.balances?.entries?.length) {
    for (const entry of payload.balances.entries) {
      const usdc = entry.usdc === null ? "n/a" : `${Number(entry.usdc).toFixed(4)} USDC`;
      balances.append(
        buildStat(
          `${entry.label} ${shorten(entry.address)}`,
          `${Number(entry.native).toFixed(5)} ${entry.nativeSymbol} | ${usdc}`,
        ),
      );
    }
  } else {
    balances.append(buildStat("Balances", "Not available"));
  }

  cards.innerHTML = "";
  for (const endpoint of payload.endpoints) {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    const endpointEl = card.querySelector(".endpoint");
    const pillEl = card.querySelector(".pill");
    const latencyEl = card.querySelector(".latency");
    const payloadEl = card.querySelector(".payload");

    endpointEl.textContent = endpoint.endpoint;
    pillEl.textContent = String(endpoint.status);
    pillEl.classList.add(endpoint.ok ? "ok" : "bad");
    latencyEl.textContent = `Latency ${endpoint.durationMs} ms`;
    payloadEl.textContent = JSON.stringify(endpoint.body, null, 2);

    cards.append(card);
  }
}

function renderTransactions(payload) {
  const latest = payload.latest ?? [];
  txMeta.textContent = [
    `${latest.length} recent transfers`,
    `updated ${formatTime(payload.updatedAt)}`,
    payload.network ?? "",
  ]
    .filter(Boolean)
    .join(" | ");

  txList.innerHTML = "";
  if (!latest.length) {
    const empty = document.createElement("li");
    empty.className = "txItem internal";
    empty.textContent = "No tracked USDC transfers in current lookback window.";
    txList.append(empty);
    return;
  }

  for (const tx of latest) {
    const row = document.createElement("li");
    row.className = `txItem ${tx.direction || "internal"}`;

    const top = document.createElement("div");
    top.className = "txTop";
    top.innerHTML = `<span class="txAmount">${Number(tx.amountUsdc).toFixed(4)} USDC</span><span>${formatTime(tx.blockTimestamp)}</span>`;

    const route = document.createElement("p");
    route.className = "txRoute";
    route.textContent = `${shorten(tx.from)} -> ${shorten(tx.to)} | block ${tx.blockNumber}`;

    const hash = document.createElement("p");
    hash.className = "txHash";
    const hashLink = document.createElement("a");
    hashLink.href = `https://sepolia.basescan.org/tx/${tx.txHash}`;
    hashLink.target = "_blank";
    hashLink.rel = "noopener noreferrer";
    hashLink.textContent = tx.txHash;
    hash.append(hashLink);

    row.append(top, route, hash);
    txList.append(row);
  }
}

function buildStat(label, value) {
  const wrapper = document.createElement("article");
  wrapper.className = "stat";

  const labelEl = document.createElement("p");
  labelEl.className = "statLabel";
  labelEl.textContent = label;

  const valueEl = document.createElement("p");
  valueEl.className = "statValue";
  valueEl.textContent = value;

  wrapper.append(labelEl, valueEl);
  return wrapper;
}

function renderError(message) {
  meta.textContent = `Dashboard error: ${message}`;
}

function setBusy(isBusy) {
  runButton.disabled = isBusy;
  runButton.textContent = isBusy ? "Running..." : "Run Live Check";
}

function shorten(value) {
  if (!value || value.length < 12) return value ?? "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatTime(value) {
  if (!value) return "unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown time";
  return date.toLocaleString();
}

function getApiBase() {
  const fromConfig = window.CONFIG?.BACKEND_URL;
  if (!fromConfig || typeof fromConfig !== "string") {
    throw new Error("Missing window.CONFIG.BACKEND_URL. Set frontend/config.js.");
  }
  return fromConfig.replace(/\/$/, "");
}

runButton.addEventListener("click", () => run(true));

refreshTransactions();
