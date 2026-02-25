import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

export function useInviteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ email, full_name }: { email: string; full_name?: string }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.")

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: email.trim(), full_name: full_name?.trim() || null }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? `Hata: ${res.status}`)
      return json
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] })
      toast.success("Davet e-postası gönderildi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
