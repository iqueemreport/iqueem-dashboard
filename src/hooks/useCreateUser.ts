import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      email,
      password,
      full_name,
    }: {
      email: string
      password: string
      full_name?: string
    }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.")

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      let res: Response
      try {
        res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: full_name?.trim() || null,
        }),
        signal: controller.signal,
        })
      } catch (err) {
        clearTimeout(timeoutId)
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error("İstek zaman aşımına uğradı. create-user fonksiyonu deploy edildi mi? Supabase Dashboard veya 'supabase functions deploy create-user' ile kontrol edin.")
        }
        throw err
      } finally {
        clearTimeout(timeoutId)
      }

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = json.error ?? (res.status === 404 ? "create-user fonksiyonu bulunamadı. Supabase'e deploy edin: supabase functions deploy create-user" : `Hata: ${res.status}`)
        throw new Error(msg)
      }
      return json
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] })
      toast.success("Kullanıcı oluşturuldu")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
