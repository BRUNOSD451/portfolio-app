import { styles } from "../styles/styleProfile";
import {
  getProfile,
  saveProfile,
  uploadProfilePhoto,
  uploadResume,
  deleteResume,
  resumeUrl,
} from "../services/profileService";
import { useCallback, useState } from "react";
import { Linking, Text, View } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useLoad } from "../../../resources/hooks/useLoad";
import { useAction } from "../../../resources/hooks/useAction";
import { pickAsset } from "../../../resources/utils/pickAsset";
import {
  Screen,
  Card,
  Field,
  Button,
  Notice,
  Photo,
  Loading,
} from "../../../resources/components/ui/ui";
import { s } from "../../../resources/components/ui/styles/styleUI";

export default function ProfileScreen() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    idade: "",
    telefone: "",
    descricao: "",
  });
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [resume, setResume] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [removeResume, setRemoveResume] = useState(false);
  const action = useAction();
  const load = useLoad(
    useCallback(async () => {
      const user = await getProfile();
      setForm({
        nome: user.nome,
        email: user.email,
        idade: user.idade?.toString() || "",
        telefone: user.telefone || "",
        descricao: user.descricao || "",
      });
      return user;
    }, []),
  );
  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChangeText: (value: string) => setForm((f) => ({ ...f, [key]: value })),
    editable: !action.busy,
  });
  async function save() {
    if (!form.nome.trim() || !form.email.includes("@"))
      throw new Error("Preencha seu nome e um e-mail válido.");
    const idade = form.idade.trim() ? Number(form.idade) : null;
    if (idade !== null && (!Number.isInteger(idade) || idade < 0))
      throw new Error("Informe uma idade válida.");
    const saved = await saveProfile({
      id: 1,
      ...form,
      nome: form.nome.trim(),
      idade,
      telefone: form.telefone || null,
      descricao: form.descricao || null,
    });
    let current = saved;
    load.setData(current);
    if (image) {
      try {
        const result = await uploadProfilePhoto(image);
        current = { ...current, imageUrl: result.url };
        load.setData(current);
        setImage(null);
      } catch (e) {
        throw new Error(
          `Dados salvos, mas a foto não foi enviada. ${e instanceof Error ? e.message : ""} Tente salvar novamente.`,
        );
      }
    }
    try {
      if (resume) {
        const result = await uploadResume(resume);
        load.setData({ ...current, curriculo: result.url });
        setResume(null);
      } else if (removeResume) {
        await deleteResume();
        load.setData({ ...current, curriculo: null });
      }
      setRemoveResume(false);
    } catch (e) {
      throw new Error(
        `Dados salvos, mas o currículo não foi ${resume ? "enviado" : "removido"}. ${e instanceof Error ? e.message : ""} Tente salvar novamente.`,
      );
    }
  }
  async function chooseResume() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const selected = result.assets[0];
    if (!selected || !/\.pdf$/i.test(selected.name))
      throw new Error("Escolha um arquivo PDF.");
    if (selected.size !== undefined && selected.size > 5 * 1024 * 1024)
      throw new Error("O currículo deve ter até 5 MB.");
    setResume(selected);
    setRemoveResume(false);
  }
  const currentResume = resumeUrl(load.data?.curriculo);
  const resumeStatus = resume
    ? `${resume.name} selecionado. Salve para publicar.`
    : removeResume
      ? "O currículo será removido ao salvar."
      : currentResume
        ? "Currículo publicado no seu site."
        : "Nenhum currículo enviado.";
  return (
    <Screen
      title="Seu perfil."
      subtitle="Sua história, do seu jeito. Mantenha seu site atualizado."
    >
      {load.loading && !load.data ? (
        <Loading />
      ) : load.data ? (
        <>
          <Card>
            <View style={s.row}>
              <Photo uri={image?.uri || load.data.imageUrl} size={84} />
              <View style={styles.profileDetails}>
                <Text style={s.heading}>{form.nome || "Seu nome"}</Text>
                <Text style={s.body}>O rosto do seu portfólio</Text>
              </View>
            </View>
            <Button
              label="Trocar foto"
              secondary
              icon="camera-outline"
              disabled={action.busy}
              onPress={() =>
                void action.run(async () => {
                  const asset = await pickAsset();
                  if (asset) setImage(asset);
                })
              }
            />
            {image && (
              <Text style={s.body}>
                Nova foto selecionada. Salve para publicar.
              </Text>
            )}
          </Card>
          <Card>
            <Text style={s.eyebrow}>01 / APRESENTAÇÃO</Text>
            <Field label="Nome" maxLength={100} {...field("nome")} />
            <Field
              label="Sobre você"
              multiline
              placeholder="Conte um pouco sobre você e seu trabalho…"
              {...field("descricao")}
            />
          </Card>
          <Card>
            <Text style={s.eyebrow}>02 / CONTATO & DETALHES</Text>
            <Field
              label="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              maxLength={150}
              {...field("email")}
            />
            <Field
              label="Telefone"
              keyboardType="phone-pad"
              maxLength={20}
              {...field("telefone")}
            />
            <Field
              label="Idade"
              keyboardType="number-pad"
              {...field("idade")}
            />
          </Card>
          <Card>
            <Text style={s.eyebrow}>03 / CURRÍCULO</Text>
            <Text style={s.body}>{resumeStatus}</Text>
            <Button
              label={currentResume || resume ? "Trocar PDF" : "Enviar PDF"}
              secondary
              icon="document-attach-outline"
              disabled={action.busy}
              onPress={() => void action.run(chooseResume)}
            />
            {!!currentResume && !resume && !removeResume && (
              <>
                <Button
                  label="Abrir currículo atual"
                  secondary
                  icon="open-outline"
                  disabled={action.busy}
                  onPress={() =>
                    void action.run(() => Linking.openURL(currentResume))
                  }
                />
                <Button
                  label="Remover currículo"
                  danger
                  icon="trash-outline"
                  disabled={action.busy}
                  onPress={() => setRemoveResume(true)}
                />
              </>
            )}
            {(!!resume || removeResume) && (
              <Button
                label="Cancelar"
                secondary
                icon="close-outline"
                disabled={action.busy}
                onPress={() => {
                  setResume(null);
                  setRemoveResume(false);
                }}
              />
            )}
          </Card>
          <Notice text={action.error} error />
          <Notice text={action.message} />
          <Button
            label={action.busy ? "Salvando…" : "Salvar alterações"}
            icon="checkmark-outline"
            disabled={action.busy}
            onPress={() =>
              void action.run(save, "Perfil atualizado no seu site.")
            }
          />
        </>
      ) : null}
      <Notice text={load.error} error />
      {!!load.error && (
        <Button
          secondary
          label="Tentar novamente"
          onPress={() => void load.reload()}
        />
      )}
    </Screen>
  );
}
