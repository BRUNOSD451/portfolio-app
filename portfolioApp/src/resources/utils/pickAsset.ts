import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

export async function pickAsset(video = false) {
  if (Platform.OS === "ios" && video) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      throw new Error(
        "Permita o acesso à galeria nas configurações do celular.",
      );
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: video ? ["images", "videos"] : ["images"],
    quality: 1,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const limit = (video ? 50 : 5) * 1024 * 1024;
  if (asset.fileSize && asset.fileSize > limit)
    throw new Error(`Escolha um arquivo de até ${video ? 50 : 5} MB.`);
  return asset;
}
