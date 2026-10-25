import { API_URL } from "./Baseurl";
import { sessionFetch } from "./session";

export async function request<T>(
  path: string,
  method = "GET",
  body?: object | FormData,
): Promise<T> {
  const multipart = body instanceof FormData;
  let response: Response;
  try {
    response = await sessionFetch(`${API_URL}${path}`, {
      method,
      headers:
        body && !multipart ? { "Content-Type": "application/json" } : undefined,
      body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error(
      "Não foi possível conectar. Confira sua rede e se o servidor está ligado.",
    );
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.message || `Não foi possível concluir (${response.status}).`,
    );
  return data as T;
}
