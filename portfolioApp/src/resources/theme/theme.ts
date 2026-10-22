import { Platform } from "react-native";

export const fontFamily =
  Platform.OS === "web"
    ? "system-ui"
    : Platform.OS === "android"
      ? "sans-serif"
      : "System";
export const colors = {
  bg: "#101311",
  card: "#1B211D",
  line: "#303A32",
  text: "#F1F5EC",
  muted: "#9CA99E",
  accent: "#C3ED87",
  danger: "#FFACA0",
};
