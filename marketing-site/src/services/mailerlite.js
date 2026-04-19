export async function upsertMailerLiteSubscriber(email, fields) {
    const body = { email }
    if (fields && typeof fields === 'object') body.fields = fields

    const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (response.ok) {
        return response.json().catch(() => null)
    }

    let message = 'Inschrijving mislukt. Probeer het later opnieuw.'

    if (response.status === 404) {
        message = 'Subscribe endpoint niet gevonden. Start lokaal met "npm run dev" (Netlify Dev).'
        throw new Error(message)
    }

    try {
        const errorData = await response.json()
        message = errorData?.message || message
    } catch {
        // Keep the generic fallback when no structured JSON body is available.
    }

    throw new Error(message)
}