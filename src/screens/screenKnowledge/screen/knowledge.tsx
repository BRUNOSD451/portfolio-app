import { styles } from "../styles/styleKnowledge";
import { useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import {
  Button,
  Card,
  Notice,
  Screen,
} from "../../../resources/components/ui/ui";
import { colors } from "../../../resources/theme/theme";
import { s } from "../../../resources/components/ui/styles/styleUI";
import {
  getKnowledgeStatus,
  uploadKnowledge,
} from "../services/knowledgeService";
import { type KnowledgeStatus } from "../types/knowledgeTypes";

export default function KnowledgeScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [status, setStatus] = useState<"ready" | "sending" | "done">("ready");
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<KnowledgeStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const busy = useRef(false);
  const picking = useRef(false);

  async function chooseFile() {
    if (picking.current || status === "sending") return;
    picking.current = true;
    setError("");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/plain",
        multiple: false,
        copyToCacheDirectory: true,
        base64: false,
      });
      if (result.canceled) return;
      const selected = result.assets[0];
      if (!selected || !/\.txt$/i.test(selected.name)) {
        setError("Escolha um arquivo com a extensão .txt.");
        return;
      }
      if (selected.size === 0) {
        setError(
          "O arquivo está vazio. Adicione seu texto antes de selecionar.",
        );
        return;
      }
      if (selected.size !== undefined && selected.size > 256 * 1024) {
        setError("O arquivo deve ter no máximo 256 KB.");
        return;
      }
      setFile(selected);
      setStatus("ready");
    } catch {
      setError("Não foi possível selecionar o arquivo. Tente novamente.");
    } finally {
      picking.current = false;
    }
  }

  async function sendFile() {
    if (!file || status !== "ready" || busy.current) return;
    busy.current = true;
    setError("");
    setStatus("sending");
    try {
      setCurrent(await uploadKnowledge(file));
      setStatus("done");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o arquivo.",
      );
      setStatus("ready");
    } finally {
      busy.current = false;
    }
  }

  async function checkStatus() {
    if (busy.current) return;
    busy.current = true;
    setChecking(true);
    setError("");
    try {
      setCurrent(await getKnowledgeStatus());
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar a base.",
      );
    } finally {
      busy.current = false;
      setChecking(false);
    }
  }

  return (
    <Screen
      title="Sua história."
      subtitle="Reúna o que a IA precisa conhecer sobre você."
    >
      <Notice text="O conteúdo enviado será usado nas respostas públicas da IA. Um novo arquivo substitui a base anterior somente após o processamento concluir." />
      <Card>
        <Text style={s.heading}>Gerenciar base</Text>
        <Button
          label={checking ? "Consultando…" : "Consultar base atual"}
          secondary
          disabled={checking || status === "sending"}
          onPress={() => void checkStatus()}
        />
        {current && (
          <Text style={s.body}>
            {current.ready
              ? `Base ativa: ${current.filename}\n${current.chunk_count} trechos · Atualizada em ${new Date(current.indexed_at!).toLocaleString("pt-BR")}`
              : "Nenhuma base enviada ainda."}
          </Text>
        )}
      </Card>
      <Card>
        <Text style={s.eyebrow}>BASE DE CONHECIMENTO</Text>
        <Ionicons
          name="document-text-outline"
          size={40}
          color={colors.accent}
        />
        <Text style={s.heading}>Conte sua trajetória</Text>
        <Text style={s.body}>
          Prepare um arquivo TXT com sua formação, experiências profissionais,
          habilidades e histórias dos seus projetos.
        </Text>
        <Button
          label={file ? "Trocar arquivo TXT" : "Selecionar arquivo TXT"}
          icon="attach-outline"
          secondary
          disabled={status === "sending"}
          onPress={() => void chooseFile()}
        />
        <Text style={s.label}>
          TXT em UTF-8 · até 256 KB · um arquivo por vez
        </Text>
      </Card>

      <Notice text={error} error />

      {file && (
        <Card>
          <Text style={s.eyebrow}>ARQUIVO SELECIONADO</Text>
          <View style={s.row}>
            <Ionicons name="document-outline" size={28} color={colors.accent} />
            <View style={styles.fileDetails}>
              <Text style={s.heading}>{file.name}</Text>
              <Text style={s.body}>
                {file.size === undefined
                  ? "Tamanho não informado"
                  : `${(file.size / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB`}
              </Text>
            </View>
          </View>
          {status === "sending" && (
            <View style={s.row} accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.accent} />
              <Text style={s.body}>
                Enviando e preparando a base… Aguarde nesta tela.
              </Text>
            </View>
          )}
          {status === "done" && (
            <Notice
              text={
                current?.unchanged
                  ? "Este conteúdo já está na base. Não foi necessário processar novamente."
                  : "Base atualizada! A IA já pode consultar o conteúdo enviado."
              }
            />
          )}
          <Button
            label={
              status === "done"
                ? "Base atualizada"
                : "Enviar base de conhecimento"
            }
            icon="cloud-upload-outline"
            disabled={status !== "ready" || checking}
            onPress={() => void sendFile()}
          />
          <Button
            label="Remover seleção"
            secondary
            disabled={status === "sending"}
            onPress={() => {
              setFile(null);
              setStatus("ready");
              setError("");
            }}
          />
        </Card>
      )}

      <Card>
        <Text style={s.heading}>O que incluir no texto?</Text>
        <Text style={s.body}>
          Apresentação pessoal, cursos e formação, empresas e cargos, desafios
          que você resolveu e seus objetivos profissionais. Organize por assunto
          e inclua datas para contextualizar sua trajetória.
        </Text>
      </Card>
    </Screen>
  );
}
