import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
    Container,
    Typography,
    Box,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(''); // Clear previous errors
            const response = await axiosInstance.get('/api/admin/get-all');
            if (response.data && response.data.isSuccess && Array.isArray(response.data.result)) {
                setUsers(response.data.result);
            } else {
                setError(response.data.errorMessages?.join(', ') || 'Received invalid data format from server.');
            }
        } catch (err) {
            setError('Failed to fetch users. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleLock = async (userId) => {
        try {
            // Using POST and the new endpoint structure from the API list
            const response = await axiosInstance.post(`/api/admin/lock-unlock/${userId}`);
            if (response.data.isSuccess) {
                fetchUsers(); // Refresh list to show updated status
            } else {
                setError(response.data.errorMessages?.join(', ') || 'An unknown error occurred.');
            }
        } catch (err) {
            setError('Failed to update user status.');
            console.error(err);
        }
    };
    
    const handleConfirmAccount = async (userId) => {
        try {
            // Some APIs require an empty object as body for PUT
            const response = await axiosInstance.put(`/api/admin/confirm-user/${userId}`, {}, { params: { status: 'ACTIVE' } });
            if (response.data && response.data.isSuccess) {
                fetchUsers();
            } else {
                setError(response.data?.errorMessages?.join(', ') || JSON.stringify(response.data) || 'An unknown error occurred.');
            }
        } catch (err) {
            setError(err?.response?.data?.errorMessages?.join(', ') || err.message || 'Failed to confirm account.');
            console.error(err);
        }
    };



    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    User Management
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Full Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Email Confirmed</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.hoTen}</TableCell>
                                    <TableCell>{user.userName}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.trangThai}</TableCell>
                                    <TableCell>{user.emailConfirmed ? 'Đã xác nhận' : 'Chưa'}</TableCell>
                                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                                        {user.trangThai === 'PENDING' && (
                                            <Button 
                                                variant="contained" 
                                                color="success"
                                                size="small"
                                                onClick={() => handleConfirmAccount(user.id)}
                                            >
                                                Xác nhận
                                            </Button>
                                        )}
                                        {user.role !== 'ADMIN' && (
                                            <Button 
                                                variant="contained"
                                                color={user.trangThai === 'LOCKED' ? 'info' : 'warning'}
                                                size="small"
                                                onClick={() => handleToggleLock(user.id)}
                                            >
                                                {user.trangThai === 'LOCKED' ? 'Mở khóa' : 'Khóa'}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default UserManagementPage;
