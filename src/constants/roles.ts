import type { UserRole } from "@/types"

export const ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Yönetici" },
  { value: "specialist", label: "Uzman" },
]
