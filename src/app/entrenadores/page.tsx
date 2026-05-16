import { getEntrenadores } from '@/lib/supabase/actions/entrenadores'
import { EntrenadoresClient } from './EntrenadoresClient'

export default async function EntrenadoresPage() {
  const result = await getEntrenadores()
  const entrenadores = result.success && result.data ? result.data : []

  return <EntrenadoresClient initialEntrenadores={entrenadores} />
}
