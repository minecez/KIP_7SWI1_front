import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { User } from '../../types.ts'

const USERS_PATH = '/users'

async function fetchUserById(userId: string): Promise<User> {
    const singleUserResponse = await fetch(`/api/users/${userId}`)

    if (singleUserResponse.ok) {
        return (await singleUserResponse.json()) as User
    }

    // Fallback for backends that only expose a collection endpoint.
    const usersResponse = await fetch('/api/users')

    if (!usersResponse.ok) {
        throw new Error(`Request failed with status ${singleUserResponse.status}`)
    }

    const users = (await usersResponse.json()) as User[]
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
                <h1>User details</h1>
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

