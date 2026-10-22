import { Platform } from "react-native";
import type { DocumentPickerAsset } from "expo-document-picker";
import { AI_API_URL } from "../../../resources/services/Baseurl";
import { sessionFetch } from "../../../resources/services/session";
import type { KnowledgeStatus } from "../types/knowledgeTypes";

async function knowledgeRequest(body?: FormData): Promise<KnowledgeStatus> {
  let response: Response;
  try {
    response = await sessionFetch(`${AI_API_URL}/knowledge`, {
      method: body ? "POST" : "GET",
      body,
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API Python. Confira o endereço e se o servidor está ligado.",
    );
  }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof result?.detail === "string"
        ? result.detail
        : `Falha ao consultar a base (${response.status}).`,
    );
  }
  if (typeof result?.ready !== "boolean")
    throw new Error("A API retornou uma resposta inválida.");
  return result;
}

export function getKnowledgeStatus() {
  return knowledgeRequest();
}

export async function uploadKnowledge(file: DocumentPickerAsset) {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = file.file || (await (await fetch(file.uri)).blob());
    form.append("arquivo", blob, file.name);
  } else {
    form.append("arquivo", {
      uri: file.uri,
      name: file.name,
      type: "text/plain",
    } as unknown as Blob);
  }
  return knowledgeRequest(form);
}
