import { request } from "../../../resources/services/apiController";
import type { Project } from "../../../resources/types/portfolioTypes";

export function getProjects() {
  return request<Project[]>("/projects/get");
}
