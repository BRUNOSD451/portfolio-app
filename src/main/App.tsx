import { StatusBar } from "expo-status-bar";
import StackRoutes from "../resources/routes/stack.routes";
import { useEffect } from "react";
import { restoreSession } from "../resources/services/session";

export default function App() {
  useEffect(() => {
    void restoreSession();
  }, []);
  return (
    <>
      <StatusBar style="light" />
      <StackRoutes />
    </>
  );
}
