import type { ImagePickerAsset } from "expo-image-picker";
import { request } from "../../../resources/services/apiController";
import { fileForm } from "../../../resources/utils/fileForm";
import type {
  Project,
  ProjectDetail,
  Media,
} from "../../../resources/types/portfolioTypes";

export function getProjectDetail(id: string | number) {
  return request<ProjectDetail>(`/projects/get/${id}`);
}

export function saveProject(
  id: number | null,
  data: { nome: string; descricao: string | null; tecnologias: number[] },
) {
  return request<Project>(
    id ? `/projects/edit/${id}` : "/projects/create",
    id ? "PATCH" : "POST",
    data,
  );
}

export async function addProjectMedia(
  id: number,
  asset: ImagePickerAsset,
  ordem: number,
) {
  return request<Media>(
    `/projects/${id}/media/create`,
    "POST",
    await fileForm("arquivo", asset, { ordem: String(ordem) }),
  );
}

export function removeProjectMedia(id: number, mediaId: number) {
  return request<void>(`/projects/${id}/media/delete/${mediaId}`, "DELETE");
}

export function removeProject(id: number) {
  return request<void>(`/projects/delete/${id}`, "DELETE");
}
