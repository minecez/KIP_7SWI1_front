import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

const USERS_PATH = '/users'

type UserRow = {
    admin: boolean
    dateOfBirth: string | null
    email: string
    firstName: string
    id: string
    lastName: string
    username: string
}

function Users() {
    const [usersData, setUsersData] = useState<UserRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const columns = ['id', 'username', 'dateOfBirth', 'email', 'firstName', 'lastName', 'admin']

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const response = await fetch('/api/users') // get data

                if (!response.ok) {
                    setErrorMessage(`Request failed with status ${response.status}`)
                    setUsersData([])
                    return
                }

                const data = await response.json() //save data
                setUsersData(Array.isArray(data) ? data : [data]) // save data to internal state
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
                <h1>Users</h1>
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
                                                String(user[column as keyof UserRow])
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
