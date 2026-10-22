export type User = {
  id: number;
  nome: string;
  email: string;
  idade: number | null;
  telefone: string | null;
  curriculo: string | null;
  descricao: string | null;
  imageUrl: string | null;
};
export type Technology = { id: number; nome: string; imagem: string | null };
export type Project = { id: number; nome: string; descricao: string | null };
export type Media = {
  id: number;
  url: string;
  tipo: "imagem" | "video";
  ordem: number | null;
};
export type ProjectDetail = {
  nome: string;
  tecnologias: { nome: string; imagem: string | null }[];
  midias: Media[];
};
