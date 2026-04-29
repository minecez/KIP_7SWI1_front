import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { buildAuthHeaders, loadAuthSession, normalizeUsersPayload, readJsonResponse, USERS_API_PATH } from '../../lib/api.ts'
import type { User } from '../../types.ts'

const USERS_PATH = '/users'

function Users() {
    const [usersData, setUsersData] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const columns = ['id', 'username', 'dateOfBirth', 'email', 'firstName', 'lastName', 'admin']

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const response = await fetch(USERS_API_PATH, {
                    headers: buildAuthHeaders(loadAuthSession()),
                })

                if (!response.ok) {
                    setErrorMessage(`Request failed with status ${response.status}`)
                    setUsersData([])
                    return
                }

                const data = await readJsonResponse<unknown>(response)
                setUsersData(normalizeUsersPayload(data))
            } catch (error) {
                let message = 'Unknown error'
                if (error instanceof SyntaxError) {
                    message = 'Invalid JSON response from server'
                } else if (error instanceof Error) {
                    message = error.message
                }
                setErrorMessage(message)
                setUsersData([])
            } finally {
                setIsLoading(false)
            }
        }

        void fetchUsers()
    }, [])

    return (
        <div className="page">
            <header className="page-header">
                <h1>App users</h1>
            </header>
            {errorMessage && <div className="error" style={{ marginBottom: '16px' }}>{errorMessage}</div>}
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column}>{column}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usersData.map((user) => ( // iterate over data
                                <TableRow key={user.id}>
                                    {columns.map((column) => (
                                        <TableCell key={`${user.id}-${column}`}>
                                            {column === 'id' ? (
                                                <Link to={`${USERS_PATH}/${user.id}`}>{user.id}</Link>
                                            ) : column === 'dateOfBirth' ? (
                                                user.dateOfBirth ?? '-'
                                            ) : column === 'admin' ? (
                                                user.admin ? 'true' : 'false'
                                            ) : (
                                                String(user[column as keyof User])
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    )
}

export default Users
