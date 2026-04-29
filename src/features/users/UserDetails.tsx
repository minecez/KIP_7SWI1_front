import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { User } from '../../types.ts'
import { buildAuthHeaders, loadAuthSession, readJsonResponse, USERS_API_PATH } from '../../lib/api.ts'

const USERS_PATH = '/users'

async function fetchUserById(userId: string): Promise<User> {
    const requestHeaders = buildAuthHeaders(loadAuthSession())
    const singleUserResponse = await fetch(`${USERS_API_PATH}/${userId}`, {
        headers: requestHeaders,
    })

    if (singleUserResponse.ok) {
        return await readJsonResponse<User>(singleUserResponse)
    }

    // Fallback for backends that only expose a collection endpoint.
    const usersResponse = await fetch(USERS_API_PATH, {
        headers: requestHeaders,
    })

    if (!usersResponse.ok) {
        throw new Error(`Request failed with status ${usersResponse.status}`)
    }

    const users = await readJsonResponse<User[]>(usersResponse)
    const matchingUser = users.find((user) => String(user.id) === userId)

    if (!matchingUser) {
        throw new Error('User not found')
    }

    return matchingUser
}

function UserDetails() {
    const { userId } = useParams()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (!userId) {
            setErrorMessage('Missing user id in route')
            setIsLoading(false)
            return
        }

        const loadUser = async () => {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const userData = await fetchUserById(userId)
                setUser(userData)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'
                setErrorMessage(message)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        void loadUser()
    }, [userId])

    return (
        <div className="page">
            <header className="page-header">
                <h1>App user details</h1>
                <p>
                    <Link to={USERS_PATH}>Back to app users list</Link>
                </p>
            </header>

            {isLoading ? <div>Loading...</div> : null}
            {errorMessage ? <div className="error">{errorMessage}</div> : null}

            {user && !isLoading && !errorMessage ? (
                <div>
                    <p>
                        <strong>ID:</strong> {user.id}
                    </p>
                    <p>
                        <strong>First name:</strong> {user.firstName}
                    </p>
                    <p>
                        <strong>Last name:</strong> {user.lastName}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                        <strong>Date of birth:</strong> {user.dateOfBirth ?? '-'}
                    </p>
                    <p>
                        <strong>Admin:</strong> {user.admin ? 'true' : 'false'}
                    </p>
                </div>
            ) : null}
        </div>
    )
}

export default UserDetails

