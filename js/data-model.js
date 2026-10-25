window.HomelabDocs = window.HomelabDocs || {};

HomelabDocs.model = {
  gateways: [
    { node: "starlink", tier: 1 },
    { node: "fwa", tier: 1 }
  ],

  carp: ["opn01", "opn02"],

  power: { upsRuntime: "Zero-Transfer 2N", genRating: "N+1 Megawatt", genRuntime: "48h Autonomous Fuel" },

  cluster: { voters: ["pve01", "pve02", "pve03"], recoveryHost: "pve03" },

  protection: { backupService: "bkp", nasService: "nas", backupCopyHost: "nas2" },

  services: [
    { id: "pub", name: "49 Spoke Apps", role: "Production client web applications & portals", host: "pve01", recovery: "replica" },
    { id: "web", name: "Command Center", role: "command.greentreehosting.com orchestration", host: "pve01", recovery: "replica",
      deps: ["nas"], depsNote: "synced with Cloud Hosting & S3" },
    { id: "net", name: "PostgreSQL 16", role: "Isolated per-site PostgreSQL 16 container vaults", host: "pve01", recovery: "replica" },
    { id: "ctr", name: "Coolify v4", role: "Control plane & Docker build engine", host: "pve01", recovery: "backup" },
    { id: "mon", name: "Antigravity Core", role: "apps1-sovereign-core headless CLI & 15m cron", host: "pve01", recovery: "backup" },
    { id: "auto", name: "GitTruth Attest", role: "Cryptographic SHA-256 + GPG + Bitcoin sealing", host: "pve01", recovery: "backup" },
    { id: "dev", name: "Search Cmdr", role: "IndexNow + Sitemap + Demand Miner", host: "pve01", recovery: "none" },
    { id: "lab", name: "Social Graph", role: "MOD-SOCIAL-COMMAND FB v21.0 publisher", host: "pve01", recovery: "none" },

    { id: "nas", name: "SeaweedFS S3", role: "191 GB NVMe S3 object storage & filer", host: "pve02", recovery: "none", depsNodes: ["jbod"] },
    { id: "bkp", name: "GreenTreeMail", role: "Poste.io POP3/IMAP/SMTP & Roundcube Webmail", host: "pve02", recovery: "none",
      deps: ["nas"], depsNote: "mail-archive + Dropbox Business 31TB sync" },
    { id: "other", name: "PHP 8.3 + SQL", role: "Apache Vhosts, MariaDB 11.4 & SFTPGo (:2022)", host: "pve02", recovery: "none" }
  ],

  recoveryLabels: {
    replica: "Replicated · promotes automatically on APPS2 (0.0s HA)",
    backup: "Restored from Dropbox Business 31TB / S3 backup",
    none: "Paused until APPS1 returns"
  },

  vlans: [
    { id: 10, name: "WireGuard Mesh", color: "#60a5fa", nodes: ["pve01", "pve02", "pve03"], note: "10.10.0.0/24 encrypted kernel mesh" },
    { id: 20, name: "Spoke Sync", color: "#f472b6", nodes: ["pve01", "pve02", "pve03", "access"], note: "HMAC-SHA256 /api/gt-sync/v1" },
    { id: 30, name: "Pin Board", color: "#a3e635", nodes: ["access"], note: "Client visual feedback pins" },
    { id: 40, name: "Production HTTPS", color: "#22d3ee", nodes: ["pve01", "pve02", "pve03"], note: "Traefik v3 TLS 1.3 ingress" },
    { id: 50, name: "Control Plane", color: "#e879f9", nodes: ["pve01", "pve02", "pve03"], note: "Coolify + Node Agent :9999" },
    { id: 60, name: "S3 & Dropbox", color: "#34d399", nodes: ["pve01", "pve02", "pve03"], note: "SeaweedFS S3 + 31TB Dropbox API v2" },
    { id: 70, name: "Antigravity CLI", color: "#facc15", nodes: ["pve01", "pve02", "pve03"], note: "apps1-sovereign-core daemon" },
    { id: 80, name: "PostgreSQL 16", color: "#818cf8", nodes: ["pve01", "pve02", "pve03"], note: "Isolated per-site PG16 vaults" },
    { id: 90, name: "GreenTreeMail", color: "#fb7185", nodes: ["pve01", "pve02", "pve03", "access"], note: "SMTP/IMAP/POP3 + Port 587 relay" },
    { id: 100, name: "60s DNS Anycast", color: "#fb923c", nodes: ["pve01", "pve03"], note: "186 zones @ 60s TTL" }
  ],

  flows: [
    { id: "f-web", label: "Antigravity Remote Control gRPC session", from: { node: "cloudflare" }, to: { service: "mon" }, wan: true, color: "tunnel", modes: ["network", "full"] },
    { id: "f-frp", label: "Uptime Kuma 5-second health probes", from: { node: "vps" }, to: { service: "pub" }, wan: true, color: "tunnel", modes: ["network", "full"], density: 0.6 },
    { id: "f-cli", label: "Global HTTPS visitor & Spoke Sync traffic", from: { node: "internet" }, to: { node: "access" }, wan: true, color: "wan", modes: ["network", "full"] },
    { id: "f-app", label: "Application & API traffic (TLS 1.3)", from: { node: "internet" }, to: { service: "pub" }, wan: true, color: "lan", modes: ["network", "full"], density: 0.7 },
    { id: "f-bkp", label: "WireGuard S3 + Dropbox Business 31TB sync", from: { node: "pve01" }, to: { service: "bkp" }, routed: true, color: "backup", modes: ["full"], density: 0.7 },
    { id: "f-sync", label: "Continuous TLS + PG16 HA state sync", link: "l-ha", bidir: true, color: "ha", modes: ["network", "full"], density: 0.5 },
    { id: "f-stack-ret", label: "WireGuard 10.10.0.0/24 mesh return traffic", link: "l-stack-b", returnOf: "l-stack-a", color: "lan", modes: ["network", "full"], density: 0.8 }
  ],

  scenarios: [
    { id: "wan", key: "A", short: "DNS Master", icon: "antenna", title: "DNS Master B (east10) outage", desc: "ns10 / east10 (135.148.26.170) stops", teaser: "What happens if an authoritative DNS master drops?",
      faults: ["fwa"], recovery: "auto", views: ["network", "full"], focus: ["fwa", "starlink", "wsw1", "opn01"],
      steps: [
        { ph: 0, t: "ns10 / east10 (135.148.26.170) stops responding to DNS queries." },
        { ph: 0, t: "All 186 zones are already replicated across ns4/east3, ns20, ns21, ns30, and ns40 with 60s TTL." },
        { ph: 1, t: "Global resolvers immediately query surviving nameservers (ns4, ns20, ns30, ns40) with zero resolution failure." },
        { ph: 1, t: "Traefik Edge A on APPS1 remains MASTER; client web traffic continues with 0.0s interruption." }
      ] },

    { id: "fw", key: "B", short: "Edge Ingress", icon: "shield", title: "Primary Traefik Edge failure", desc: "Traefik Edge A on APPS1 stops", teaser: "What happens if the primary ingress proxy fails?",
      faults: ["opn01"], recovery: "auto", views: ["network", "full"], focus: ["opn01", "opn02", "l-ha"],
      steps: [
        { ph: 0, t: "Traefik Edge A on APPS1 (148.113.149.8) stops responding." },
        { ph: 0, t: "Uptime Kuma (status.greentreehosting.net) detects the failure within 5 seconds." },
        { ph: 1, t: "Traefik Edge B on APPS2 (40.160.231.241) becomes MASTER with pre-synced Let's Encrypt TLS certificates." },
        { ph: 1, t: "With 60-second DNS TTL across all 186 zones, global traffic shifts to APPS2 automatically." }
      ] },

    { id: "pve01", key: "C", short: "APPS1 Node", icon: "server", title: "APPS1 Monster Node A outage", desc: "Primary compute node (148.113.149.8) stops", teaser: "What happens if APPS1 goes offline?",
      faults: ["pve01"], recovery: "auto", views: ["full"], focus: ["pve01", "pve03"],
      steps: [
        { ph: 0, t: "APPS1 (148.113.149.8 / 10.10.0.1) goes offline." },
        { ph: 0, t: "The 3-node Sovereign Cloud cluster maintains quorum with APPS2 (10.10.0.2) and APPS3 (10.10.0.3)." },
        { ph: 1, t: "Hot-standby containers and replicated PostgreSQL 16 vaults on APPS2 (40.160.231.241) promote to ACTIVE." },
        { ph: 1, t: "49 Spoke Apps, Command Center, and PostgreSQL 16 continue serving from APPS2 with 0.0s data loss." }
      ] },

    { id: "power", key: "D", short: "Grid Power", icon: "bolt", title: "Datacenter utility grid cut", desc: "Mains utility feed drops", teaser: "What happens during a datacenter utility cut?",
      faults: ["grid"], recovery: "auto", views: ["power", "full"], focus: ["grid", "ups", "pdu"],
      steps: [
        { ph: 0, t: "Primary utility substation feed drops." },
        { ph: 0, t: "2N Online Double-Conversion UPS banks carry the load with 0ms transfer time." },
        { ph: 1, t: "N+1 megawatt diesel generators spin up and assume the load (48h autonomous fuel reserve)." },
        { ph: 1, t: "All Sovereign Cloud compute, storage, and WireGuard mesh nodes run without interruption." }
      ] },

    { id: "lan", key: "E", short: "WireGuard A", icon: "switch", title: "WireGuard Hub A tunnel reset", desc: "Primary tunnel leg resets",
      faults: ["b1"], recovery: "auto", views: ["network", "full"], focus: ["b1", "b2", "opn01", "opn02"],
      steps: [
        { ph: 0, t: "WireGuard Hub A (10.10.0.1) resets; Hub B (10.10.0.2/.3) remains active." },
        { ph: 1, t: "Traefik Edge B (APPS2) assumes ingress routing over the surviving mesh leg." }
      ] },

    { id: "pve02", key: "F", short: "APPS3 Node", icon: "disk", title: "APPS3 Cloud Storage & Mail outage", desc: "APPS3 (51.81.220.192) stops",
      faults: ["pve02"], recovery: "standby", views: ["full"], focus: ["pve02", "jbod", "nas2"],
      steps: [
        { ph: 0, t: "APPS3 (51.81.220.192 / 10.10.0.3) stops." },
        { ph: 1, t: "Outbound transactional mail continues uninterrupted via east.greentreemail.com (135.148.26.49)." },
        { ph: 1, t: "All Vhost, MariaDB, and S3 snapshots remain safely accessible in the Dropbox Business 31.0 TB Team Vault." },
        { ph: 1, t: "APPS1 and APPS2 continue serving all 49 Coolify application stacks normally." }
      ] },

    { id: "ups", key: "G", short: "UPS Bypass", icon: "battery", title: "UPS static bypass test", desc: "UPS switches to static bypass",
      faults: ["ups"], recovery: "auto", views: ["power", "full"], focus: ["ups", "grid", "pdu"],
      steps: [
        { ph: 0, t: "Online UPS bank enters maintenance static bypass." },
        { ph: 1, t: "Rack A+B PDUs remain powered directly via Dual Substation Utility Grid + N+1 Diesel Plant." }
      ] }
  ],

  resilience: {
    spof: [
      { id: "pdu", t: "Rack distribution downstream of 2N UPS." },
      { id: "access", t: "Individual client spoke containers report to the active Command Center node." }
    ],
    redundant: [
      { id: "starlink", t: "Dual authoritative BIND9 masters (east3 + east10) with 60s TTL across 5 geo-nameservers." },
      { id: "fwa", t: "Dual authoritative BIND9 masters (east3 + east10) with 60s TTL across 5 geo-nameservers." },
      { id: "wsw1", t: "Geo-distributed DNS slave cluster A (ns20/ns21)." },
      { id: "wsw2", t: "Geo-distributed DNS slave cluster B (ns30/ns40)." },
      { id: "opn01", t: "Traefik v3 Auto-TLS HA pair across APPS1 and APPS2." },
      { id: "opn02", t: "Traefik v3 Auto-TLS HA pair across APPS1 and APPS2." },
      { id: "b1", t: "Kernel WireGuard 10.10.0.0/24 full-mesh backplane." },
      { id: "b2", t: "Kernel WireGuard 10.10.0.0/24 full-mesh backplane." },
      { id: "pve03", t: "APPS2 Hot-Standby node: instant failover target for APPS1 + Uptime Kuma monitor." },
      { id: "nas2", t: "east.greentreemail.com (135.148.26.49) dedicated enterprise mail & SMTP relay." },
      { id: "grid", t: "Dual substation utility feeds backed by N+1 diesel generators." },
      { id: "gen", t: "N+1 diesel generators with 48-hour autonomous fuel reserve." }
    ],
    partial: [
      { id: "pve01", t: "APPS1 workloads replicate continuously to APPS2 (10.10.0.2) and Dropbox Business 31TB." },
      { id: "pve02", t: "APPS3 Vhosts, MariaDB 11.4, and SeaweedFS S3 sync snapshots directly to Dropbox Business 31TB." },
      { id: "jbod", t: "SeaweedFS S3 NVMe array replicated off-site to Dropbox Business 31TB." },
      { id: "ups", t: "2N Online UPS with zero-transfer static bypass." }
    ]
  },

  decisions: [
    { h: "Zero-New-Spend 3-Node Sovereign Cloud HA ($0/mo Extra)",
      p: "By reclaiming idle capacity across OVH Canada (apps1) and OVH US-East (apps2 & apps3) and peering them over a kernel WireGuard mesh (10.10.0.0/24), GreenTree achieves enterprise multi-node high availability with $0.00/mo in additional cloud spend." },
    { h: "Strict 60-Second DNS TTL Across All 186 Zones",
      p: "Every zone and SOA record across ns4/east3, ns10/east10, ns20, ns21, ns30, and ns40 is enforced at 60 seconds so any IP failover propagates globally in under a minute." },
    { h: "Per-Site Isolated PostgreSQL 16 + 15-Min Hot-Standby Sync",
      p: "Each spoke application runs its own isolated PostgreSQL 16 vault on APPS1, reconciled every 15 minutes over WireGuard (10.10.0.1 -> 10.10.0.2) to greentree-postgres-standby on APPS2." },
    { h: "Headless Antigravity Core (apps1-sovereign-core) & Quota Protection",
      p: "The official Google Antigravity CLI daemon runs on APPS1 over an outbound-only encrypted tunnel, routing 15-minute autonomous hub checks to Claude Sonnet 5.5 / GPT-OSS 120B while preserving Gemini 4 Argon High strictly for interactive architecture." },
    { h: "Direct Dropbox Business 31.0 TB Team Vault API v2 Bridge",
      p: "APPS3 connects directly to api.dropboxapi.com/2 (corp@greentreehosting.com · 31.0 TB allocated), enabling in-console archive browsing, 1-click downloads, and instant Vhost/MariaDB snapshot pushes." }
  ]
};
