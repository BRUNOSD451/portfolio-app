import { StyleSheet } from "react-native";
import { colors } from "../../../resources/theme/theme";

export const styles = StyleSheet.create({
  grow: { flex: 1 },
  selectedChip: { borderColor: colors.accent, backgroundColor: "#2E3C27" },
  technologyLabel: { color: colors.text },
  selectedTechnologyLabel: { color: colors.accent },
});
