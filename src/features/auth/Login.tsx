import { useState, type FormEvent } from 'react'
import type { LoginCredentials } from '../../types.ts'

interface LoginProps {
    errorMessage: string
    isLoading: boolean
    onSubmit: (credentials: LoginCredentials) => Promise<void>
}

function Login({ errorMessage, isLoading, onSubmit }: LoginProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [localError, setLocalError] = useState('')

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLocalError('')

        if (!username.trim() || !password.trim()) {
            setLocalError('Please enter both username and password.')
            return
        }

        try {
            await onSubmit({
                username: username.trim(),
                password,
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            setLocalError(message)
        }
    }

    return (
        <div className="page auth-page">
            <header className="page-header">
                <h1>Login</h1>
                <p>Sign in to access the API Test page and the app users area.</p>
            </header>

            <form className="auth-form" onSubmit={handleSubmit}>
                <label className="field" htmlFor="username">
                    Username
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="username"
                        placeholder="Enter your username"
                    />
                </label>

                <label className="field" htmlFor="password">
                    Password
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                    />
                </label>

                {localError ? <div className="error">{localError}</div> : null}
                {!localError && errorMessage ? <div className="error">{errorMessage}</div> : null}

                <div className="controls">
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login



