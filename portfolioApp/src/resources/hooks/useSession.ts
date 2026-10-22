import { useSyncExternalStore } from "react";
import { getAuthState, subscribeAuth } from "../services/session";

export function useSession() {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState);
}
