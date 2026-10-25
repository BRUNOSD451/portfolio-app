import { styles } from "../styles/styleProjects";
import { getProjects } from "../services/projectsService";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLoad } from "../../../resources/hooks/useLoad";
import {
  Screen,
  Card,
  Field,
  Button,
  Notice,
  Loading,
  Empty,
} from "../../../resources/components/ui/ui";
import { colors } from "../../../resources/theme/theme";
import { s } from "../../../resources/components/ui/styles/styleUI";

export default function ProjectsScreen() {
  const load = useLoad(useCallback(() => getProjects(), []));
  const { reload } = load;
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  const [query, setQuery] = useState("");
  const filtered = load.data?.filter((p) =>
    p.nome.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <Screen
      title="Seus projetos."
      subtitle="Um lugar para cuidar de tudo que você cria."
    >
      <Card>
        <Text style={s.eyebrow}>SEU TRABALHO EM DESTAQUE</Text>
        <View style={s.row}>
          <Text style={styles.count}>
            {load.data?.length.toString().padStart(2, "0") ?? "—"}
          </Text>
          <Text style={s.body}>projetos no seu{"\n"}portfólio</Text>
        </View>
        <Button
          label="Criar projeto"
          icon="add"
          onPress={() => router.push("/project")}
        />
      </Card>
      <Field
        label="ENCONTRE UM PROJETO"
        placeholder="Buscar pelo título…"
        value={query}
        onChangeText={setQuery}
      />
      <Notice text={load.error} error />
      {!!load.error && (
        <Button
          label="Tentar novamente"
          secondary
          onPress={() => void reload()}
        />
      )}
      {load.loading && !load.data && <Loading />}
      {filtered?.length === 0 && (
        <Empty
          title={query ? "Nenhum resultado" : "Seu próximo projeto começa aqui"}
          text={
            query
              ? "Tente buscar por outro título."
              : "Adicione o título, escolha as tecnologias e mostre seu trabalho com fotos e vídeos."
          }
        />
      )}
      {filtered?.map((p, index) => (
        <Pressable
          key={p.id}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${p.nome}`}
          onPress={() =>
            router.push({ pathname: "/project", params: { id: p.id } })
          }
        >
          <Card>
            <View style={s.row}>
              <Text style={[s.eyebrow, styles.grow]}>
                PROJETO {String(index + 1).padStart(2, "0")}
              </Text>
              <Ionicons name="arrow-forward" size={22} color={colors.accent} />
            </View>
            <Text style={s.heading}>{p.nome}</Text>
            <Text style={s.body} numberOfLines={3}>
              {p.descricao || "Sem descrição. Conte a história deste projeto."}
            </Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
