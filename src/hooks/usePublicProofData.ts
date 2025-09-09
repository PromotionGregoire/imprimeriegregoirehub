import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePublicProofData(token?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        // Préférer invoke pour la cohérence
        const { data, error } = await supabase.functions.invoke("get-proof-by-token", {
          body: { token },
        });
        if (error) throw error;
        if (mounted) setData(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Erreur de chargement");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  return { data, loading, error, isLoading: loading };
}