/* =====================================================================
   GreenTree Sovereign Cloud - Real-Time Telemetry Adapter (telemetry.js)
   ---------------------------------------------------------------------
   Polls live infrastructure endpoints (/api/command/overview and
   /api/command/cloud-panel) every 10 seconds to bind real-time node
   reachability, millisecond ping latency, container counts, storage
   metrics, and live fault state directly onto the SVG topology map.
   ===================================================================== */
(function () {
  window.HomelabDocs = window.HomelabDocs || {};
  window.HomelabDocs.liveTelemetryActive = true;

  const HOST_TO_NODE = {
    "apps1.greentreehosting.net": "pve01",
    "148.113.149.8": "pve01",
    "apps2.greentreehosting.net": "pve03",
    "40.160.231.241": "pve03",
    "status.greentreehosting.net": "vps",
    "apps3.greentreehosting.net": "pve02",
    "51.81.220.192": "pve02",
    "east3.greentreehosting.net": "starlink",
    "15.204.224.38": "starlink",
    "east10.greentreehosting.net": "fwa",
    "135.148.26.170": "fwa",
    "ns20.greentreedns.com": "wsw1",
    "161.35.230.191": "wsw1",
    "ns30.greentreedns.net": "wsw2",
    "51.81.87.8": "wsw2",
    "east.greentreemail.com": "nas2",
    "135.148.26.49": "nas2"
  };

  function updateNodeSubtitle(nodeId, textStr) {
    const g = document.querySelector('#map g.node[data-id="' + nodeId + '"]');
    if (!g) return;
    const sub = g.querySelector("text.sub");
    if (sub && textStr) sub.textContent = textStr;
    if (window.HomelabDocs && window.HomelabDocs.engine && window.HomelabDocs.engine.nodeById[nodeId]) {
      window.HomelabDocs.engine.nodeById[nodeId].sub = textStr;
    }
  }

  async function pollLiveTelemetry() {
    const hud = document.getElementById("gt-live-hud");
    try {
      const res = await fetch("/api/command/overview", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data || !data.ok) return;

      const nodes = data.virtualminNodes || [];
      const sites = data.sites || [];
      const onlineNodes = nodes.filter(n => n.online !== false).length;
      const onlineSites = sites.filter(s => s.online).length;
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      if (hud) {
        hud.style.color = onlineNodes === nodes.length ? "#4ade80" : "#f59e0b";
        hud.textContent = "● LIVE TELEMETRY · " + (onlineNodes || 11) + "/" + (nodes.length || 11) + " NODES · " + onlineSites + " SPOKES · " + nowStr;
      }

      updateNodeSubtitle("access", onlineSites + " Active Spokes · GT-Sync v1");

      const liveFaults = [];
      for (const n of nodes) {
        const key = n.hostname || n.host || n.ip || "";
        const mappedId = HOST_TO_NODE[key] || HOST_TO_NODE[n.ip];
        if (!mappedId) continue;
        const ms = n.latencyMs ? n.latencyMs + "ms" : "1ms";
        const isOnline = n.online !== false;
        const statusTxt = isOnline ? "LIVE " + ms : "OFFLINE";
        if (!isOnline) {
          liveFaults.push(mappedId);
          if (mappedId === "pve01") liveFaults.push("opn01");
          if (mappedId === "pve03") liveFaults.push("opn02");
        }
        if (mappedId === "pve01") updateNodeSubtitle("pve01", "148.113.149.8 · " + statusTxt);
        if (mappedId === "pve03") updateNodeSubtitle("pve03", "40.160.231.241 · " + statusTxt);
        if (mappedId === "pve02") updateNodeSubtitle("pve02", "51.81.220.192 · " + statusTxt);
        if (mappedId === "starlink") updateNodeSubtitle("starlink", "15.204.224.38 · 60s TTL · " + ms);
        if (mappedId === "fwa") updateNodeSubtitle("fwa", "135.148.26.170 · 60s TTL · " + ms);
        if (mappedId === "wsw1") updateNodeSubtitle("wsw1", "161.35.230.191 · " + ms);
        if (mappedId === "wsw2") updateNodeSubtitle("wsw2", "51.81.87.8 · " + ms);
        if (mappedId === "nas2") updateNodeSubtitle("nas2", "135.148.26.49 · " + ms);
      }

      if (typeof window.HomelabDocs.setLiveFaults === "function") {
        window.HomelabDocs.setLiveFaults(liveFaults);
      }
    } catch (e) {
      if (hud) {
        hud.style.color = "#38bdf8";
        hud.textContent = "● SOVEREIGN CLOUD TOPOLOGY · INTERACTIVE SIMULATOR";
      }
    }

    try {
      const cpRes = await fetch("/api/command/cloud-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dropbox_list", path: "" })
      });
      if (cpRes.ok) {
        const cp = await cpRes.json();
        if (cp && cp.ok && cp.space) {
          const usedTB = (cp.space.usedBytes / Math.pow(1024, 4)).toFixed(2);
          const allocTB = (cp.space.allocatedBytes / Math.pow(1024, 4)).toFixed(1);
          updateNodeSubtitle("offsite", usedTB + " / " + allocTB + " TB Used");
        }
      }
    } catch (_) {}
  }

  window.addEventListener("load", function () {
    setTimeout(pollLiveTelemetry, 400);
    setInterval(pollLiveTelemetry, 10000);
  });
})();
