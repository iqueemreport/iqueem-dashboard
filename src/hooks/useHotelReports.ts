import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, getSupabaseConfig } from "@/lib/supabase/client"
import type { HotelReport } from "@/types"
import { toast } from "sonner"

export async function getReportViewUrl(fileUrl: string): Promise<string> {
  if (fileUrl.startsWith("http")) return fileUrl
  const { data } = await supabase.storage
    .from("reports")
    .createSignedUrl(fileUrl, 3600)
  return data?.signedUrl ?? fileUrl
}

interface ReportFilters {
  hotel_id?: string
  period_month?: string
}

export function useHotelReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["hotel-reports", filters],
    queryFn: async () => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)
      let q = supabase
        .from("hotel_reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (filters.hotel_id) q = q.eq("hotel_id", filters.hotel_id)
      if (filters.period_month) q = q.eq("period_month", filters.period_month)

      const { data, error } = await q
      if (error) throw error
      return data as HotelReport[]
    },
  })
}

export function useUploadReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotel_id,
      title,
      period_month,
      file,
      uploaded_by,
    }: {
      hotel_id: string
      title: string
      period_month: string
      file: File
      uploaded_by: string
    }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)

      const fileName = `${hotel_id}/${period_month}-${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(fileName, file, { upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const { data, error } = await supabase
        .from("hotel_reports")
        .insert({
          hotel_id,
          title,
          period_month,
          file_url: fileName,
          file_name: file.name,
          uploaded_by,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as HotelReport
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotel-reports"] })
      toast.success("Rapor yüklendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      hotel_id,
      title,
      period_month,
      file,
    }: {
      id: string
      hotel_id: string
      title: string
      period_month: string
      file?: File | null
    }) => {
      const config = getSupabaseConfig()
      if (!config.ok) throw new Error(config.error)

      let fileUrl: string | undefined
      let fileName: string | undefined

      if (file) {
        const newFileName = `${hotel_id}/${period_month}-${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from("reports")
          .upload(newFileName, file, { upsert: false })
        if (uploadError) throw new Error(uploadError.message)
        fileUrl = newFileName
        fileName = file.name
      }

      const updates: Record<string, unknown> = { hotel_id, title, period_month }
      if (fileUrl != null) updates.file_url = fileUrl
      if (fileName != null) updates.file_name = fileName

      const { data, error } = await supabase
        .from("hotel_reports")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as HotelReport
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotel-reports"] })
      toast.success("Rapor güncellendi")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
