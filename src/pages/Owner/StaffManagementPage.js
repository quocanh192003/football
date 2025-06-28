import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffManagementPage = () => {
    const { user, verifyEmail } = useAuth();
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState([]);
    const [newStaffData, setNewStaffData] = useState({
        hoTen: '',
        gioiTinh: '',
        username: '',
        password: '',
        maSanBong: '',
        tenVaiTro: 'NHÂN VIÊN',
        soDienThoai: '',
        maChuSan: ''
    });
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [verifyEmailValue, setVerifyEmailValue] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [verifyError, setVerifyError] = useState('');
    const [pendingVerifyEmail, setPendingVerifyEmail] = useState('');

    const fetchStaff = async () => {
        try {
            setLoading(true);
            // Assuming this endpoint gets staff for the logged-in owner
            const response = await axiosInstance.get('/api/employee-get');
            if (response.data.isSuccess) {
                setStaff(response.data.result || []);
            } else {
                setError(response.data.errorMessages.join(', '));
            }
        } catch (err) {
            setError('Failed to fetch staff.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchFields = async () => {
            if (!user) return;
            console.log('user object:', user);
            try {
                const response = await axiosInstance.get('/api/football/get-all-football');
                if (response.data.isSuccess) {
                    // Lọc sân bóng theo mã chủ sân trong token
                    const maChuSan = String(user?.id || user?.unique_name || user?.nameid || '');
                    console.log('maChuSan in context:', maChuSan);
                    console.log('maChuSan in fields:', (response.data.result || []).map(f => f.maChuSan));
                    const filteredFields = (response.data.result || []).filter(
                        field => String(field.maChuSan) === maChuSan
                    );
                    // if(filteredFields.length === 0) {
                    //     setError('Không có sân bóng nào thuộc quyền quản lý của bạn!');
                    // } else {
                    //     setError('');
                    // }
                    setFields(response.data.result || []);
                }
            } catch (e) { /* ignore */ }
        };
        fetchStaff();
        fetchFields();
    }, []);

    const handleOpen = () => {
        setNewStaffData((prev) => ({ ...prev, maSanBong: '' }));
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleInputChange = (e) => {
        setNewStaffData({ ...newStaffData, [e.target.name]: e.target.value });
    };

    const handleAddStaff = async () => {
        try {
            const maChuSan = user?.id || user?.unique_name || user?.nameid || '';
            // Chuẩn hóa payload đúng mẫu swagger
            const submitData = {
                maNhanVien: 'NV' + Date.now(),
                username: newStaffData.username,
                password: newStaffData.password,
                hoTen: newStaffData.hoTen,
                ngaySinh: newStaffData.ngaySinh ? new Date(newStaffData.ngaySinh).toISOString() : '',
                email: newStaffData.username,
                gioiTinh: newStaffData.gioiTinh,
                soDienThoai: newStaffData.soDienThoai,
                tenVaiTro: 'Nhân viên',
                maSanBong: newStaffData.maSanBong
            };
            const response = await axiosInstance.post('/api/chusan-create-employee', submitData);
            if (response.data.isSuccess) {
                handleClose();
                // Điều hướng sang trang xác thực email
                setTimeout(() => {
                    navigate('/email-verification', { state: { email: newStaffData.username } });
                }, 500);
                fetchStaff();
            } else {
                setError(response.data.errorMessages.join(', '));
            }
        } catch (err) {
            setError('Failed to create staff member.');
        }
    };

    const handleDeleteStaff = async (staffUsername) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                const response = await axiosInstance.delete(`/api/remove-employee/${staffUsername}`);
                if (response.data.isSuccess) {
                    fetchStaff(); // Refresh list
                } else {
                    setError(response.data.errorMessages.join(', '));
                }
            } catch (err) {
                setError('Failed to delete staff member.');
            }
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    Staff Management
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Add New Staff
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Birthday</TableCell>
                                <TableCell>Male</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {staff.map((member) => (
                                <TableRow key={member.username}>
                                    <TableCell>{member.hoTen}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.soDienThoai}</TableCell>
                                    <TableCell>{member.ngaySinh}</TableCell>
                                    <TableCell>{member.gioiTinh}</TableCell>
                                    <TableCell>
                                        <IconButton color="error" onClick={() => handleDeleteStaff(member.username)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add Staff Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogContent>
    <TextField autoFocus margin="dense" name="hoTen" label="Họ tên" type="text" fullWidth variant="standard" onChange={handleInputChange} required />
    <FormControl fullWidth margin="dense" variant="standard" required>
        <InputLabel id="gioiTinh-label">Giới tính</InputLabel>
        <Select labelId="gioiTinh-label" name="gioiTinh" value={newStaffData.gioiTinh} onChange={handleInputChange} label="Giới tính">
            <MenuItem value="Nam">Nam</MenuItem>
            <MenuItem value="Nữ">Nữ</MenuItem>
            <MenuItem value="Khác">Khác</MenuItem>
        </Select>
    </FormControl>
    <TextField margin="dense" name="username" label="Tên đăng nhập (email)" type="email" fullWidth variant="standard" onChange={handleInputChange} required />
    <TextField margin="dense" name="password" label="Mật khẩu" type="password" fullWidth variant="standard" onChange={handleInputChange} required />
    <TextField margin="dense" name="ngaySinh" label="Ngày sinh" type="date" fullWidth variant="standard" onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
    <FormControl fullWidth margin="dense" variant="standard" required>
        <InputLabel id="maSanBong-label">Sân bóng</InputLabel>
        <Select labelId="maSanBong-label" name="maSanBong" value={newStaffData.maSanBong} onChange={handleInputChange} label="Sân bóng">
            {fields.map((field) => (
                <MenuItem key={field.maSanBong} value={field.maSanBong}>{field.tenSanBong}</MenuItem>
            ))}
        </Select>
    </FormControl>
    <TextField margin="dense" name="soDienThoai" label="Số điện thoại" type="text" fullWidth variant="standard" onChange={handleInputChange} required />
    {/* tenVaiTro và maChuSan sẽ gửi mặc định */}
</DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleAddStaff} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StaffManagementPage;
