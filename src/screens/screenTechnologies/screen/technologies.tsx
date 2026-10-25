import { styles } from "../styles/styleTechnologies";
import {
  getTechnologies,
  saveTechnology,
  removeTechnology,
} from "../services/technologiesService";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import { type Technology } from "../../../resources/types/portfolioTypes";
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
  Photo,
  Loading,
  Empty,
} from "../../../resources/components/ui/ui";
import { s } from "../../../resources/components/ui/styles/styleUI";

export default function TechnologiesScreen() {
  const load = useLoad(useCallback(() => getTechnologies(), []));
  const [editing, setEditing] = useState<Technology | "new" | null>(null);
  const [nome, setNome] = useState("");
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const action = useAction();
  const open = (tech: Technology | "new") => {
    setEditing(tech);
    setNome(tech === "new" ? "" : tech.nome);
    setImage(null);
  };
  async function save() {
    if (!nome.trim()) throw new Error("Informe o nome da tecnologia.");
    if (editing === "new" && !image)
      throw new Error("Escolha uma imagem para a tecnologia.");
    if (!editing) return;
    await saveTechnology(
      editing === "new" ? null : editing.id,
      nome.trim(),
      image,
    );
    setEditing(null);
    setImage(null);
    await load.reload();
  }
  return (
    <Screen
      title="Sua stack."
      subtitle="As ferramentas que dão vida ao seu trabalho."
    >
      {editing ? (
        <Card>
          <Text style={s.eyebrow}>
            {editing === "new" ? "NOVA TECNOLOGIA" : "EDITAR TECNOLOGIA"}
          </Text>
          <View style={s.row}>
            <Photo
              uri={image?.uri || (editing !== "new" ? editing.imagem : null)}
            />
            <View style={styles.grow}>
              <Button
                label="Escolher imagem"
                secondary
                disabled={action.busy}
                onPress={() =>
                  void action.run(async () => {
                    const asset = await pickAsset();
                    if (asset) setImage(asset);
                  })
                }
              />
            </View>
          </View>
          <Field
            label="Nome"
            value={nome}
            onChangeText={setNome}
            maxLength={100}
            editable={!action.busy}
            placeholder="Ex.: React Native"
          />
          <Button
            label={action.busy ? "Salvando…" : "Salvar tecnologia"}
            disabled={action.busy}
            onPress={() => void action.run(save, "Tecnologia salva.")}
          />
          <Button
            label="Cancelar"
            secondary
            disabled={action.busy}
            onPress={() => setEditing(null)}
          />
        </Card>
      ) : (
        <Button
          label="Adicionar tecnologia"
          icon="add"
          onPress={() => open("new")}
          disabled={action.busy}
        />
      )}
      <Notice text={action.error || load.error} error />
      <Notice text={action.message} />
      <View style={s.row}>
        <Text style={[s.eyebrow, styles.grow]}>
          BIBLIOTECA / {load.data?.length ?? "—"}
        </Text>
        <Button
          label="Atualizar"
          secondary
          disabled={action.busy || load.loading}
          onPress={() => void load.reload()}
        />
      </View>
      {load.loading && !load.data && <Loading />}
      {load.data?.length === 0 && (
        <Empty
          title="Sua stack começa aqui"
          text="Adicione as tecnologias que você utiliza para vinculá-las aos seus projetos."
        />
      )}
      {load.data?.map((tech) => (
        <Card key={tech.id}>
          <View style={s.row}>
            <Photo uri={tech.imagem} size={52} />
            <Text style={[s.heading, styles.grow]}>{tech.nome}</Text>
          </View>
          <View style={s.row}>
            <View style={styles.grow}>
              <Button
                label="Editar"
                secondary
                icon="create-outline"
                disabled={action.busy}
                onPress={() => open(tech)}
              />
            </View>
            <Button
              label="Excluir"
              danger
              icon="trash-outline"
              disabled={action.busy}
              onPress={() =>
                void action.run(async () => {
                  if (!(await confirmDelete(`Excluir ${tech.nome}?`))) return;
                  await removeTechnology(tech.id);
                  if (editing !== "new" && editing?.id === tech.id)
                    setEditing(null);
                  await load.reload();
                })
              }
            />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
