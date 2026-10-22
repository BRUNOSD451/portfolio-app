import { styles } from "../styles/styleProject";
import type { Media } from "../../../resources/types/portfolioTypes";
import { getTechnologies } from "../../screenTechnologies/services/technologiesService";
import { getProjects } from "../../screenProjects/services/projectsService";
import {
  getProjectDetail,
  saveProject,
  addProjectMedia,
  removeProjectMedia,
  removeProject,
} from "../services/projectService";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { ImagePickerAsset } from "expo-image-picker";
import { useLoad } from "../../../resources/hooks/useLoad";
import { useAction } from "../../../resources/hooks/useAction";
import { pickAsset } from "../../../resources/utils/pickAsset";
import { confirmDelete } from "../../../resources/utils/confirmDelete";
import {
  Screen,
  Card,
  Field,
  Button,
  Notice,
  Preview,
  Photo,
  Loading,
} from "../../../resources/components/ui/ui";
import { s } from "../../../resources/components/ui/styles/styleUI";

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [id, setId] = useState<number | null>(
    params.id ? Number(params.id) : null,
  );
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [asset, setAsset] = useState<ImagePickerAsset | null>(null);
  const [ordem, setOrdem] = useState("0");
  const [dirty, setDirty] = useState(false);
  const action = useAction();
  const load = useLoad(
    useCallback(async () => {
      const technologies = await getTechnologies();
      if (!params.id) return { technologies, project: null, detail: null };
      // A listagem fornece a descrição; os detalhes fornecem mídias e nomes das tecnologias.
      const [projects, detail] = await Promise.all([
        getProjects(),
        getProjectDetail(params.id),
      ]);
      const project = projects.find((p) => p.id === Number(params.id));
      if (!project) throw new Error("Projeto não encontrado.");
      setId(project.id);
      setNome(project.nome);
      setDescricao(project.descricao || "");
      setMedia(detail.midias);
      const names = new Set(detail.tecnologias.map((t) => t.nome));
      setSelected(
        technologies.filter((t) => names.has(t.nome)).map((t) => t.id),
      );
      setOrdem(
        String(Math.max(-1, ...detail.midias.map((m) => m.ordem ?? 0)) + 1),
      );
      return { technologies, project, detail };
    }, [params.id]),
  );
  async function save() {
    if (!nome.trim()) throw new Error("Informe o título do projeto.");
    const result = await saveProject(id, {
      nome: nome.trim(),
      descricao: descricao || null,
      tecnologias: selected,
    });
    setId(result.id);
    setDirty(false);
  }
  async function sendMedia() {
    if (!id || !asset) return;
    const order = Number(ordem);
    if (
      !ordem.trim() ||
      !Number.isInteger(order) ||
      order < 0 ||
      order > 2147483647
    )
      throw new Error("Informe uma ordem inteira a partir de zero.");
    const result = await addProjectMedia(id, asset, order);
    setMedia((list) =>
      [...list, result].sort(
        (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id,
      ),
    );
    setAsset(null);
    setOrdem(String(order + 1));
  }
  function back() {
    if (action.busy) return;
    if (!dirty && !asset) {
      router.back();
      return;
    }
    void action.run(async () => {
      if (
        await confirmDelete("Sair e descartar as alterações ainda não salvas?")
      )
        router.back();
    });
  }
  return (
    <Screen
      title={id ? "Edite sua criação." : "Uma nova ideia."}
      subtitle="Transforme seu trabalho em uma boa história."
      back={back}
    >
      {load.loading && !load.data && <Loading />}
      <Notice text={load.error} error />
      {!!load.error && (
        <Button
          label="Tentar novamente"
          secondary
          onPress={() => void load.reload()}
        />
      )}
      {load.data && (
        <>
          <Card>
            <Text style={s.eyebrow}>01 / O PROJETO</Text>
            <Field
              label="Título"
              value={nome}
              maxLength={150}
              editable={!action.busy}
              onChangeText={(v) => {
                setNome(v);
                setDirty(true);
              }}
              placeholder="Como se chama seu projeto?"
            />
            <Field
              label="Descrição"
              multiline
              value={descricao}
              editable={!action.busy}
              onChangeText={(v) => {
                setDescricao(v);
                setDirty(true);
              }}
              placeholder="O que você construiu? Qual problema resolveu?"
            />
          </Card>
          <Card>
            <Text style={s.eyebrow}>02 / TECNOLOGIAS</Text>
            <Text style={s.body}>Selecione as ferramentas utilizadas.</Text>
            <View style={s.wrap}>
              {load.data.technologies.map((t) => (
                <Pressable
                  key={t.id}
                  accessibilityRole="checkbox"
                  accessibilityLabel={t.nome}
                  aria-checked={selected.includes(t.id)}
                  accessibilityState={{ checked: selected.includes(t.id) }}
                  disabled={action.busy}
                  onPress={() => {
                    setSelected((ids) =>
                      ids.includes(t.id)
                        ? ids.filter((i) => i !== t.id)
                        : [...ids, t.id],
                    );
                    setDirty(true);
                  }}
                  style={[
                    s.chip,
                    selected.includes(t.id) && styles.selectedChip,
                  ]}
                >
                  <View style={s.row}>
                    <Photo uri={t.imagem} size={24} />
                    <Text
                      style={[
                        styles.technologyLabel,
                        selected.includes(t.id) &&
                          styles.selectedTechnologyLabel,
                      ]}
                    >
                      {t.nome}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
            {!load.data.technologies.length && (
              <Text style={s.body}>
                Cadastre suas tecnologias na aba Tecnologias. Você também pode
                salvar o projeto sem vínculos.
              </Text>
            )}
          </Card>
          <Notice text={action.error} error />
          <Notice text={action.message} />
          <Button
            label={
              action.busy ? "Aguarde…" : id ? "Salvar projeto" : "Criar projeto"
            }
            icon="checkmark-outline"
            disabled={action.busy}
            onPress={() =>
              void action.run(
                save,
                "Projeto salvo. Você já pode gerenciar suas mídias abaixo.",
              )
            }
          />
          <Card>
            <Text style={s.eyebrow}>03 / IMAGENS & VÍDEOS</Text>
            <Text style={s.body}>
              {id
                ? "Adicione uma mídia por vez, na ordem em que deseja apresentá-la. Até 50 MB por arquivo."
                : "Salve o projeto para adicionar suas imagens e vídeos."}
            </Text>
            {id !== null && (
              <>
                <Button
                  label="Escolher foto ou vídeo"
                  icon="cloud-upload-outline"
                  secondary
                  disabled={action.busy}
                  onPress={() =>
                    void action.run(async () => {
                      const picked = await pickAsset(true);
                      if (picked) setAsset(picked);
                    })
                  }
                />
                {asset && (
                  <>
                    <Preview uri={asset.uri} video={asset.type === "video"} />
                    <Field
                      label="Ordem de exibição"
                      keyboardType="number-pad"
                      value={ordem}
                      onChangeText={setOrdem}
                      editable={!action.busy}
                    />
                    <Button
                      label={action.busy ? "Enviando…" : "Enviar mídia"}
                      disabled={action.busy}
                      onPress={() =>
                        void action.run(
                          sendMedia,
                          "Mídia adicionada ao projeto.",
                        )
                      }
                    />
                    <Button
                      label="Cancelar seleção"
                      secondary
                      disabled={action.busy}
                      onPress={() => setAsset(null)}
                    />
                  </>
                )}
              </>
            )}
          </Card>
          {media.map((m) => (
            <Card key={m.id}>
              <Preview uri={m.url} video={m.tipo === "video"} />
              <View style={s.row}>
                <Text style={[s.body, styles.grow]}>
                  {m.tipo === "video" ? "Vídeo" : "Imagem"} · ordem{" "}
                  {m.ordem ?? 0}
                </Text>
                <Button
                  label="Excluir mídia"
                  danger
                  disabled={action.busy}
                  onPress={() =>
                    void action.run(async () => {
                      if (
                        !(await confirmDelete("Remover esta mídia do projeto?"))
                      )
                        return;
                      await removeProjectMedia(id!, m.id);
                      setMedia((items) =>
                        items.filter((item) => item.id !== m.id),
                      );
                    })
                  }
                />
              </View>
            </Card>
          ))}
          {id !== null && (
            <Button
              label="Excluir projeto"
              danger
              icon="trash-outline"
              disabled={action.busy}
              onPress={() =>
                void action.run(async () => {
                  if (
                    !(await confirmDelete(
                      `Excluir ${nome} e todas as suas mídias do portfólio?`,
                    ))
                  )
                    return;
                  await removeProject(id!);
                  setDirty(false);
                  router.back();
                })
              }
            />
          )}
        </>
      )}
    </Screen>
  );
}
