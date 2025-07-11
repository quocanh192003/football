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
    const [success, setSuccess] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(''); // Clear previous errors
            setSuccess(''); // Clear previous success
            const response = await axiosInstance.get('/api/admin/get-all');
            console.log('Fetch users response:', response.data);
            
            if (response.data && response.data.isSuccess && Array.isArray(response.data.result)) {
                setUsers(response.data.result);
                console.log('Users loaded:', response.data.result);
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
            setError('');
            setSuccess('');
            console.log('Toggling lock for user:', userId);
            
            // Tìm user hiện tại để biết trạng thái
            const currentUser = users.find(u => u.id === userId);
            console.log('Current user:', currentUser);
            console.log('Current status:', currentUser?.trangThai);
            
            // Gọi API lock/unlock
            const response = await axiosInstance.post(`/api/admin/lock-unlock/${userId}`);
            console.log('Lock/unlock response:', response.data);
            
            if (response.data.isSuccess) {
                const action = currentUser?.trangThai === 'ACTIVE' ? 'khóa' : 'mở khóa';
                setSuccess(`Đã ${action} tài khoản ${currentUser?.hoTen} thành công!`);
                
                // Refresh list để hiển thị trạng thái mới
                await fetchUsers();
            } else {
                setError(response.data.errorMessages?.join(', ') || 'Không thể thay đổi trạng thái người dùng.');
            }
        } catch (err) {
            console.error('Error toggling lock:', err);
            console.error('Error response:', err.response?.data);
            
            if (err.response?.status === 404) {
                setError('Không tìm thấy người dùng hoặc API endpoint không tồn tại.');
            } else if (err.response?.status === 403) {
                setError('Không có quyền thực hiện thao tác này.');
            } else if (err.response?.status === 401) {
                setError('Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.');
            } else {
                setError(`Lỗi khi thay đổi trạng thái: ${err.response?.data?.message || err.message || 'Vui lòng thử lại.'}`);
            }
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
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
                                    <TableCell>
                                        <span style={{ 
                                            color: user.trangThai === 'ACTIVE' ? '#4caf50' : 
                                                   user.trangThai === 'LOCKED' ? '#f44336' : 
                                                   user.trangThai === 'PENDING' ? '#ff9800' : '#757575',
                                            fontWeight: 600
                                        }}>
                                            {user.trangThai}
                                        </span>
                                    </TableCell>
                                    <TableCell>{user.emailConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}</TableCell>
                                    <TableCell sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                                        {user.role !== 'ADMIN' && user.trangThai !== 'PENDING' && (
                                            <Button 
                                                variant="contained"
                                                color={user.trangThai === 'LOCKED' ? 'success' : 'error'}
                                                size="small"
                                                onClick={() => handleToggleLock(user.id)}
                                                sx={{ minWidth: '80px' }}
                                            >
                                                {user.trangThai === 'LOCKED' ? 'MỞ KHÓA' : 'KHÓA'}
                                            </Button>
                                        )}
                                        {user.role === 'ADMIN' && (
                                            <span style={{ color: '#666', fontSize: '12px' }}>Không thể khóa Admin</span>
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
