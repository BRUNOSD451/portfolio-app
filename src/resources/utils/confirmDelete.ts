import { Alert, Platform } from "react-native";

export function confirmDelete(label: string): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(window.confirm(label));
  return new Promise((resolve) =>
    Alert.alert(
      "Confirmar exclusão",
      label,
      [
        { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
        { text: "Excluir", style: "destructive", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
}
