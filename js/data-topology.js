window.HomelabDocs = window.HomelabDocs || {};

HomelabDocs.topology = {
  meta: {
    name: "GreenTree Sovereign Cloud",
    disclaimer: "Connected to live GreenTree Command Center telemetry (/api/command/overview) · 10s real-time polling."
  },

  world: { w: 1800, h: 1330 },

  bands: [
    { id: "band-wan", n: "01", title: "Authoritative DNS & 60s TTL Anycast", sub: ["Dual Masters (east3/east10) · Geo-Slaves (ns20/ns30/ns40)"],
      members: ["starlink", "fwa", "wsw1", "wsw2"], x0: 440, x1: 1360, gutter: true },
    { id: "band-fw", n: "02", title: "Edge TLS Ingress & Failover Routing", sub: ["Traefik v3 Auto-TLS · 0.0s Hot-Standby"],
      members: ["opn01", "opn02"], x0: 440, x1: 1360, gutter: true },
    { id: "band-lan", n: "03", title: "WireGuard Encrypted Kernel Mesh", sub: ["10.10.0.0/24 Private Backplane · <1ms-11ms"],
      members: ["b1", "b2"], x0: 440, x1: 1360, gutter: true },
    { id: "band-cmp", n: "04", title: "Sovereign Compute, HA Replica & Cloud Storage", sub: ["3-Node Sovereign Cluster · apps1 + apps2 + apps3"],
      members: ["pve01", "pve03", "pve02", "jbod"], padTop: 50, gutter: false },
    { id: "band-pwr", n: "05", title: "OVH Tier-III+ Power & Redundancy", sub: ["Dual Substation Grid + N+1 Diesel", "2N Online Double-Conversion UPS"],
      members: ["grid", "gen", "ups", "pdu"], x0: 40, padTop: 10, padBottom: 10, gutter: true }
  ],

  nodes: [
    /* ---------- External ---------- */
    { id: "internet", kind: "cloud", label: "Public Internet", sub: "60s DNS TTL · HTTPS/TLS 1.3",
      cx: 900, cy: 64, w: 240, h: 64, layer: "ext",
      role: "Global client traffic routed via 5 Authoritative Nameservers (60s TTL)",
      info: [
        { h: "Role", p: "Global client traffic across 186 authoritative DNS zones, enforced at a strict 60-second TTL across all 5 nameservers for sub-minute failover." },
        { h: "Zero-Inbound Orchestration", p: "Antigravity CLI (apps1-sovereign-core) uses an outbound-only encrypted gRPC tunnel with zero public ports exposed." }
      ] },

    { id: "cloudflare", kind: "ext", icon: "cloud", label: "AGY Remote Control", sub: "apps1-sovereign-core",
      cx: 560, cy: 64, w: 190, h: 54, layer: "ext",
      role: "Outbound encrypted gRPC tunnel to Google Antigravity Remote Control",
      info: [
        { h: "Role", p: "Persistent systemd daemon (antigravity-cli-daemon.service) on apps1 (148.113.149.8) maintaining an outbound-only encrypted session to antigravity.google.com." },
        { h: "Quota Protection", li: [
          "Interactive engineering pinned to Gemini 4 Argon High.",
          "15-minute autonomous hub & Pin Board cron pinned to Claude Sonnet 5.5 / GPT-OSS 120B inside --sandbox."
        ] }
      ] },

    { id: "vps", kind: "ext", icon: "server", label: "Uptime Kuma Monitor", sub: "status.greentreehosting.net",
      cx: 1240, cy: 64, w: 190, h: 54, layer: "ext",
      role: "Independent 5-second HTTP/TCP/DNS health probes & automated failover trigger",
      info: [
        { h: "Role", p: "Continuously probes all 49 Coolify application stacks, PostgreSQL 16 vaults, and authoritative DNS servers every 5 seconds." },
        { h: "Automated Failover", p: "Triggers instant 60s DNS cutover and hot-standby promotion on apps2 if apps1 experiences an outage." }
      ] },

    { id: "offsite", kind: "ext", icon: "archive", label: "Dropbox Business 31TB", sub: "corp@greentreehosting.com",
      cx: 1610, cy: 64, w: 190, h: 54, layer: "ext",
      role: "31.0 TB Off-Site Team Vault (19.32 TB Used · 11.68 TB Free)",
      info: [
        { h: "Role", p: "Live Dropbox Business API v2 integration inside Command Center (/virtualmin, /backups, /Long Term Archives, /Sonitor)." },
        { h: "Why it matters", p: "Provides air-gapped, off-datacenter immutable archive protection across all Virtualmin, MariaDB, PostgreSQL 16, and S3 snapshots." }
      ] },

    /* ---------- 01 · Authoritative DNS & 60s TTL ---------- */
    { id: "starlink", kind: "carrier", icon: "satellite", label: "ns4 / east3 Master", sub: "15.204.224.38 · 110 Zones", wanTag: "DNS A",
      cx: 720, cy: 192, w: 210, h: 60,
      role: "Primary Authoritative BIND9 Master A · Strict 60s TTL",
      info: [
        { h: "Role", p: "Authoritative BIND9 Master (15.204.224.38) hosting 110 production zones with strict 60-second record and SOA TTLs." },
        { h: "Replication", p: "Pushes instant NOTIFY + AXFR zone transfers to ns20, ns21, ns30, and ns40 on every serial bump." }
      ] },

    { id: "fwa", kind: "carrier", icon: "antenna", label: "ns10 / east10 Master", sub: "135.148.26.170 · 76 Zones", wanTag: "DNS B",
      cx: 1080, cy: 192, w: 210, h: 60,
      role: "Secondary Authoritative BIND9 Master B · Strict 60s TTL",
      info: [
        { h: "Role", p: "Authoritative BIND9 Master (135.148.26.170) hosting 76 production zones and consolidated Virtualmin workloads with 60s TTL." },
        { h: "Redundancy", p: "Independent OVH US-East hardware node synchronized with geo-distributed slave nameservers." }
      ] },

    { id: "wsw1", kind: "wansw", label: "ns20 / ns21 Slaves", sub: "161.35.230.191 · Geo DNS",
      cx: 720, cy: 300, w: 200, h: 46,
      role: "Authoritative DNS Geo-Slave Cluster A (60s TTL)",
      info: [
        { h: "Role", p: "Answers global DNS queries for all 186 GreenTree zones with 60s TTL so traffic shifts between apps1 and apps2 in under 60 seconds." }
      ] },

    { id: "wsw2", kind: "wansw", label: "ns30 / ns40 Slaves", sub: "51.81.87.8 · 143.198.51.122",
      cx: 1080, cy: 300, w: 200, h: 46,
      role: "Authoritative DNS Geo-Slave Cluster B (60s TTL)",
      info: [
        { h: "Role", p: "Multi-region secondary DNS cluster (OVH + DigitalOcean) guaranteeing 100% DNS resolution availability during any single-datacenter event." }
      ] },

    /* ---------- 02 · Edge TLS Ingress ---------- */
    { id: "opn01", kind: "firewall", label: "Traefik Edge A (apps1)", sub: "148.113.149.8 · Primary",
      cx: 720, cy: 452, w: 230, h: 78,
      ports: ["DNS1", "DNS2", "WG0", "SYNC"],
      role: "Primary HTTPS/TLS 1.3 Reverse Proxy & Let's Encrypt ACME Engine · MASTER",
      info: [
        { h: "Role", p: "Primary Traefik v3 ingress edge on apps1 (148.113.149.8). Terminates TLS 1.3, enforces HSTS and STD-2026-SEC-GATE-01 dotfile blocks, and routes traffic to all 49 spoke containers." },
        { h: "High Availability", li: [
          "Continuously syncs TLS certificates and dynamic router configurations to Traefik Edge B on apps2 (40.160.231.241) over WireGuard (10.10.0.0/24).",
          "Verified 0.0-second failover to apps2."
        ] }
      ] },

    { id: "opn02", kind: "firewall", label: "Traefik Edge B (apps2)", sub: "40.160.231.241 · Standby",
      cx: 1080, cy: 452, w: 230, h: 78,
      ports: ["DNS1", "DNS2", "WG0", "SYNC"],
      role: "Hot-Standby HTTPS/TLS 1.3 Reverse Proxy & Edge Router · BACKUP",
      info: [
        { h: "Role", p: "Hot-standby Traefik v3 ingress edge on apps2 (40.160.231.241). Mirrors TLS certificates and routes traffic seamlessly across the WireGuard mesh." }
      ] },

    /* ---------- 03 · WireGuard Kernel Mesh ---------- */
    { id: "b1", kind: "switch", unit: 1, label: "WireGuard Mesh Hub A", sub: "10.10.0.1 · OVH Canada",
      cx: 720, cy: 612, w: 240, h: 64,
      role: "Encrypted Kernel WireGuard Tunnel Endpoint (10.10.0.1:51820)",
      info: [
        { h: "Role", p: "ChaCha20-Poly1305 kernel-space encrypted mesh linking apps1 (10.10.0.1), apps2 (10.10.0.2), and apps3 (10.10.0.3) with sub-11ms cross-datacenter latency." }
      ] },

    { id: "b2", kind: "switch", unit: 2, label: "WireGuard Mesh Hub B", sub: "10.10.0.2/.3 · OVH US-East",
      cx: 1080, cy: 612, w: 240, h: 64,
      role: "Encrypted Kernel WireGuard Tunnel Endpoint (10.10.0.2 & 10.10.0.3)",
      info: [
        { h: "Role", p: "Connects US-East compute, PostgreSQL 16 hot-standby replication, and apps3 internal cloud services (10.10.0.3:9999) with zero public port exposure." }
      ] },

    { id: "access", kind: "access", label: "49 Client Spoke Sites", sub: "GT-Sync v1 · SEC-GATE-01",
      cx: 1500, cy: 532, w: 200, h: 66,
      role: "49 Production Web Applications & Client Portals on Coolify",
      info: [
        { h: "Role", p: "All 49 production client spoke applications connected bi-directionally to Command Center via HMAC-SHA256 signed webhooks (/api/gt-sync/v1/*)." },
        { h: "Security", p: "Protected by Mandatory 8-Point Security Gate (STD-2026-SEC-GATE-01): 404 on /.env probes, 401 on unauthenticated APIs, and isolated PostgreSQL 16 vaults." }
      ] },

    /* ---------- 04 · Sovereign Compute & Storage ---------- */
    { id: "pve01", kind: "server", label: "APPS1", sub: "148.113.149.8 · Control Plane", model: "8 vCore · 24GB · 200GB NVMe",
      cx: 470, cy: 885, w: 440, h: 250,
      pools: [ { name: "NVMe OS", topo: "ext4", disks: 2, kind: "ssd" },
               { name: "PG16 Vaults", topo: "isolated", disks: 4, kind: "ssd" } ],
      tree: [
        ["Compute", ["49 Coolify Spoke Containers · Command Center", "Antigravity Headless Core (apps1-sovereign-core)"]],
        ["Databases", ["Isolated PostgreSQL 16 Container Vaults", "15-min continuous reconciliation to APPS2"]],
        ["Network", ["Public 148.113.149.8 + WireGuard 10.10.0.1"]],
        ["Protection", ["Daily pg_dumpall + Dropbox Business 31TB sync", "Hot-standby container & DB replica on APPS2"]]
      ],
      role: "Monster Node A · Primary Control Plane, Build Engine & Antigravity Core",
      info: [
        { h: "Role", p: "Hosts the Coolify v4 Control Plane, GreenTree Command Center (command.greentreehosting.com), 49 production spoke containers, isolated PostgreSQL 16 databases, and the headless Google Antigravity CLI daemon (apps1-sovereign-core)." },
        { h: "If APPS1 fails", p: "Traefik Edge B and replicated standby containers + PostgreSQL 16 hot-standby on APPS2 (40.160.231.241) take over automatically with 0.0s data loss." }
      ] },

    { id: "pve03", kind: "server", label: "APPS2", sub: "40.160.231.241 · Hot-Standby",
      cx: 900, cy: 885, w: 300, h: 250, recovery: true,
      pools: [ { name: "NVMe Standby", topo: "PG16 Replica", abstract: true } ],
      tree: [
        ["Compute", ["Hot-Standby Replica for APPS1", "Uptime Kuma (status.greentreehosting.net)"]],
        ["Database", ["Hot-Standby PostgreSQL 16 (greentree-postgres-standby)"]],
        ["Network", ["Public 40.160.231.241 + WireGuard 10.10.0.2"]]
      ],
      role: "Hot-Standby Replica, Edge Router & Out-of-Band Telemetry Node",
      info: [
        { h: "Role", p: "Runs hot-standby replicas of critical spoke containers, continuous 15-minute PostgreSQL 16 state replication from APPS1 (10.10.0.1 -> 10.10.0.2), and Uptime Kuma monitoring." },
        { h: "If APPS1 fails", p: "Automatically promotes replicated workloads (Command Center, Flagship, Client Spokes, and PostgreSQL 16) to ACTIVE." }
      ] },

    { id: "pve02", kind: "server", label: "APPS3", sub: "51.81.220.192 · Cloud Mail & S3",
      cx: 1330, cy: 885, w: 440, h: 250,
      pools: [ { name: "Mail & DB", topo: "NVMe", disks: 2, kind: "ssd" },
               { name: "SeaweedFS", topo: "S3 Pool", disks: 2, kind: "ssd" } ],
      protection: ["1-Click Dropbox Business Snapshot Push", "DKIM / DMARC / SPF + Rspamd", "WireGuard-isolated Node Agent (:9999)"],
      tree: [
        ["Cloud Hosting", ["PHP 8.3 + Apache Vhosts (/srv/vhosts)", "MariaDB 11.4 + SFTPGo (:2022)"]],
        ["Cloud Mail", ["Poste.io (cloud.greentreemail.com)", "POP3 / IMAP / SMTP / Roundcube Webmail"]],
        ["Object Storage", ["SeaweedFS S3 (s3.greentreehosting.net)", "Direct Dropbox Business 31TB API v2 Bridge"]]
      ],
      role: "Monster Node C · Integrated Cloud Hosting, GreenTreeMail, MariaDB 11.4 & SeaweedFS S3",
      info: [
        { h: "Role", p: "Powers the in-console GreenTree Cloud Hosting suite on 51.81.220.192 (10.10.0.3): Website Vhosts, GreenTreeMail Cloud Server, SFTPGo (:2022), MariaDB 11.4, SeaweedFS S3, and the Dropbox Business 31TB API v2 bridge." },
        { h: "Zero External Logins", p: "Controlled natively inside command.greentreehosting.com via /api/command/cloud-panel -> http://10.10.0.3:9999." }
      ] },

    { id: "jbod", kind: "jbod", label: "SeaweedFS S3 Array", sub: "191 GB Free NVMe · s3.greentreehosting.net",
      cx: 1330, cy: 1087, w: 320, h: 84,
      pools: [ { name: "S3 Buckets", topo: "NVMe", disks: 3, kind: "ssd" },
               { name: "Vhost Media", topo: "Archive", disks: 3, kind: "hdd" } ],
      role: "Sovereign S3-Compatible Object Storage & Filer ($0 Egress)",
      info: [
        { h: "Buckets", li: [ "genetravels-media · greentree-backups · command-center-assets", "vhost-media · mail-archive" ] },
        { h: "Off-Site Sync", li: [ "Backed up directly to Dropbox Business 31.0 TB Team Vault (corp@greentreehosting.com)" ] }
      ] },

    { id: "nas2", kind: "nas", label: "east.greentreemail", sub: "135.148.26.49", sub2: "SmarterMail Relay",
      cx: 1628, cy: 885, w: 124, h: 104,
      role: "Production Enterprise Mail & Port 587 STARTTLS Outbound Relay",
      info: [
        { h: "Role", p: "Primary SmarterMail server (135.148.26.49) handling enterprise client email and authenticated Port 587 STARTTLS transactional form dispatch across all spoke sites." }
      ] },

    /* ---------- 05 · Power ---------- */
    { id: "grid", kind: "grid", layer: "power", label: "OVH Utility Grid", sub: "Dual A+B Substations",
      cx: 300, cy: 1226, w: 170, h: 44,
      role: "Redundant High-Voltage Datacenter Utility Feeds (BHS & VINT)",
      info: [ { h: "Role", p: "Dual independent utility substation feeds into OVH Beauharnois (Canada) and OVH Vint Hill (US-East)." } ] },

    { id: "gen", kind: "generator", layer: "power", label: "N+1 Diesel Plant", sub: "48h Autonomous Fuel",
      cx: 300, cy: 1282, w: 170, h: 44,
      role: "Datacenter N+1 Diesel Generator Array",
      info: [ { h: "Role", p: "Automatic transfer switch engages N+1 diesel generators within seconds of any utility grid drop." } ] },

    { id: "ups", kind: "ups", layer: "power", label: "2N Online UPS", sub: "Double-Conversion",
      cx: 590, cy: 1254, w: 200, h: 66,
      role: "Zero-Transfer Online Double-Conversion UPS Bank",
      info: [ { h: "Role", p: "Conditions all rack power and bridges the transition between utility mains and N+1 diesel generators with 0ms interruption." } ] },

    { id: "pdu", kind: "pdu", layer: "power", label: "Rack A+B PDUs", sub: "Protected Feeds",
      cx: 900, cy: 1254, w: 210, h: 48,
      role: "Redundant Rack Power Distribution",
      info: [ { h: "Role", p: "Delivers conditioned, surge-protected power to all compute, storage, and networking nodes." } ] }
  ],

  links: [
    { id: "l-inet-sl", a: "internet", b: "starlink", type: "wan", pa: ["bottom", -55], pb: ["top", 0], via: [{ y: 126 }] },
    { id: "l-inet-fwa", a: "internet", b: "fwa", type: "wan", pa: ["bottom", 55], pb: ["top", 0], via: [{ y: 126 }] },
    { id: "l-cf", a: "cloudflare", b: "internet", type: "tunnel", logical: true, pa: ["right", 0], pb: ["left", 0], label: { t: "gRPC tunnel", x: 718, y: 55 } },
    { id: "l-vps", a: "internet", b: "vps", type: "tunnel", logical: true, pa: ["right", 0], pb: ["left", 0], label: { t: "5s probes", x: 1082, y: 55 } },
    { id: "l-sl-w1", a: "starlink", b: "wsw1", type: "wan", pa: ["bottom", 0], pb: ["top", 0] },
    { id: "l-fwa-w2", a: "fwa", b: "wsw2", type: "wan", pa: ["bottom", 0], pb: ["top", 0] },
    { id: "l-w1-o1", a: "wsw1", b: "opn01", type: "wan", pa: ["bottom", -30], pb: ["top", -45] },
    { id: "l-w1-o2", a: "wsw1", b: "opn02", type: "wan", pa: ["bottom", 30], pb: ["top", -45], via: [{ y: 368 }, { x: 1035 }] },
    { id: "l-w2-o1", a: "wsw2", b: "opn01", type: "wan", pa: ["bottom", -30], pb: ["top", 45], via: [{ y: 382 }, { x: 765 }] },
    { id: "l-w2-o2", a: "wsw2", b: "opn02", type: "wan", pa: ["bottom", 30], pb: ["top", 45] },
    { id: "l-ha", a: "opn01", b: "opn02", type: "ha", pa: ["right", 0], pb: ["left", 0], label: { t: "TLS + Route Sync", x: 900, y: 443 } },
    { id: "l-o1-b1", a: "opn01", b: "b1", type: "lan", pa: ["bottom", 0], pb: ["top", 0], vlans: "all", label: { t: "wg0 trunk", x: 676, y: 536 } },
    { id: "l-o2-b2", a: "opn02", b: "b2", type: "lan", pa: ["bottom", 0], pb: ["top", 0], vlans: "all" },
    { id: "l-stack-a", a: "b1", b: "b2", type: "stack", pa: ["right", -10], pb: ["left", -10], label: { t: "10.10.0.0/24 MESH", x: 900, y: 594 } },
    { id: "l-stack-b", a: "b1", b: "b2", type: "stack", pa: ["right", 10], pb: ["left", 10] },
    { id: "l-b1-pve1", a: "b1", b: "pve01", type: "lan", bond: "pve01", pa: ["bottom", -90], pb: ["top", 150], vlans: "all", label: { t: "WireGuard · dual path", x: 590, y: 734, anchor: "end" } },
    { id: "l-b2-pve1", a: "b2", b: "pve01", type: "lan", bond: "pve01", pa: ["bottom", -90], pb: ["top", 190], via: [{ y: 690 }, { x: 660 }], vlans: "all" },
    { id: "l-b1-pve3", a: "b1", b: "pve03", type: "lan", bond: "pve03", pa: ["bottom", 60], pb: ["top", 90], via: [{ y: 716 }, { x: 990 }], vlans: "all" },
    { id: "l-b2-pve3", a: "b2", b: "pve03", type: "lan", bond: "pve03", pa: ["bottom", -60], pb: ["top", 120], vlans: "all" },
    { id: "l-b1-pve2", a: "b1", b: "pve02", type: "lan", bond: "pve02", pa: ["bottom", 100], pb: ["top", -190], via: [{ y: 672 }, { x: 1140 }], vlans: "all" },
    { id: "l-b2-pve2", a: "b2", b: "pve02", type: "lan", bond: "pve02", pa: ["bottom", 100], pb: ["top", -150], vlans: "all", label: { t: "10.10.0.3:9999", x: 1188, y: 734, anchor: "start" } },
    { id: "l-b1-acc", a: "b1", b: "access", type: "lan", poe: true, pa: ["top", 70], pb: ["left", -12], via: [{ y: 520 }], vlans: [20, 30, 90] },
    { id: "l-b2-acc", a: "b2", b: "access", type: "lan", poe: true, pa: ["top", 90], pb: ["left", 13], via: [{ y: 545 }], vlans: [20, 30, 90] },
    { id: "l-pve2-jbod", a: "pve02", b: "jbod", type: "storage", pa: ["bottom", 0], pb: ["top", 0] },
    { id: "l-b2-nas2", a: "b2", b: "nas2", type: "lan", pa: ["right", -12], pb: ["top", 0], via: [{ x: 1628 }] },
    { id: "l-repl", a: "pve01", b: "pve03", type: "replica", logical: true, pa: ["right", 0], pb: ["left", 0], label: { t: "PG16 + App Replica", x: 720, y: 877 } },
    { id: "l-bkp", a: "pve01", b: "pve02", type: "backup", logical: true, pa: ["bottom", 100], pb: ["left", 100], via: [{ y: 1080 }, { x: 1080 }], label: { t: "S3 + DB Backup", x: 790, y: 1072 } },
    { id: "l-bkp3", a: "pve03", b: "pve02", type: "backup", logical: true, pa: ["right", 60], pb: ["left", 60] },
    { id: "l-bkp-nas2", a: "pve02", b: "nas2", type: "backup", logical: true, pa: ["right", 0], pb: ["left", 0] },
    { id: "l-offsite", a: "jbod", b: "offsite", type: "offsite", logical: true, pa: ["right", 0], pb: ["right", 0], via: [{ x: 1760 }, { y: 64 }], label: { t: "Dropbox API v2 (31 TB)", x: 1776, y: 640, rotate: -90 } },
    { id: "p-grid-ups", a: "grid", b: "ups", type: "power", pa: ["right", 0], pb: ["left", -14], via: [{ x: 430 }, { y: 1238 }] },
    { id: "p-gen-ups", a: "gen", b: "ups", type: "power", pa: ["right", 0], pb: ["left", 14], via: [{ x: 430 }, { y: 1266 }] },
    { id: "p-ups-pdu", a: "ups", b: "pdu", type: "power", pa: ["right", 0], pb: ["left", 0], label: { t: "2N protected", x: 755, y: 1243 } },
    { id: "p-pve1", a: "pdu", b: "pve01", type: "power", pa: ["top", -40], pb: ["left", 0], via: [{ y: 1186 }, { x: 210 }] },
    { id: "p-b1", a: "pdu", b: "b1", type: "power", pa: ["top", -40], pb: ["left", 22], via: [{ y: 1186 }, { x: 210 }] },
    { id: "p-opn1", a: "pdu", b: "opn01", type: "power", pa: ["top", -40], pb: ["left", 26], via: [{ y: 1186 }, { x: 210 }] },
    { id: "p-wsw1", a: "pdu", b: "wsw1", type: "power", pa: ["top", -40], pb: ["left", 14], via: [{ y: 1186 }, { x: 210 }] },
    { id: "p-sl", a: "pdu", b: "starlink", type: "power", pa: ["top", -40], pb: ["left", 20], via: [{ y: 1186 }, { x: 210 }] },
    { id: "p-pve3", a: "pdu", b: "pve03", type: "power", pa: ["top", 0], pb: ["bottom", 0] },
    { id: "p-pve2", a: "pdu", b: "pve02", type: "power", pa: ["right", 0], pb: ["bottom", -180], via: [{ x: 1150 }] },
    { id: "p-jbod", a: "pdu", b: "jbod", type: "power", pa: ["right", 0], pb: ["bottom", 0], via: [{ x: 1330 }] },
    { id: "p-b2", a: "pdu", b: "b2", type: "power", pa: ["right", 0], pb: ["right", 22], via: [{ x: 1712 }] },
    { id: "p-opn2", a: "pdu", b: "opn02", type: "power", pa: ["right", 0], pb: ["right", 26], via: [{ x: 1712 }] },
    { id: "p-wsw2", a: "pdu", b: "wsw2", type: "power", pa: ["right", 0], pb: ["right", 14], via: [{ x: 1712 }] },
    { id: "p-fwa", a: "pdu", b: "fwa", type: "power", pa: ["right", 0], pb: ["right", 20], via: [{ x: 1712 }] }
  ],

  powerLabels: [
    { t: "OVH BHS Power Spine", x: 198, y: 640, rotate: -90 },
    { t: "OVH VINT Power Spine", x: 1726, y: 700, rotate: 90 }
  ]
};
