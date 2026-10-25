import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { colors, fontFamily } from "../../theme/theme";
import { s } from "./styles/styleUI";
import { useSession } from "../../hooks/useSession";
import { useAction } from "../../hooks/useAction";
import { signOut } from "../../services/session";
export function Screen({
  title,
  eyebrow = "PORTFOLIO / STUDIO",
  subtitle,
  children,
  back,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: ReactNode;
  back?: () => void;
}) {
  const { session } = useSession();
  const logout = useAction();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.page}
        >
          <View style={s.row}>
            {back && (
              <Pressable
                accessibilityLabel="Voltar"
                onPress={back}
                style={s.icon}
              >
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </Pressable>
            )}
            <Text style={s.eyebrow}>{eyebrow}</Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="planet-outline" color={colors.accent} size={25} />
          </View>
          <Text style={s.title}>{title}</Text>
          {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
          {session && (
            <Button
              label={logout.busy ? "Saindo…" : "Sair da conta"}
              secondary
              onPress={() => void logout.run(signOut)}
              disabled={logout.busy}
            />
          )}
          <Notice text={logout.error} error />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Card({ children }: { children: ReactNode }) {
  return <View style={s.card}>{children}</View>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#69786E"
        selectionColor={colors.accent}
        style={[
          s.input,
          props.multiline && { minHeight: 120, textAlignVertical: "top" },
        ]}
        {...props}
      />
    </View>
  );
}
export function Button({
  label,
  onPress,
  secondary,
  danger,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const color = danger ? colors.danger : secondary ? colors.text : colors.bg;
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: secondary || danger ? colors.card : colors.accent,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
          borderWidth: secondary || danger ? 1 : 0,
          borderColor: colors.line,
        },
      ]}
    >
      {!!icon && <Ionicons name={icon} size={18} color={color} />}
      <Text style={{ color, fontWeight: "700", fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}
export function Notice({ text, error }: { text?: string; error?: boolean }) {
  return text ? (
    <View
      accessibilityLiveRegion="polite"
      style={[s.notice, error && { borderColor: "#70483F" }]}
    >
      <Text
        style={{
          fontFamily,
          color: error ? colors.danger : colors.accent,
          lineHeight: 21,
        }}
      >
        {text}
      </Text>
    </View>
  ) : null;
}
export function Loading() {
  return <ActivityIndicator style={{ margin: 32 }} color={colors.accent} />;
}
export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <Ionicons name="albums-outline" color={colors.accent} size={32} />
      <Text style={s.heading}>{title}</Text>
      <Text style={s.body}>{text}</Text>
    </Card>
  );
}
export function Photo({
  uri,
  size = 64,
}: {
  uri?: string | null;
  size?: number;
}) {
  return uri ? (
    <Image
      source={{ uri }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: colors.line,
      }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="image-outline" size={size / 3} color={colors.muted} />
    </View>
  );
}
function Video({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return (
    <VideoView
      player={player}
      style={s.preview}
      nativeControls
      contentFit="contain"
    />
  );
}
export function Preview({ uri, video }: { uri: string; video?: boolean }) {
  return video ? (
    <Video uri={uri} />
  ) : (
    <Image source={{ uri }} style={s.preview} resizeMode="contain" />
  );
}
