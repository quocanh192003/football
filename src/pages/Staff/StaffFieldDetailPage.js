import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Grid, Card, CardContent, Button, CircularProgress, Alert, Chip, Fade, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const slotCardStyle = (selected) => ({
  border: selected ? '2px solid #388e3c' : '1px solid #e0e0e0',
  borderRadius: 3,
  boxShadow: selected ? '0 4px 24px 0 rgba(56, 142, 60, 0.15)' : '0 2px 8px 0 rgba(0,0,0,0.07)',
  transition: 'all 0.25s',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  background: selected ? 'linear-gradient(90deg, #e8f5e9 0%, #fff 100%)' : '#fff',
  '&:hover': {
    boxShadow: '0 6px 24px 0 rgba(56, 142, 60, 0.18)',
    transform: 'scale(1.03)',
    zIndex: 2,
  },
});

const StaffFieldDetailPage = () => {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [subFields, setSubFields] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ maSanCon: '', thu: '', thoiGianBatDau: '', thoiGianKetThuc: '', gia: '' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    const fetchFieldDetails = async () => {
      setLoading(true);
      try {
        const fieldRes = await axiosInstance.get(`/api/football/get-all-football`);
        const currentField = fieldRes.data.result.find(f => f.maSanBong === fieldId);
        setField(currentField);
        const subFieldRes = await axiosInstance.get(`/api/football/get-all-detailfootball`);
        const currentSubFields = subFieldRes.data.result.filter(sf => sf.maSanBong === fieldId);
        setSubFields(currentSubFields);
      } catch (err) {
        setError('Không thể tải thông tin sân bóng.');
      } finally {
        setLoading(false);
      }
    };
    fetchFieldDetails();
  }, [fieldId]);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/get-all-schedule');
        if (res.data.isSuccess) {
          const filtered = res.data.result.filter(
            sch => sch.maSanBong.toLowerCase() === fieldId.toLowerCase()
          );
          setSchedules(filtered);
        } else {
          setSchedules([]);
        }
      } catch (err) {
        setError('Không thể tải khung giờ sân.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [fieldId]);

  const handleBook = () => {
    if (!selectedSlot) return;
    setError('');
    setSuccess('');
    navigate('/staff/booking-confirmation', {
      state: {
        bookingDetails: {
          fieldId: field.maSanBong,
          fieldName: field.tenSanBong,
          pitchId: selectedSlot.maSanCon,
          pitchName: selectedSlot.maSanCon,
          date: new Date().toISOString().slice(0, 10),
          dayOfWeek: selectedSlot.thu, // Truyền thứ từ slot
          startTime: selectedSlot.gioBatDau,
          endTime: selectedSlot.gioKetThuc,
          price: selectedSlot.giaThue || 0,
        }
      }
    });
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
    setNewSchedule({ maSanCon: '', thu: '', thoiGianBatDau: '', thoiGianKetThuc: '', gia: '' });
    setCreateError('');
    setCreateSuccess('');
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewSchedule({ maSanCon: '', thu: '', thoiGianBatDau: '', thoiGianKetThuc: '', gia: '' });
    setCreateError('');
    setCreateSuccess('');
  };

  const handleCreateSchedule = async () => {
    setCreateError('');
    setCreateSuccess('');
    if (!newSchedule.maSanCon || !newSchedule.thu || !newSchedule.thoiGianBatDau || !newSchedule.thoiGianKetThuc || !newSchedule.gia) {
      setCreateError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      await axiosInstance.post('/api/create-schedule', {
        maLichSan: 'MLS' + Date.now(),
        maSanCon: newSchedule.maSanCon,
        maSanBong: field.maSanBong,
        thu: newSchedule.thu,
        gioBatDau: newSchedule.thoiGianBatDau.length === 5 ? newSchedule.thoiGianBatDau + ':00' : newSchedule.thoiGianBatDau,
        gioKetThuc: newSchedule.thoiGianKetThuc.length === 5 ? newSchedule.thoiGianKetThuc + ':00' : newSchedule.thoiGianKetThuc,
        giaThue: Number(newSchedule.gia),
      });
      setCreateSuccess('Tạo lịch thành công!');
      setSuccess(`Đã tạo lịch thành công cho sân con ${newSchedule.maSanCon} vào ${newSchedule.thu} từ ${newSchedule.thoiGianBatDau} đến ${newSchedule.thoiGianKetThuc}!`);
      setCreateDialogOpen(false);
      
      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      // Reload schedules ngay lập tức
      const res = await axiosInstance.get('/api/get-all-schedule');
      if (res.data.isSuccess) {
        const filtered = res.data.result.filter(sch => sch.maSanBong.toLowerCase() === fieldId.toLowerCase());
        setSchedules(filtered);
      }
      setLoading(false);
    } catch (err) {
      setCreateError('Không thể tạo lịch. Vui lòng thử lại!');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}><CircularProgress size={48} /><Typography sx={{ mt: 2, color: '#388e3c', fontWeight: 500, letterSpacing: 1 }}>Đang tải dữ liệu...</Typography></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Fade in timeout={700}>
      {/* <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}> */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Avatar
            variant="rounded"
            src={field?.hinhAnhs?.[0]?.urlHinhAnh || '/default-field.jpg'}
            alt={field?.tenSanBong}
            sx={{ width: 96, height: 96, boxShadow: 2, border: '2px solid #388e3c', bgcolor: '#fff' }}
          >
            {field?.tenSanBong?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#388e3c', mb: 0.5 }}>{field?.tenSanBong}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>{field?.diaChi}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{field?.moTa}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Số lượng sân con: <b>{subFields.length}</b></Typography>
          </Box>
        </Box>
        <Box mt={2} mb={2} textAlign="right">
          <Button variant="contained" color="primary" onClick={handleOpenCreateDialog}>Tạo lịch trống</Button>
        </Box>
        
        {/* Thông báo thành công khi tạo lịch */}
        {success && (
          <Box mb={3}>
            <Alert severity="success" sx={{ fontSize: '16px', fontWeight: 500 }}>
              {success}
            </Alert>
          </Box>
        )}
        
        <Grid container spacing={3}>
          {schedules.length === 0 && (
            <Grid item xs={12}><Alert severity="info">Không có khung giờ nào cho sân này.</Alert></Grid>
          )}
          {schedules.map((slot, idx) => {
            // Tìm tên sân con từ subFields
            const subField = subFields.find(sf => sf.maSanCon === slot.maSanCon);
            const tenSanCon = subField?.tenSanCon || slot.maSanCon;
            
            return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={slot.mainChiSan}>
              <Fade in timeout={400 + idx * 80}>
                <Card sx={slotCardStyle(selectedSlot === slot)} onClick={() => slot.trangThai === 'AVAILABLE' && setSelectedSlot(slot)}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 600 }}>{tenSanCon}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Ngày: <b>{slot.thu}</b></Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Khung giờ: <b>{slot.gioBatDau} - {slot.gioKetThuc}</b></Typography>
                    <Typography variant="body2">Giá: <b style={{ color: '#388e3c' }}>{slot.giaThue ? slot.giaThue.toLocaleString() : '---'}đ</b></Typography>
                    <Chip label={slot.trangThai === 'BOOKED' ? 'Đã đặt' : 'Còn trống'} color={slot.trangThai === 'BOOKED' ? 'error' : 'success'} size="small" sx={{ mt: 1 }} />
                    <Button
                      fullWidth
                      variant={selectedSlot === slot ? 'contained' : 'outlined'}
                      color={selectedSlot === slot ? 'success' : 'primary'}
                      sx={{ mt: 2, fontWeight: 600, letterSpacing: 1, transition: 'transform 0.2s', transform: selectedSlot === slot ? 'scale(1.05)' : 'none', boxShadow: selectedSlot === slot ? 2 : undefined }}
                      disabled={slot.trangThai === 'BOOKED'}
                      onClick={e => { e.stopPropagation(); if (slot.trangThai === 'AVAILABLE') setSelectedSlot(slot); }}
                    >
                      {selectedSlot === slot ? 'Đã chọn' : 'Chọn khung giờ'}
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
            );
          })}
        </Grid>
        <Box mt={5} textAlign="center">
          <Button
            variant="contained"
            color="success"
            size="large"
            sx={{ px: 6, py: 1.5, fontWeight: 700, fontSize: 20, borderRadius: 3, boxShadow: 3, transition: 'all 0.2s', ':hover': { background: '#43a047', transform: 'scale(1.04)' } }}
            disabled={!selectedSlot}
            onClick={handleBook}
          >
            ĐẶT SÂN NGAY
          </Button>
        </Box>
        {/* Dialog tạo lịch trống */}
        <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog}>
          <DialogTitle>Tạo lịch trống mới</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense" variant="standard" required>
              <InputLabel id="maSanCon-label">Mã sân con</InputLabel>
              <Select
                labelId="maSanCon-label"
                value={newSchedule.maSanCon}
                onChange={e => setNewSchedule({ ...newSchedule, maSanCon: e.target.value })}
                label="Mã sân con"
              >
                {subFields.map((sf) => (
                  <MenuItem key={sf.maSanCon} value={sf.maSanCon}>{sf.maSanCon} - {sf.tenSanCon || ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" variant="standard" required>
              <InputLabel id="thu-label">Thứ</InputLabel>
              <Select
                labelId="thu-label"
                value={newSchedule.thu}
                onChange={e => setNewSchedule({ ...newSchedule, thu: e.target.value })}
                label="Thứ"
              >
                <MenuItem value="Thứ 2">Thứ 2</MenuItem>
                <MenuItem value="Thứ 3">Thứ 3</MenuItem>
                <MenuItem value="Thứ 4">Thứ 4</MenuItem>
                <MenuItem value="Thứ 5">Thứ 5</MenuItem>
                <MenuItem value="Thứ 6">Thứ 6</MenuItem>
                <MenuItem value="Thứ 7">Thứ 7</MenuItem>
                <MenuItem value="Chủ nhật">Chủ nhật</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense" label="Giờ bắt đầu" type="time" fullWidth
              value={newSchedule.thoiGianBatDau} onChange={e => setNewSchedule({ ...newSchedule, thoiGianBatDau: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense" label="Giờ kết thúc" type="time" fullWidth
              value={newSchedule.thoiGianKetThuc} onChange={e => setNewSchedule({ ...newSchedule, thoiGianKetThuc: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense" label="Giá thuê (VNĐ)" type="number" fullWidth
              value={newSchedule.gia} onChange={e => setNewSchedule({ ...newSchedule, gia: e.target.value })}
            />
            {createError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {createError}
              </Alert>
            )}
            {createSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {createSuccess}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog}>Hủy</Button>
            <Button onClick={handleCreateSchedule} variant="contained">Tạo lịch</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Fade>
  );
};

export default StaffFieldDetailPage; 