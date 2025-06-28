import React, { useState, useEffect } from 'react';

import { Container, Typography, Box, Grid, Card, CardContent, Button, CircularProgress, Alert, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const StaffBookingPage = () => {
  const [allFields, setAllFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [subFields, setSubFields] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all main fields for the dropdown
  useEffect(() => {
    const fetchAllFields = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/football/get-all-football');
        setAllFields(res.data.result || []);
      } catch (err) {
        setError('Không thể tải danh sách sân bóng.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllFields();
  }, []);

  // Fetch sub-fields and schedules when a main field and date are selected
  useEffect(() => {
    if (!selectedFieldId) return;

    const fetchDetailsForField = async () => {
      setLoading(true);
      setError('');
      setSubFields([]);
      setSchedules({});
      setSelectedSlots([]);

      try {
        // Fetch sub-fields
        const subFieldRes = await axiosInstance.get(`/api/football/get-all-detailfootball`);
        const currentSubFields = subFieldRes.data.result.filter(sf => sf.maSanBong === selectedFieldId);
        setSubFields(currentSubFields);

        // Fetch schedules for these sub-fields for the selected date
        const allSchedules = {};
        for (const subField of currentSubFields) {
          const scheduleRes = await axiosInstance.get(`/api/football/get-schedule/${subField.maSanCon}`);
          const filteredSchedules = scheduleRes.data.result.filter(s => {
            const scheduleDate = new Date(s.ngay).toISOString().split('T')[0];
            return scheduleDate === selectedDate;
          });
          allSchedules[subField.maSanCon] = filteredSchedules;
        }
        setSchedules(allSchedules);

      } catch (err) {
        setError('Không thể tải thông tin chi tiết sân.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsForField();
  }, [selectedFieldId, selectedDate]);

  const handleSlotClick = (slot) => {
    setSelectedSlots(prev => {
      const isSelected = prev.find(s => s.maChiSan === slot.maChiSan);
      if (isSelected) {
        return prev.filter(s => s.maChiSan !== slot.maChiSan);
      } else {
        return [...prev, slot];
      }
    });
  };

  const getDayInVietnamese = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[new Date(date).getDay()];
  }

  const handleBooking = async () => {
    if (selectedSlots.length === 0) {
      alert('Vui lòng chọn ít nhất một khung giờ.');
      return;
    }

    try {
      const bookingData = {
        phuongThucTT: 'STAFF_BOOKING',
        dsSanCon: selectedSlots.map(slot => ({
          maSanBong: slot.maSanBong,
          maSanCon: slot.maSanCon,
          thu: getDayInVietnamese(selectedDate),
          gioBatDau: { ticks: new Date(slot.gioBatDau).getTime() },
          gioKetThuc: { ticks: new Date(slot.gioKetThuc).getTime() },
          giaThue: slot.giaThue
        })),
      };

      await axiosInstance.post('/api/order/create-order', bookingData);
      alert('Đặt sân thành công!');
      // Reset state after booking
      setSelectedSlots([]);
      // Optionally, navigate away or refresh data
      // navigate('/owner/dashboard');
    } catch (err) {
      setError('Đặt sân thất bại. Vui lòng thử lại.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Đặt sân cho khách</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
            <FormControl fullWidth>
                <InputLabel id="field-select-label">Chọn sân bóng</InputLabel>
                <Select
                    labelId="field-select-label"
                    value={selectedFieldId}
                    label="Chọn sân bóng"
                    onChange={(e) => setSelectedFieldId(e.target.value)}
                    disabled={loading}
                >
                    {allFields.map(f => (
                        <MenuItem key={f.maSanBong} value={f.maSanBong}>{f.tenSanBong}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
            <TextField
                id="date"
                label="Chọn ngày"
                type="date"
                fullWidth
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={!selectedFieldId}
            />
        </Grid>
      </Grid>

      {loading && <CircularProgress />}

      {selectedFieldId && !loading && (
        <Grid container spacing={3}>
          {subFields.map(sf => (
            <Grid item xs={12} md={6} key={sf.maSanCon}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{sf.tenSanCon} ({sf.loaiSanCon})</Typography>
                  <Box mt={2}>
                    {schedules[sf.maSanCon] && schedules[sf.maSanCon].length > 0 ? (
                      schedules[sf.maSanCon].map(slot => (
                        <Button
                          key={slot.maChiSan}
                          variant={selectedSlots.find(s => s.maChiSan === slot.maChiSan) ? 'contained' : 'outlined'}
                          onClick={() => handleSlotClick(slot)}
                          sx={{ m: 0.5 }}
                        >
                          {new Date(slot.gioBatDau).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.gioKetThuc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Button>
                      ))
                    ) : (
                      <Typography variant="body2">Không có lịch trống cho ngày này.</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedSlots.length > 0 && (
        <Box mt={4} textAlign="center">
            <Typography variant="h6">Tổng tiền: {selectedSlots.reduce((acc, slot) => acc + slot.giaThue, 0).toLocaleString('vi-VN')}đ</Typography>
            <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                onClick={handleBooking}
            >
                Xác nhận đặt sân
            </Button>
        </Box>
      )}
    </Container>
  );
};

export default StaffBookingPage;
