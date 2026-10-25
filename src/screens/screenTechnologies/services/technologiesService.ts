import type { ImagePickerAsset } from "expo-image-picker";
import { request } from "../../../resources/services/apiController";
import { fileForm } from "../../../resources/utils/fileForm";
import type { Technology } from "../../../resources/types/portfolioTypes";

export function getTechnologies() {
  return request<Technology[]>("/technologies/get");
}

export async function saveTechnology(
  id: number | null,
  nome: string,
  image: ImagePickerAsset | null,
) {
  const body = image ? await fileForm("imagem", image, { nome }) : { nome };
  return request<Technology>(
    id === null ? "/technologies/create" : `/technologies/edit/${id}`,
    id === null ? "POST" : "PATCH",
    body,
  );
}

export function removeTechnology(id: number) {
  return request<void>(`/technologies/delete/${id}`, "DELETE");
}
