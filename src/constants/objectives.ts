import type { CampaignObjective } from "@/types"

export const CAMPAIGN_OBJECTIVES: { value: CampaignObjective; label: string }[] =
  [
    { value: "traffic", label: "Trafik" },
    { value: "branding", label: "Marka Bilinirliği" },
    { value: "conversion", label: "Dönüşüm" },
    { value: "awareness", label: "Farkındalık" },
    { value: "engagement", label: "Etkileşim" },
    { value: "retargeting", label: "Retargeting" },
  ]
