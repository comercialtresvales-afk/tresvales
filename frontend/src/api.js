/**
 * api.js — Camada de comunicação com o backend
 * Substitui window.storage por chamadas HTTP REST + Socket.IO em tempo real
 */

import { io } from "socket.io-client";

// URL do backend — em produção, usa a mesma origem (backend serve o frontend)
// Em desenvolvimento, Vite proxy redireciona /api e /socket.io para :3001
const API_URL = import.meta.env.VITE_API_URL || "";

// ── SOCKET.IO ─────────────────────────────────────────────────────────────────
export const socket = io(API_URL, {
  transports: ["websocket", "polling"],
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// ── REST HELPERS ──────────────────────────────────────────────────────────────
async function req(method, path, body) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── API PÚBLICA ───────────────────────────────────────────────────────────────

/** Carrega o estado completo do sistema */
export const getState    = ()                => req("GET",  "/state");

/** CRUD genérico por módulo */
export const createRecord = (modulo, dados)  => req("POST", `/${modulo}`, dados);
export const updateRecord = (modulo, id, dados) => req("PUT", `/${modulo}/${id}`, dados);
export const deleteRecord = (modulo, id)     => req("DELETE", `/${modulo}/${id}`);

/** Config da empresa */
export const getConfig    = ()               => req("GET",  "/config");
export const saveConfig   = (dados)          => req("PUT",  "/config", dados);

/** Reset para dados iniciais */
export const resetData    = ()               => req("POST", "/reset");
