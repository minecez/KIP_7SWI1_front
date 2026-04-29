import type { AuthSession, LoginCredentials, User } from '../types.ts'

export const AUTH_STORAGE_KEY = 'kip-auth-session'
export const LOGIN_PATH = '/api/auth/login'
export const USERS_API_PATH = '/api/app_users'

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
    const rawText = await response.text()

    if (!rawText.trim()) {
        throw new Error('Invalid JSON response from server')
    }

    try {
        return JSON.parse(rawText) as T
    } catch {
        throw new Error('Invalid JSON response from server')
    }
}

function extractMessage(payload: unknown, fallbackMessage: string): string {
    if (typeof payload === 'string' && payload.trim()) {
        return payload
    }

    if (isRecord(payload)) {
        const message = payload.message ?? payload.error ?? payload.detail

        if (typeof message === 'string' && message.trim()) {
            return message
        }
    }

    return fallbackMessage
}

function normalizeUser(payload: unknown): User | null {
    if (!isRecord(payload)) {
        return null
    }

    const { id, username, dateOfBirth, email, firstName, lastName, admin } = payload

    if (
        typeof id !== 'string' ||
        typeof username !== 'string' ||
        (typeof dateOfBirth !== 'string' && dateOfBirth !== null && dateOfBirth !== undefined) ||
        typeof email !== 'string' ||
        typeof firstName !== 'string' ||
        typeof lastName !== 'string' ||
        typeof admin !== 'boolean'
    ) {
        return null
    }

    return {
        id,
        username,
        dateOfBirth: typeof dateOfBirth === 'string' ? dateOfBirth : null,
        email,
        firstName,
        lastName,
        admin,
    }
}

export function normalizeUsersPayload(payload: unknown): User[] {
    if (Array.isArray(payload)) {
        return payload.map(normalizeUser).filter((user): user is User => user !== null)
    }

    if (isRecord(payload)) {
        if (Array.isArray(payload.users)) {
            return payload.users.map(normalizeUser).filter((user): user is User => user !== null)
        }

        if (Array.isArray(payload.data)) {
            return payload.data.map(normalizeUser).filter((user): user is User => user !== null)
        }
    }

    return []
}

export function normalizeSingleUserPayload(payload: unknown): User | null {
    return normalizeUser(payload)
}

export function buildAuthHeaders(session: AuthSession | null): HeadersInit {
    if (!session?.accessToken) {
        return {}
    }

    return {
        Authorization: `Bearer ${session.accessToken}`,
    }
}

export function loadAuthSession(): AuthSession | null {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!rawValue) {
        return null
    }

    try {
        const parsedValue = JSON.parse(rawValue) as Partial<AuthSession>
        const user = normalizeUser(parsedValue.user)

        if (!user) {
            return null
        }

        return {
            user,
            accessToken: typeof parsedValue.accessToken === 'string' ? parsedValue.accessToken : undefined,
        }
    } catch {
        return null
    }
}

export function saveAuthSession(session: AuthSession): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY)
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await fetch(LOGIN_PATH, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    })

    const rawText = await response.text()
    const trimmedText = rawText.trim()
    const payload = trimmedText ? (() => {
        try {
            return JSON.parse(trimmedText) as unknown
        } catch {
            return trimmedText
        }
    })() : null

    if (!response.ok) {
        throw new Error(extractMessage(payload, `Login failed with status ${response.status}`))
    }

    const user = isRecord(payload)
        ? normalizeUser(payload.user) ?? normalizeUser(payload)
        : null

    if (!user) {
        throw new Error('Login response did not include a valid user')
    }

    const accessToken = isRecord(payload)
        ? payload.accessToken ?? payload.token
        : undefined

    return {
        user,
        accessToken: typeof accessToken === 'string' ? accessToken : undefined,
    }
}
