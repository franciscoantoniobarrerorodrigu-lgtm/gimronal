import { redirect } from 'next/navigation'
import { getClientSessionInfo } from '@/lib/supabase/actions/portal'
import ForcePasswordChange from './ForcePasswordChange'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PortalLayoutContent>{children}</PortalLayoutContent>
}

async function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const session = await getClientSessionInfo()

  if (!session) {
    redirect('/login?tab=socio')
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#050505] text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-95"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(140deg, rgba(255,90,0,0.16) 0%, rgba(255,90,0,0.03) 25%, rgba(5,5,5,0) 50%), radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.08), rgba(5,5,5,0) 48%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))',
        }}
      />


      <div className="relative z-10 flex flex-1 flex-col">
        {session.requiresPasswordChange ? <ForcePasswordChange /> : children}
      </div>
    </div>
  )
}
