import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import { request } from "../../../resources/services/apiController";
import { API_URL } from "../../../resources/services/Baseurl";
import { fileForm } from "../../../resources/utils/fileForm";
import type { User } from "../../../resources/types/portfolioTypes";

export async function getProfile() {
  const user = (await request<User[]>("/user/get")).find(
    (item) => item.id === 1,
  );
  if (!user) throw new Error("O perfil do usuário 1 não foi encontrado.");
  return user;
}

export function saveProfile(data: Omit<User, "imageUrl" | "curriculo">) {
  return request<User>("/user/edit", "PATCH", data);
}

export async function uploadProfilePhoto(image: ImagePickerAsset) {
  return request<{ url: string }>(
    "/user/photo",
    "POST",
    await fileForm("photo", image),
  );
}

export async function uploadResume(file: DocumentPickerAsset) {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = file.file || (await (await fetch(file.uri)).blob());
    form.append("resume", blob, file.name);
  } else {
    form.append("resume", {
      uri: file.uri,
      name: file.name,
      type: "application/pdf",
    } as unknown as Blob);
  }
  return request<{ url: string }>("/user/resume", "POST", form);
}

export function deleteResume() {
  return request<void>("/user/resume", "DELETE");
}

// O PDF guardado no servidor vem como caminho relativo à API.
export function resumeUrl(curriculo: string | null | undefined) {
  if (!curriculo) return "";
  return curriculo.startsWith("/") ? `${API_URL}${curriculo}` : curriculo;
}
