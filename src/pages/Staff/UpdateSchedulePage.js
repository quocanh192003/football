import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress, 
  Alert, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Fade
} from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const UpdateSchedulePage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    thu: '',
    gioBatDau: '',
    gioKetThuc: '',
    giaThue: 0,
    trangThai: ''
  });

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      setLoading(true);
      try {
        // Lấy tất cả lịch sân và tìm theo ID
        const res = await axiosInstance.get('/api/get-all-schedule');
        if (res.data.isSuccess) {
          const currentSchedule = res.data.result.find(s => s.maLichSan === scheduleId);
          if (currentSchedule) {
            setSchedule(currentSchedule);
            setFormData({
              thu: currentSchedule.thu || '',
              gioBatDau: currentSchedule.gioBatDau?.substring(0, 5) || '', // Chuyển từ HH:mm:ss thành HH:mm
              gioKetThuc: currentSchedule.gioKetThuc?.substring(0, 5) || '',
              giaThue: currentSchedule.giaThue || 0,
              trangThai: currentSchedule.trangThai || ''
            });
          } else {
            setError('Không tìm thấy lịch sân.');
          }
        } else {
          setError('Không thể tải thông tin lịch sân.');
        }
      } catch (err) {
        setError('Không thể tải thông tin lịch sân.');
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [scheduleId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async () => {
    if (!formData.thu || !formData.gioBatDau || !formData.gioKetThuc || !formData.giaThue || !formData.trangThai) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      // Thử cách 1: Với ticks
      const updateDataWithTicks = {
        thu: formData.thu,
        gioBatDau: {
          ticks: convertTimeToTicks(formData.gioBatDau)
        },
        gioKetThuc: {
          ticks: convertTimeToTicks(formData.gioKetThuc)
        },
        giaThue: Number(formData.giaThue),
        trangThai: formData.trangThai
      };

      // Thử cách 2: Với string thời gian
      const updateDataWithString = {
        thu: formData.thu,
        gioBatDau: formData.gioBatDau + ':00',
        gioKetThuc: formData.gioKetThuc + ':00',
        giaThue: Number(formData.giaThue),
        trangThai: formData.trangThai
      };

      console.log('Trying with ticks:', updateDataWithTicks);
      console.log('Trying with string:', updateDataWithString);
      console.log('Schedule ID:', scheduleId);

      // Thử gửi với ticks trước
      let response;
      try {
        response = await axiosInstance.put(`/api/update-schedule/${scheduleId}`, updateDataWithTicks);
        console.log('Response with ticks:', response.data);
      } catch (ticksError) {
        console.log('Ticks failed, trying with string format...');
        response = await axiosInstance.put(`/api/update-schedule/${scheduleId}`, updateDataWithString);
        console.log('Response with string:', response.data);
      }
      
      console.log('Response:', response.data);
      
      if (response.data.isSuccess) {
        setSuccess('Cập nhật lịch sân thành công!');
        // Tự động quay lại trang trước sau 2 giây
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setError(response.data.errorMessages?.join(', ') || 'Không thể cập nhật lịch sân.');
      }
    } catch (err) {
      console.error('Full error details:', err);
      console.error('Error response:', err.response?.data);
      setError(`Không thể cập nhật lịch sân. ${err.response?.data?.message || err.message || 'Vui lòng thử lại.'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Hàm chuyển đổi thời gian HH:mm thành ticks
  const convertTimeToTicks = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    // 1 tick = 100 nanoseconds
    // 1 giờ = 36,000,000,000 ticks
    // 1 phút = 600,000,000 ticks
    return (hours * 36000000000) + (minutes * 600000000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <CircularProgress size={48} />
        <Typography sx={{ mt: 2, color: '#1976d2', fontWeight: 500 }}>
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  if (error && !schedule) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    <Fade in timeout={700}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
            Cập nhật lịch sân
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Mã lịch sân: <strong>{scheduleId}</strong>
          </Typography>
          {schedule && (
            <Typography variant="subtitle2" color="text.secondary">
              Sân: {schedule.maSanCon} - {schedule.maSanBong}
            </Typography>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Thứ</InputLabel>
                  <Select
                    value={formData.thu}
                    label="Thứ"
                    onChange={(e) => handleInputChange('thu', e.target.value)}
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={formData.trangThai}
                    label="Trạng thái"
                    onChange={(e) => handleInputChange('trangThai', e.target.value)}
                  >
                    <MenuItem value="AVAILABLE">Còn trống</MenuItem>
                    <MenuItem value="BOOKED">Đã đặt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Giờ bắt đầu"
                  type="time"
                  value={formData.gioBatDau}
                  onChange={(e) => handleInputChange('gioBatDau', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Giờ kết thúc"
                  type="time"
                  value={formData.gioKetThuc}
                  onChange={(e) => handleInputChange('gioKetThuc', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Giá thuê (VNĐ)"
                  type="number"
                  value={formData.giaThue}
                  onChange={(e) => handleInputChange('giaThue', e.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(-1)}
                sx={{ px: 4, py: 1.5 }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleUpdate}
                disabled={updating}
                sx={{ px: 4, py: 1.5, fontWeight: 600 }}
              >
                {updating ? <CircularProgress size={24} color="inherit" /> : 'Cập nhật'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Fade>
  );
};

export default UpdateSchedulePage;
