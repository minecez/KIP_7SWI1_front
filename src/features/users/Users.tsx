import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, TableSortLabel } from '@mui/material'
import { buildAuthHeaders, loadAuthSession, normalizeUsersPayload, readJsonResponse, USERS_API_PATH } from '../../lib/api.ts'
import type { User } from '../../types.ts'

const USERS_PATH = '/users'
type SortField = 'id' | 'username' | 'dateOfBirth' | 'email' | 'firstName' | 'lastName' | 'admin'
type SortDirection = 'asc' | 'desc'

function Users() {
    const [usersData, setUsersData] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortField, setSortField] = useState<SortField>('id')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    
    const currentUser = loadAuthSession()?.user

    const columns = ['id', 'username', 'dateOfBirth', 'email', 'firstName', 'lastName', 'admin']

    const filterUsers = (users: User[], term: string): User[] => {
        if (!term) return users
        const lowerTerm = term.toLowerCase()
        return users.filter((user) =>
            user.id.toLowerCase().includes(lowerTerm) ||
            user.username.toLowerCase().includes(lowerTerm) ||
            user.email.toLowerCase().includes(lowerTerm) ||
            user.firstName.toLowerCase().includes(lowerTerm) ||
            user.lastName.toLowerCase().includes(lowerTerm)
        )
    }

    const sortUsers = (users: User[], field: SortField, direction: SortDirection): User[] => {
        const sorted = [...users].sort((a, b) => {
            let aVal = a[field]
            let bVal = b[field]

            if (aVal == null) aVal = ''
            if (bVal == null) bVal = ''

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal)
            }
            if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                return aVal === bVal ? 0 : aVal ? 1 : -1
            }
            if (aVal < bVal) return -1
            if (aVal > bVal) return 1
            return 0
        })

        return direction === 'asc' ? sorted : sorted.reverse()
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const filteredAndSortedUsers = sortUsers(filterUsers(usersData, searchTerm), sortField, sortDirection)

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
            <TextField
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ marginBottom: '16px', width: '300px' }}
            />
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        backgroundColor: 'background.paper',
                        backgroundImage: 'none',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column}
                                        sx={{
                                            color: 'text.primary',
                                            fontWeight: 700,
                                            borderBottomColor: 'divider',
                                        }}
                                    >
                                        <TableSortLabel
                                            active={sortField === column}
                                            direction={sortField === column ? sortDirection : 'asc'}
                                            onClick={() => handleSort(column as SortField)}
                                        >
                                            {column}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAndSortedUsers.map((user) => (
                                <TableRow
                                    key={user.id}
                                    sx={{
                                        '&:nth-of-type(odd)': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                        },
                                    }}
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={`${user.id}-${column}`}
                                            sx={{
                                                color: 'text.primary',
                                                borderBottomColor: 'divider',
                                            }}
                                        >
                                            {column === 'id' ? (
                                                currentUser?.admin ? (
                                                    <Link to={`${USERS_PATH}/${user.id}`} style={{ color: 'inherit' }}>
                                                        {user.id}
                                                    </Link>
                                                ) : (
                                                    user.id
                                                )
                                            ) : column === 'dateOfBirth' ? (
                                                user.dateOfBirth == "1753-01-01" ?
                                                    "The Beginning of Time" :
                                                    (user.dateOfBirth ?? "-")
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
