import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    Alert,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import VisibilityIcon from '@mui/icons-material/Visibility';

const MyFieldsPage = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);
    const [editField, setEditField] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [subFields, setSubFields] = useState([]);
    const [subFieldDialogOpen, setSubFieldDialogOpen] = useState(false);
    const [selectedFieldForSub, setSelectedFieldForSub] = useState(null);

    useEffect(() => {
        const fetchFields = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/football/get-all-football');
                const maChuSan = user?.id || user?.unique_name || user?.nameid || '';
                const ownerFields = (response.data.result || []).filter(field => String(field.maChuSan) === String(maChuSan));
                setFields(ownerFields);
            } catch (err) {
                setError('Failed to fetch fields.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, [user]);

    const handleOpenEdit = (field) => {
        setEditField({ ...field });
        setEditOpen(true);
        setEditError('');
        setEditSuccess('');
        setEditImageFile(null);
    };
    const handleCloseEdit = () => {
        setEditOpen(false);
        setEditField(null);
        setEditError('');
        setEditSuccess('');
    };
    const handleEditChange = (e) => {
        setEditField({ ...editField, [e.target.name]: e.target.value });
    };
    const handleEditImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEditImageFile(e.target.files[0]);
        }
    };
    const handleEditSave = async () => {
        setEditLoading(true);
        setEditError('');
        setEditSuccess('');
        try {
            const formData = new FormData();
            formData.append('tenSanBong', editField.tenSanBong);
            formData.append('soLuongSan', editField.soLuongSan);
            formData.append('diaChi', editField.diaChi);
            formData.append('soDienThoai', editField.soDienThoai || '');
            formData.append('moTa', editField.moTa || '');
            formData.append('trangThai', editField.trangThai || '');
            if (editImageFile) {
                formData.append('hinhAnhFile', editImageFile);
            } else if (editField.hinhAnhs && editField.hinhAnhs[0]?.urlHinhAnh) {
                // Fetch ảnh cũ về dạng file
                const response = await fetch(editField.hinhAnhs[0].urlHinhAnh);
                const blob = await response.blob();
                const fileName = editField.hinhAnhs[0].urlHinhAnh.split('/').pop() || 'old_image.jpg';
                formData.append('hinhAnhFile', new File([blob], fileName, { type: blob.type }));
            }
            const res = await axiosInstance.put(`/api/football/update-football/${editField.maSanBong}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.isSuccess) {
                setEditSuccess('Cập nhật thành công!');
                setFields(fields.map(f => f.maSanBong === editField.maSanBong ? { ...f, ...editField } : f));
                setTimeout(() => {
                    handleCloseEdit();
                }, 1200);
            } else {
                setEditError(res.data.errorMessages?.join(', ') || 'Cập nhật thất bại!');
            }
        } catch (e) {
            setEditError('Cập nhật thất bại!');
        } finally {
            setEditLoading(false);
        }
    };

    const handleOpenSubFields = async (field) => {
        setSelectedFieldForSub(field);
        setSubFieldDialogOpen(true);
        try {
            const res = await axiosInstance.get('/api/football/get-all-detailfootball');
            const filtered = res.data.result.filter(sf => sf.maSanBong === field.maSanBong);
            setSubFields(filtered);
        } catch (e) {
            setSubFields([]);
        }
    };
    const handleCloseSubFields = () => {
        setSubFieldDialogOpen(false);
        setSelectedFieldForSub(null);
        setSubFields([]);
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
            <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    My Football Fields
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/owner/field/new')}
                >
                    Add New Field
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Sub Fields</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">You haven't added any fields yet.</TableCell>
                            </TableRow>
                        ) : (
                            fields.map((field) => (
                                <TableRow key={field.maSanBong}>
                                    <TableCell>{field.tenSanBong}</TableCell>
                                    <TableCell>{field.diaChi}</TableCell>
                                    <TableCell>{field.trangThai}</TableCell>
                                    <TableCell>
                                        <Button size="small" startIcon={<VisibilityIcon />} onClick={() => navigate(`/owner/fields/${field.maSanBong}/subfields`)}>
                                            Xem sân con
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpenEdit(field)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Dialog chỉnh sửa sân bóng */}
            <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
                <DialogTitle>Chỉnh sửa sân bóng</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Tên sân bóng" name="tenSanBong" value={editField?.tenSanBong || ''} onChange={handleEditChange} fullWidth required />
                    <TextField margin="dense" label="Địa chỉ" name="diaChi" value={editField?.diaChi || ''} onChange={handleEditChange} fullWidth required />
                    <TextField margin="dense" label="Số lượng sân con" name="soLuongSan" type="number" value={editField?.soLuongSan || ''} onChange={handleEditChange} fullWidth required />
                    <TextField margin="dense" label="Số điện thoại" name="soDienThoai" value={editField?.soDienThoai || ''} onChange={handleEditChange} fullWidth />
                    <TextField margin="dense" label="Mô tả" name="moTa" value={editField?.moTa || ''} onChange={handleEditChange} fullWidth multiline minRows={2} />
                    <TextField margin="dense" label="Trạng thái" name="trangThai" value={editField?.trangThai || ''} onChange={handleEditChange} fullWidth />
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Input type="file" onChange={handleEditImageChange} inputProps={{ accept: 'image/*' }} />
                        {editField?.hinhAnhs && editField.hinhAnhs[0]?.urlHinhAnh && !editImageFile && (
                            <Box sx={{ mt: 1 }}>
                                <img src={editField.hinhAnhs[0].urlHinhAnh} alt="Ảnh sân" style={{ maxWidth: 120, borderRadius: 4 }} />
                            </Box>
                        )}
                        {editImageFile && (
                            <Box sx={{ mt: 1 }}>
                                <img src={URL.createObjectURL(editImageFile)} alt="Preview" style={{ maxWidth: 120, borderRadius: 4 }} />
                            </Box>
                        )}
                    </Box>
                    {editError && <Alert severity="error" sx={{ mt: 2 }}>{editError}</Alert>}
                    {editSuccess && <Alert severity="success" sx={{ mt: 2 }}>{editSuccess}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>Hủy</Button>
                    <Button onClick={handleEditSave} variant="contained" disabled={editLoading}>{editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
                </DialogActions>
            </Dialog>
            {/* Dialog hiển thị danh sách sân con */}
            <Dialog open={subFieldDialogOpen} onClose={handleCloseSubFields} maxWidth="sm" fullWidth>
                <DialogTitle>Danh sách sân con của: {selectedFieldForSub?.tenSanBong}</DialogTitle>
                <DialogContent>
                    {subFields.length === 0 ? (
                        <Typography>Không có sân con nào.</Typography>
                    ) : (
                        subFields.map(sf => (
                            <Box key={sf.maSanCon} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                <Typography variant="subtitle1"><b>{sf.tenSanCon || sf.maSanCon}</b> ({sf.loaiSanCon || '---'})</Typography>
                                <Typography variant="body2">Mã sân con: {sf.maSanCon}</Typography>
                                <Typography variant="body2">Trạng thái: {sf.trangThaiSan}</Typography>
                            </Box>
                        ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSubFields}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyFieldsPage;
