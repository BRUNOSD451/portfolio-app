import { Platform } from "react-native";
import Constants from "expo-constants";

const host =
  Platform.OS === "web" && typeof window !== "undefined"
    ? window.location.hostname
    : Constants.expoConfig?.hostUri?.split(":")[0];
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  `http://${host || (Platform.OS === "android" ? "10.0.2.2" : "localhost")}:3000`
).replace(/\/$/, "");
const defaultUrl = new URL(API_URL);
defaultUrl.port = "8000";
defaultUrl.pathname = "";
export const AI_API_URL = (
  process.env.EXPO_PUBLIC_AI_API_URL || defaultUrl.origin
).replace(/\/$/, "");
