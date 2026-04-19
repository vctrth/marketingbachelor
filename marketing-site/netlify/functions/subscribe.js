const MAILERLITE_BASE_URL = 'https://connect.mailerlite.com/api'

const parseGroupIds = () => {
    const rawValue =
        process.env.MAILERLITE_GROUP_IDS ||
        process.env.MAILERLITE_GROUP_ID ||
        process.env.VITE_MAILERLITE_GROUP_IDS ||
        ''
    if (!rawValue) return []

    return rawValue
        .split(',')
        .map((groupId) => groupId.trim())
        .filter(Boolean)
}

const json = (statusCode, payload) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
})

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return json(405, { message: 'Method Not Allowed' })
    }

    const token = process.env.MAILERLITE_API_TOKEN || process.env.VITE_MAILERLITE_API_TOKEN
    if (!token) {
        return json(500, {
            message: 'Serverconfiguratie ontbreekt. Stel MAILERLITE_API_TOKEN in.',
        })
    }

    let email = ''
    try {
        const body = JSON.parse(event.body || '{}')
        email = String(body.email || '').trim().toLowerCase()
    } catch {
        return json(400, { message: 'Ongeldige request body.' })
    }

    if (!email) {
        return json(422, { message: 'E-mailadres is verplicht.' })
    }

    const payload = {
        email,
        status: 'active',
    }

    // Allow optional custom fields to be forwarded to MailerLite.
    // The client can include a `fields` object in the request body, e.g.
    // { email, fields: { first_name: '...', last_name: '...', role: '...', message: '...' } }
    try {
        const body = JSON.parse(event.body || '{}')
        const fields = body.fields
        if (fields && typeof fields === 'object' && Object.keys(fields).length > 0) {
            payload.fields = fields
        }
    } catch {
        // ignore parsing errors here since we already parsed body earlier for email
    }

    const groups = parseGroupIds()
    if (groups.length > 0) {
        payload.groups = groups
    }

    try {
        const response = await fetch(`${MAILERLITE_BASE_URL}/subscribers`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (response.ok) {
            return json(200, { message: 'Dank je voor je inschrijving! We nemen snel contact op.' })
        }

        let message = 'Inschrijving mislukt. Probeer het later opnieuw.'
        try {
            const errorData = await response.json()
            message = errorData?.message || message

            const emailErrors = errorData?.errors?.email
            if (Array.isArray(emailErrors) && emailErrors.length > 0) {
                message = emailErrors[0]
            }
        } catch {
            // Keep fallback message.
        }

        return json(response.status, { message })
    } catch {
        return json(502, { message: 'Mailservice tijdelijk onbereikbaar. Probeer later opnieuw.' })
    }
}
