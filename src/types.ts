export interface User {
    id: string
    username: string
    dateOfBirth: string | null
    email: string
    firstName: string
    lastName: string
    admin: boolean
}

export interface LoginCredentials {
    username: string
    password: string
}

export interface AuthSession {
    user: User
    accessToken?: string
}
