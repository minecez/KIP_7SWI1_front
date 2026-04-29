import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom'
import './App.css'
import Login from './features/auth/Login.tsx'
import Users from './features/users/Users.tsx'
import UserDetails from './features/users/UserDetails.tsx'
import { buildAuthHeaders, clearAuthSession, loadAuthSession, login as performLogin, saveAuthSession } from './lib/api.ts'
import type { AuthSession, LoginCredentials } from './types.ts'

const USERS_PATH = '/users'
const LOGIN_PATH = '/login'

function App() {
    const [session, setSession] = useState<AuthSession | null>(() => loadAuthSession())
    const [responseText, setResponseText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [loginErrorMessage, setLoginErrorMessage] = useState('')

    const fetchTestApi = async () => {
        setIsLoading(true)
        setErrorMessage('')

        try {
            const response = await fetch('/api/test', {
                headers: buildAuthHeaders(session),
            })

            if (!response.ok) {
                setErrorMessage(`Request failed with status ${response.status}`)
                setResponseText('')
                return
            }

            const text = await response.text()
            setResponseText(text)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            setErrorMessage(message)
            setResponseText('')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void fetchTestApi()
    }, [session])

    const handleLogin = async (credentials: LoginCredentials) => {
        setIsLoggingIn(true)
        setLoginErrorMessage('')

        try {
            const nextSession = await performLogin(credentials)
            saveAuthSession(nextSession)
            setSession(nextSession)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            setLoginErrorMessage(message)
        } finally {
            setIsLoggingIn(false)
        }
    }

    const handleLogout = () => {
        clearAuthSession()
        setSession(null)
        setLoginErrorMessage('')
        setErrorMessage('')
        setResponseText('')
    }

    const apiTestPage = (
        <div className="page">
            <header className="page-header">
                <h1>API Test</h1>
                <p>GET /api/test</p>
            </header>
            <div className="controls">
                <button type="button" onClick={fetchTestApi} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Refresh'}
                </button>
                {errorMessage ? <span className="error">{errorMessage}</span> : null}
            </div>
            <label className="textbox-label" htmlFor="api-response">
                Response
            </label>
            <textarea
                id="api-response"
                className="textbox"
                value={responseText}
                readOnly
                rows={10}
                placeholder={isLoading ? 'Loading response...' : 'No response yet.'}
            />
        </div>
    )

    return (
        <BrowserRouter>
            <nav className="app-nav">
                <div className="nav-links">
                    <Link to="/">API Test</Link>
                    <Link to={USERS_PATH}>App users</Link>
                </div>
                <div className="nav-actions">
                    {session ? (
                        <>
                            <span className="nav-user">Signed in as {session.user.username}</span>
                            <button type="button" className="nav-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to={LOGIN_PATH}>Login</Link>
                    )}
                </div>
            </nav>
            <Routes>
                <Route
                    path={LOGIN_PATH}
                    element={session ? <Navigate to="/" replace /> : <Login errorMessage={loginErrorMessage} isLoading={isLoggingIn} onSubmit={handleLogin} />}
                />
                <Route path="/" element={session ? apiTestPage : <Navigate to={LOGIN_PATH} replace />} />
                <Route path={USERS_PATH} element={session ? <Users /> : <Navigate to={LOGIN_PATH} replace />} />
                <Route
                    path={`${USERS_PATH}/:userId`}
                    element={session ? <UserDetails /> : <Navigate to={LOGIN_PATH} replace />}
                />
                <Route path="*" element={<Navigate to={session ? '/' : LOGIN_PATH} replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
