import { useCallback, useEffect, useRef, useState } from "react";

export function useLoad<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    // Somente a consulta mais recente pode atualizar a tela.
    const token = ++sequence.current;
    setLoading(true);
    setError("");
    try {
      const result = await loader();
      if (token === sequence.current) setData(result);
    } catch (e) {
      if (token === sequence.current)
        setError(e instanceof Error ? e.message : "Algo deu errado.");
    } finally {
      if (token === sequence.current) setLoading(false);
    }
  }, [loader]);
  const invalidate = useCallback(() => {
    sequence.current++;
  }, []);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void reload();
    });
    return () => {
      active = false;
      invalidate();
    };
  }, [reload, invalidate]);
  return { data, setData, error, loading, reload };
}
