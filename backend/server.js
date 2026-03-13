/**
 * ═══════════════════════════════════════════════════════════════════
 *  COMERCIAL TRÊS VALES — Backend v1.0
 *  Stack: Node.js · Express · Socket.IO · SQLite (better-sqlite3)
 *  Suporta: 4+ usuários simultâneos · tempo real via WebSocket
 * ═══════════════════════════════════════════════════════════════════
 */

const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const Database   = require("better-sqlite3");
const cors       = require("cors");
const path       = require("path");
const fs         = require("fs");

// ── CONFIG ────────────────────────────────────────────────────────────────────
const PORT    = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "tresvales.db");
// Em produção (Railway/Render) aceita qualquer origem pois o frontend e backend
// ficam no mesmo domínio. Em dev, usa localhost.
const ORIGINS = process.env.NODE_ENV === "production"
  ? true  // aceita qualquer origem
  : (process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173"]);

// Garante que a pasta data existe
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// ── BANCO ─────────────────────────────────────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");  // melhor concorrência
db.pragma("foreign_keys = ON");

// Cada "módulo" é uma tabela com id INTEGER + dados JSON + timestamps
const MODULOS = [
  "usuarios","clientes","industrias","produtos","regras",
  "pedidos","mix","orcamentos","faturamentos","comissoes","metas","historico"
];

// Cria tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  ${MODULOS.map(m => `
    CREATE TABLE IF NOT EXISTS ${m} (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      dados      TEXT    NOT NULL,
      criado_em  TEXT    NOT NULL DEFAULT (datetime('now')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `).join("")}
`);

// ── SEED (dados iniciais se banco estiver vazio) ───────────────────────────────
function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) as n FROM clientes").get().n;
  if (count > 0) return;

  console.log("🌱 Banco vazio — inserindo dados iniciais...");

  const SEED = {
    usuarios: [
      { nome:"Administrador", email:"admin@tresvales.com.br", perfil:"Administrador", status:"Ativo" }
    ],
    clientes: [
      { nome:"Coelho Diniz",         razao:"", cnpj:"", perfil:"Varejo",        grupo:"Coelho Diniz", prazo:"",         uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"Lojas Rede",           razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"90D",      uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"Mart Minas",           razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"120D",     uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"Casa Aladim TO",       razao:"", cnpj:"", perfil:"Distribuidora", grupo:"",             prazo:"60D",      uf:"TO", cidade:"", status:"Ativo", obs:"" },
      { nome:"DCA Bahia",            razao:"", cnpj:"", perfil:"Distribuidora", grupo:"DCA Grupo",    prazo:"60D",      uf:"BA", cidade:"", status:"Ativo", obs:"" },
      { nome:"DCA Centro Oeste",     razao:"", cnpj:"", perfil:"Distribuidora", grupo:"DCA Grupo",    prazo:"60D",      uf:"GO", cidade:"", status:"Ativo", obs:"" },
      { nome:"DAC Betim",            razao:"", cnpj:"", perfil:"Distribuidora", grupo:"DCA Grupo",    prazo:"60D",      uf:"MG", cidade:"Betim", status:"Ativo", obs:"" },
      { nome:"DEC BA",               razao:"", cnpj:"", perfil:"Distribuidora", grupo:"",             prazo:"50D",      uf:"BA", cidade:"", status:"Ativo", obs:"" },
      { nome:"DEC MG",               razao:"", cnpj:"", perfil:"Distribuidora", grupo:"",             prazo:"50D",      uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"Camila Rocha",         razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"",         uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"L.A.C Cosméticos",     razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"30/60D",   uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"DMA (EPA & Mineirão)", razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"90D",      uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"Francis Cosméticos",   razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"30/45/60", uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"Villefort",            razao:"", cnpj:"", perfil:"Varejo",        grupo:"",             prazo:"60D",      uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"Coelho Diniz / HAF",   razao:"", cnpj:"", perfil:"Varejo",        grupo:"Coelho Diniz", prazo:"",         uf:"MG", cidade:"", status:"Ativo", obs:"" },
      { nome:"DPC",                  razao:"", cnpj:"", perfil:"Distribuidora", grupo:"",             prazo:"60D",      uf:"MG", cidade:"", status:"Ativo", obs:"" },
    ],
    industrias: [
      { nome:"Labotrat",             fantasia:"Labotrat",  razao:"", cnpj:"", contato:"", email:"", tel:"", status:"Ativo", obs:"" },
      { nome:"Zalike",               fantasia:"Zalike",    razao:"", cnpj:"", contato:"", email:"", tel:"", status:"Ativo", obs:"" },
      { nome:"Duty (Dabelle Eico)",  fantasia:"Duty",      razao:"", cnpj:"", contato:"", email:"", tel:"", status:"Ativo", obs:"" },
      { nome:"Aeroflex",             fantasia:"Aeroflex",  razao:"", cnpj:"", contato:"", email:"", tel:"", status:"Ativo", obs:"" },
      { nome:"Clinoff & Cottonbaby", fantasia:"Clinoff",   razao:"", cnpj:"", contato:"", email:"", tel:"", status:"Ativo", obs:"" },
      { nome:"MZ3 - Fixed Keratex",  fantasia:"MZ3",       razao:"", cnpj:"", contato:"", email:"", tel:"", status:"Ativo", obs:"" },
      { nome:"Gummy",                fantasia:"Gummy",     razao:"", cnpj:"", contato:"", email:"", tel:"", status:"Ativo", obs:"" },
      { nome:"Exclusive",            fantasia:"Exclusive", razao:"", cnpj:"", contato:"", email:"", tel:"", status:"Ativo", obs:"" },
    ],
    regras: [
      { industria:"Labotrat", cliente:"Coelho Diniz",        perfil:"Varejo",        prazo:"28D",      formato:"FATURAMENTO", comissao:7,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"Lojas Rede",          perfil:"Varejo",        prazo:"90D",      formato:"LIQUIDEZ",    comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"Mart Minas",          perfil:"Varejo",        prazo:"120D",     formato:"LIQUIDEZ",    comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"Casa Aladim TO",      perfil:"Distribuidora", prazo:"60D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"DCA Bahia",           perfil:"Distribuidora", prazo:"60D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"DCA Centro Oeste",    perfil:"Distribuidora", prazo:"60D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"DAC Betim",           perfil:"Distribuidora", prazo:"60D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"DEC BA",              perfil:"Distribuidora", prazo:"50D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"DEC MG",              perfil:"Distribuidora", prazo:"50D",      formato:"FATURAMENTO", comissao:6,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"Camila Rocha",        perfil:"Varejo",        prazo:"",         formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Labotrat", cliente:"L.A.C Cosméticos",    perfil:"Varejo",        prazo:"30/60D",   formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Zalike",   cliente:"Coelho Diniz",        perfil:"Varejo",        prazo:"15D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Zalike",   cliente:"DMA (EPA & Mineirão)",perfil:"Varejo",        prazo:"90D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Zalike",   cliente:"Francis Cosméticos",  perfil:"Varejo",        prazo:"30/45/60", formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Zalike",   cliente:"Casa Aladim TO",      perfil:"Distribuidora", prazo:"75D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Zalike",   cliente:"DCA Bahia",           perfil:"Distribuidora", prazo:"75D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Zalike",   cliente:"DCA Centro Oeste",    perfil:"Distribuidora", prazo:"75D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Zalike",   cliente:"DAC Betim",           perfil:"Distribuidora", prazo:"75D",      formato:"FATURAMENTO", comissao:8,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Duty (Dabelle Eico)", cliente:"Coelho Diniz / HAF", perfil:"Varejo",        prazo:"28D", formato:"LIQUIDEZ",    comissao:4,   desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Duty (Dabelle Eico)", cliente:"Villefort",          perfil:"Varejo",        prazo:"60D", formato:"LIQUIDEZ",    comissao:3.5, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Aeroflex", cliente:"Coelho Diniz / HAF",  perfil:"Varejo",        prazo:"15D", formato:"LIQUIDEZ",    comissao:4, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Aeroflex", cliente:"Casa Aladim TO",      perfil:"Distribuidora", prazo:"90D", formato:"LIQUIDEZ",    comissao:3, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Aeroflex", cliente:"DCA Bahia",           perfil:"Distribuidora", prazo:"90D", formato:"LIQUIDEZ",    comissao:3, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Aeroflex", cliente:"DCA Centro Oeste",    perfil:"Distribuidora", prazo:"90D", formato:"LIQUIDEZ",    comissao:3, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Aeroflex", cliente:"DAC Betim",           perfil:"Distribuidora", prazo:"90D", formato:"LIQUIDEZ",    comissao:3, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Clinoff & Cottonbaby", cliente:"Coelho Diniz / HAF", perfil:"Varejo", prazo:"15D", formato:"LIQUIDEZ", comissao:3, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"MZ3 - Fixed Keratex",  cliente:"Coelho Diniz",       perfil:"Varejo",        prazo:"28D", formato:"FATURAMENTO", comissao:7, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"MZ3 - Fixed Keratex",  cliente:"DPC",                perfil:"Distribuidora", prazo:"60D", formato:"LIQUIDEZ",    comissao:7, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Gummy", cliente:"Casa Aladim TO",   perfil:"Distribuidora", prazo:"60D", formato:"LIQUIDEZ", comissao:5, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Gummy", cliente:"DCA Bahia",        perfil:"Distribuidora", prazo:"60D", formato:"LIQUIDEZ", comissao:5, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Gummy", cliente:"DCA Centro Oeste", perfil:"Distribuidora", prazo:"60D", formato:"LIQUIDEZ", comissao:5, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Gummy", cliente:"DAC Betim",        perfil:"Distribuidora", prazo:"60D", formato:"LIQUIDEZ", comissao:5, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
      { industria:"Exclusive", cliente:"Coelho Diniz", perfil:"Varejo", prazo:"7D", formato:"FATURAMENTO", comissao:3, desconto:0, inicio:"2025-01-01", fim:"", status:"Ativo", obs:"" },
    ],
  };

  const insert = db.prepare("INSERT INTO :table (dados) VALUES (:dados)");
  const insertMany = db.transaction((table, rows) => {
    const stmt = db.prepare(`INSERT INTO ${table} (dados) VALUES (?)`);
    for (const row of rows) stmt.run(JSON.stringify(row));
  });

  for (const [table, rows] of Object.entries(SEED)) {
    insertMany(table, rows);
  }

  console.log("✅ Dados iniciais inseridos com sucesso.");
}

seedIfEmpty();

// ── HELPERS DB ────────────────────────────────────────────────────────────────

/** Retorna todos os registros de um módulo como array de objetos */
function getAll(modulo) {
  return db.prepare(`SELECT id, dados FROM ${modulo} ORDER BY id`).all()
    .map(row => ({ ...JSON.parse(row.dados), id: row.id }));
}

/** Retorna o estado completo do sistema */
function getFullState() {
  const state = {};
  for (const m of MODULOS) {
    state[m] = getAll(m);
  }
  // config
  const cfg = db.prepare("SELECT chave, valor FROM config").all();
  state.config = cfg.reduce((acc, r) => ({ ...acc, [r.chave]: r.valor }), {});
  return state;
}

/** Upsert: cria ou atualiza um registro */
function upsertRow(modulo, id, dados) {
  const { id: _ignore, ...rest } = dados; // remove id dos dados JSON
  if (id) {
    db.prepare(`UPDATE ${modulo} SET dados = ?, atualizado_em = datetime('now') WHERE id = ?`)
      .run(JSON.stringify(rest), id);
    return id;
  } else {
    const info = db.prepare(`INSERT INTO ${modulo} (dados) VALUES (?)`).run(JSON.stringify(rest));
    return info.lastInsertRowid;
  }
}

/** Deleta um registro */
function deleteRow(modulo, id) {
  db.prepare(`DELETE FROM ${modulo} WHERE id = ?`).run(id);
}

// ── EXPRESS ───────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: ORIGINS, methods: ["GET","POST","PUT","DELETE"] }
});

