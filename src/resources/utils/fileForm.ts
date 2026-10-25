import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";

export async function fileForm(
  field: string,
  asset: ImagePickerAsset,
  values: Record<string, string> = {},
) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.append(key, value);
  const name =
    asset.fileName || `arquivo.${asset.type === "video" ? "mp4" : "jpg"}`;
  const type =
    asset.mimeType || (asset.type === "video" ? "video/mp4" : "image/jpeg");
  if (Platform.OS === "web") {
    const blob = await (await fetch(asset.uri)).blob();
    form.append(field, blob, name);
  } else form.append(field, { uri: asset.uri, name, type } as unknown as Blob);
  return form;
}
