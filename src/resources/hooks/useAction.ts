import { useRef, useState } from "react";

export function useAction() {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function run(action: () => Promise<void>, success = "") {
    // A trava é imediata, antes do próximo render, para impedir envios duplicados.
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await action();
      setMessage(success);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível concluir.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, message, error, run };
}
