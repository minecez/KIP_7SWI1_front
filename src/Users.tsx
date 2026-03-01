import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

function Users() {
    const usersData = [
        {
            age: 25,
            email: 'test@example.com',
            firstName: 'John',
            id: '2709a361-52c1-4a37-8944-91e23348d0f1',
            lastName: 'Doe',
            password: 'password123',
            username: 'testuser-72290167-a64d-4be1-ace5-9a19f2fedbc6',
        },
    ]

    const columns = ['id', 'firstName', 'lastName', 'email', 'username', 'age']

    return (
        <div className="page">
            <header className="page-header">
                <h1>Users</h1>
            </header>
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
                        {usersData.map((user) => (
                            <TableRow key={user.id}>
                                {columns.map((column) => (
                                    <TableCell key={`${user.id}-${column}`}>
                                        {String(user[column as keyof typeof user])}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default Users
