import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const SubFieldsPage = () => {
  const { fieldId } = useParams();
  const [subFields, setSubFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSubField, setEditSubField] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSubField, setNewSubField] = useState({ tenSanCon: '', loaiSanCon: '', trangThaiSan: 'AVAILABLE' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  useEffect(() => {
    const fetchSubFields = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/football/get-all-detailfootball');
        setSubFields(res.data.result.filter(sf => sf.maSanBong === fieldId));
      } catch (e) {
        setError('Không thể tải danh sách sân con.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubFields();
  }, [fieldId]);

  const handleOpenEdit = (sf) => {
    setEditSubField({ ...sf });
    setEditDialogOpen(true);
    setEditError('');
    setEditSuccess('');
  };
  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setEditSubField(null);
    setEditError('');
    setEditSuccess('');
  };
  const handleEditChange = (e) => {
    setEditSubField({ ...editSubField, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      await axiosInstance.put(`/api/football/update-detailfootball/${editSubField.maSanCon}`, {
        tenSanCon: editSubField.tenSanCon,
        loaiSanCon: editSubField.loaiSanCon,
        trangThaiSan: editSubField.trangThaiSan
      });
      setEditSuccess('Cập nhật thành công!');
      setSubFields(subFields.map(sf => sf.maSanCon === editSubField.maSanCon ? { ...sf, ...editSubField } : sf));
      setTimeout(() => {
        handleCloseEdit();
      }, 1200);
    } catch (e) {
      setEditError('Cập nhật thất bại!');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setAddDialogOpen(true);
    setNewSubField({ tenSanCon: '', loaiSanCon: '', trangThaiSan: 'AVAILABLE' });
    setAddError('');
    setAddSuccess('');
  };
  const handleCloseAdd = () => {
    setAddDialogOpen(false);
    setAddError('');
    setAddSuccess('');
  };
  const handleAddChange = (e) => {
    setNewSubField({ ...newSubField, [e.target.name]: e.target.value });
  };
  const handleAddSave = async () => {
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      // Sinh mã sân con tự động
      let nextIndex = 1;
      if (subFields && subFields.length > 0) {
        const numbers = subFields
          .map(sf => {
            const match = (sf.maSanCon || '').match(/_san(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
          })
          .filter(n => n !== null);
        if (numbers.length > 0) {
          nextIndex = Math.max(...numbers) + 1;
        }
      }
      const newMaSanCon = `${fieldId}_san${nextIndex}`;
      await axiosInstance.post('/api/football/create-detailfootball', {
        maSanBong: fieldId,
        maSanCon: newMaSanCon,
        tenSanCon: newSubField.tenSanCon,
        loaiSanCon: newSubField.loaiSanCon,
        trangThaiSan: newSubField.trangThaiSan
      });
      setAddSuccess('Thêm sân con thành công!');
      setAddDialogOpen(false);
      setNewSubField({ tenSanCon: '', loaiSanCon: '', trangThaiSan: 'AVAILABLE' });
      // Reload subfields
      const res = await axiosInstance.get('/api/football/get-all-detailfootball');
      setSubFields(res.data.result.filter(sf => sf.maSanBong === fieldId));
    } catch (e) {
      setAddError('Không thể thêm sân con. Vui lòng thử lại!');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>Danh sách sân con</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={handleOpenAdd}>Thêm sân con</Button>
        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <Typography>Đang tải...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên sân con</TableCell>
                  <TableCell>Loại sân</TableCell>
                  <TableCell>Mã sân con</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subFields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Không có sân con nào.</TableCell>
                  </TableRow>
                ) : (
                  subFields.map(sf => (
                    <TableRow key={sf.maSanCon}>
                      <TableCell>{sf.tenSanCon}</TableCell>
                      <TableCell>{sf.loaiSanCon}</TableCell>
                      <TableCell>{sf.maSanCon}</TableCell>
                      <TableCell>{sf.trangThaiSan}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleOpenEdit(sf)}><EditIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {/* Dialog chỉnh sửa sân con */}
      <Dialog open={editDialogOpen} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
        <DialogTitle>Chỉnh sửa sân con</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Tên sân con" name="tenSanCon" value={editSubField?.tenSanCon || ''} onChange={handleEditChange} fullWidth required />
          <TextField margin="dense" label="Loại sân" name="loaiSanCon" value={editSubField?.loaiSanCon || ''} onChange={handleEditChange} fullWidth required />
          <TextField margin="dense" label="Trạng thái" name="trangThaiSan" value={editSubField?.trangThaiSan || ''} onChange={handleEditChange} fullWidth required />
          {editError && <Alert severity="error" sx={{ mt: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mt: 2 }}>{editSuccess}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Hủy</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editLoading}>{editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog thêm sân con */}
      <Dialog open={addDialogOpen} onClose={handleCloseAdd} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm sân con mới</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Tên sân con" name="tenSanCon" value={newSubField.tenSanCon} onChange={handleAddChange} fullWidth required />
          <TextField margin="dense" label="Loại sân" name="loaiSanCon" value={newSubField.loaiSanCon} onChange={handleAddChange} fullWidth required />
          <TextField margin="dense" label="Trạng thái" name="trangThaiSan" value={newSubField.trangThaiSan} onChange={handleAddChange} fullWidth required />
          {addError && <Alert severity="error" sx={{ mt: 2 }}>{addError}</Alert>}
          {addSuccess && <Alert severity="success" sx={{ mt: 2 }}>{addSuccess}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Hủy</Button>
          <Button onClick={handleAddSave} variant="contained" disabled={addLoading}>{addLoading ? 'Đang lưu...' : 'Tạo sân con'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubFieldsPage; 