app.use(cors({ origin: ORIGINS }));
app.use(express.json({ limit: "10mb" }));

// Serve frontend buildado (se existir)
const frontendDist = path.join(__dirname, "public");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// ── REST API ──────────────────────────────────────────────────────────────────

/** GET /api/state — estado completo */
app.get("/api/state", (req, res) => {
  try {
    res.json(getFullState());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** GET /api/:modulo — lista todos */
app.get("/api/:modulo", (req, res) => {
  const { modulo } = req.params;
  if (!MODULOS.includes(modulo)) return res.status(404).json({ error: "Módulo não encontrado" });
  res.json(getAll(modulo));
});

/** POST /api/:modulo — cria novo registro */
app.post("/api/:modulo", (req, res) => {
  const { modulo } = req.params;
  if (!MODULOS.includes(modulo)) return res.status(404).json({ error: "Módulo não encontrado" });
  try {
    const newId = upsertRow(modulo, null, req.body);
    const record = { ...req.body, id: newId };
    // notifica todos os outros clientes via WebSocket
    io.emit("record:created", { modulo, record });
    res.status(201).json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** PUT /api/:modulo/:id — atualiza registro */
app.put("/api/:modulo/:id", (req, res) => {
  const { modulo, id } = req.params;
  if (!MODULOS.includes(modulo)) return res.status(404).json({ error: "Módulo não encontrado" });
  try {
    upsertRow(modulo, Number(id), req.body);
    const record = { ...req.body, id: Number(id) };
    io.emit("record:updated", { modulo, record });
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** DELETE /api/:modulo/:id — deleta registro */
app.delete("/api/:modulo/:id", (req, res) => {
  const { modulo, id } = req.params;
  if (!MODULOS.includes(modulo)) return res.status(404).json({ error: "Módulo não encontrado" });
  try {
    deleteRow(modulo, Number(id));
    io.emit("record:deleted", { modulo, id: Number(id) });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** GET/PUT /api/config */
app.get("/api/config", (req, res) => {
  const cfg = db.prepare("SELECT chave, valor FROM config").all();
  res.json(cfg.reduce((acc, r) => ({ ...acc, [r.chave]: r.valor }), {}));
});

app.put("/api/config", (req, res) => {
  const upsert = db.prepare(`
    INSERT INTO config (chave, valor, atualizado_em) VALUES (?, ?, datetime('now'))
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em
  `);
  const save = db.transaction(data => {
    for (const [k, v] of Object.entries(data)) upsert.run(k, String(v));
  });
  save(req.body);
  io.emit("config:updated", req.body);
  res.json({ ok: true });
});

/** POST /api/reset — restaura dados iniciais (apenas dev) */
app.post("/api/reset", (req, res) => {
  for (const m of MODULOS) db.prepare(`DELETE FROM ${m}`).run();
  db.prepare("DELETE FROM config").run();
  seedIfEmpty();
  const state = getFullState();
  io.emit("state:reset", state);
  res.json({ ok: true });
});

/** Health check */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), ts: new Date().toISOString() });
});

// Catch-all para SPA
app.get("*", (req, res) => {
  if (fs.existsSync(path.join(frontendDist, "index.html"))) {
    res.sendFile(path.join(frontendDist, "index.html"));
  } else {
    res.json({ msg: "Backend Três Vales rodando. Frontend não buildado ainda." });
  }
});

// ── SOCKET.IO ─────────────────────────────────────────────────────────────────
let connectedUsers = 0;

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`🔌 Cliente conectado: ${socket.id} (${connectedUsers} online)`);

  // Envia estado completo ao conectar
  socket.emit("state:full", getFullState());

  // Broadcast de usuários online
  io.emit("users:online", connectedUsers);

  socket.on("disconnect", () => {
    connectedUsers--;
    io.emit("users:online", connectedUsers);
    console.log(`🔌 Cliente desconectado: ${socket.id} (${connectedUsers} online)`);
  });

  // O cliente pode solicitar refresh manual
  socket.on("state:request", () => {
    socket.emit("state:full", getFullState());
  });
});

// ── START ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   Comercial Três Vales — Backend v1.0    ║
  ║   Porta: ${PORT}                             ║
  ║   Banco: ${DB_PATH.split("/").pop()}               ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
