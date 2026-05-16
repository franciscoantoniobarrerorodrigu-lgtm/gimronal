import { getClases } from '@/lib/supabase/actions/clases'
import { getEntrenadores } from '@/lib/supabase/actions/entrenadores'
import { ClasesClient } from './ClasesClient'

export default async function ClasesPage() {
  const [clasesResult, entrenadoresResult] = await Promise.all([
    getClases(),
    getEntrenadores()
  ])

  const clases = clasesResult.success && clasesResult.data ? clasesResult.data : []
  const entrenadores = entrenadoresResult.success && entrenadoresResult.data ? entrenadoresResult.data : []

  return <ClasesClient initialClases={clases} entrenadores={entrenadores} />
}
