import { GymLoading } from '@/components/shared/GymLoading'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <GymLoading message="Cargando Panel SaaS..." />
    </div>
  )
}
