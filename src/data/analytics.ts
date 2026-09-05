const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY
const visitorKey = 'codyssey-analytics-visitor-id'
const sessionVisitKey = 'codyssey-analytics-session-recorded-v2'

let visitRequest: Promise<void> | null = null

function getVisitorId() {
  const existing = localStorage.getItem(visitorKey)
  if (existing) return existing
  const visitorId = crypto.randomUUID()
  localStorage.setItem(visitorKey, visitorId)
  return visitorId
}

async function recordEvent(eventType: 'visit' | 'profile_name', displayName?: string) {
  if (!supabaseUrl || !supabasePublishableKey) return
  const response = await fetch(`${supabaseUrl}/rest/v1/codyssey_events`, {
    method: 'POST',
    headers: {
      apikey: supabasePublishableKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      visitor_id: getVisitorId(),
      event_type: eventType,
      display_name: displayName,
    }),
  })
  if (!response.ok) throw new Error(`Analytics request failed with status ${response.status}`)
}

export function recordVisit() {
  if (!supabaseUrl || !supabasePublishableKey || sessionStorage.getItem(sessionVisitKey) === 'true' || visitRequest) return
  visitRequest = recordEvent('visit')
    .then(() => sessionStorage.setItem(sessionVisitKey, 'true'))
    .catch((error: unknown) => console.warn('Codyssey visit tracking failed.', error))
    .finally(() => { visitRequest = null })
}

export function recordVisitorName(name: string) {
  const displayName = name.trim().slice(0, 50)
  if (!displayName) return
  void recordEvent('profile_name', displayName)
    .catch((error: unknown) => console.warn('Codyssey name tracking failed.', error))
}
