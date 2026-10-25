import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./Baseurl";

export type Session = {
  token: string;
  expiresAt: number;
  admin: { email: string; role: "admin" };
};
type AuthState = { session: Session | null; loading: boolean; error: string };
let state: AuthState = { session: null, loading: true, error: "" };
const listeners = new Set<() => void>();
let restoration: Promise<void> | undefined;
let expiry: ReturnType<typeof setTimeout> | undefined;
const storageKey = "portfolio-admin-session";
export const getAuthState = () => state;
export const subscribeAuth = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
function publish(next: AuthState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export async function setSession(session: Session | null) {
  // No navegador a sessão fica só em memória; no celular usa Keychain/Keystore.
  if (session && Platform.OS !== "web")
    await SecureStore.setItemAsync(storageKey, JSON.stringify(session));
  if (expiry) clearTimeout(expiry);
  publish({ session, loading: false, error: "" });
  if (!session && Platform.OS !== "web")
    await SecureStore.deleteItemAsync(storageKey).catch(() => {});
  if (session)
    expiry = setTimeout(
      () => {
        void setSession(null);
      },
      Math.max(0, session.expiresAt - Date.now()),
    );
}

export async function sessionFetch(url: string, init: RequestInit = {}) {
  const session = state.session;
  const headers = new Headers(init.headers);
  if (session) headers.set("Authorization", `Bearer ${session.token}`);
  const response = await fetch(url, { ...init, headers });
  // Uma resposta atrasada não pode encerrar uma sessão recém-criada.
  if (
    response.status === 401 &&
    session &&
    state.session?.token === session.token
  )
    await setSession(null);
  return response;
}

export function restoreSession() {
  if (restoration) return restoration;
  restoration = (async () => {
    try {
      if (Platform.OS === "web") {
        publish({ session: null, loading: false, error: "" });
        return;
      }
      const saved = await SecureStore.getItemAsync(storageKey);
      if (!saved) {
        await setSession(null);
        return;
      }
      const session = JSON.parse(saved) as Session;
      if (
        typeof session.token !== "string" ||
        !Number.isFinite(session.expiresAt) ||
        session.expiresAt <= Date.now()
      ) {
        await setSession(null);
        return;
      }
      // Tempo para a API hospedada no plano gratuito acordar (~50 s).
      const response = await fetch(`${API_URL}/auth/session`, {
        headers: { Authorization: `Bearer ${session.token}` },
        signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok) {
        await setSession(null);
        return;
      }
      const current = await response.json();
      await setSession({ token: session.token, ...current });
    } catch {
      publish({
        session: null,
        loading: false,
        error: "Não foi possível restaurar a sessão. Entre novamente.",
      });
    }
  })();
  return restoration;
}

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
    signal: AbortSignal.timeout(60_000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(data?.message || "Não foi possível entrar.");
  await setSession(data as Session);
}

export async function signOut() {
  const response = await sessionFetch(`${API_URL}/auth/logout`, {
    method: "POST",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok && response.status !== 401)
    throw new Error("Não foi possível encerrar a sessão. Tente novamente.");
  await setSession(null);
}
