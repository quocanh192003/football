import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Grid, Card, CardContent, Button, CircularProgress, Alert, TextField, Chip, Fade, Avatar, Rating } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const fadeIn = {
  animation: 'fadeIn 0.7s',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'none' },
  },
};

const slotCardStyle = (selected) => ({
  border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
  borderRadius: 3,
  boxShadow: selected ? '0 4px 24px 0 rgba(25, 118, 210, 0.15)' : '0 2px 8px 0 rgba(0,0,0,0.07)',
  transition: 'all 0.25s',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  background: selected ? 'linear-gradient(90deg, #e3f2fd 0%, #fff 100%)' : '#fff',
  '&:hover': {
    boxShadow: '0 6px 24px 0 rgba(25, 118, 210, 0.18)',
    transform: 'scale(1.03)',
    zIndex: 2,
  },
});

const FieldDetailPage = () => {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [subFields, setSubFields] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [evaluates, setEvaluates] = useState([]);
  
  // State cho form đánh giá
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

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
        // Lấy tất cả khung giờ
        const res = await axiosInstance.get('/api/get-all-schedule');
        if (res.data.isSuccess) {
          // Lọc khung giờ theo sân đang xem
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

  useEffect(() => {
    const fetchEvaluates = async () => {
      try {
        const res = await axiosInstance.get(`/api/get-evaluate-by-id-san-bong/${fieldId}`);
        if (res.data.isSuccess) {
          setEvaluates(res.data.result || []);
        } else {
          setEvaluates([]);
        }
      } catch (err) {
        setEvaluates([]);
      }
    };
    fetchEvaluates();
  }, [fieldId]);

  const handleBook = () => {
    if (!selectedSlot) return;
    setError('');
    setSuccess('');
    
    // Tìm tên sân con từ subFields
    const subField = subFields.find(sf => sf.maSanCon === selectedSlot.maSanCon);
    const tenSanCon = subField?.tenSanCon || selectedSlot.maSanCon;
    
    // Điều hướng sang trang xác nhận booking, truyền thông tin slot đã chọn
    navigate('/customer/booking-confirmation', {
      state: {
        bookingDetails: {
          fieldId: field.maSanBong,
          fieldName: field.tenSanBong,
          pitchId: selectedSlot.maSanCon,
          pitchName: tenSanCon, // Sử dụng tên sân con thay vì mã
          date: new Date().toISOString().slice(0, 10), // hoặc lấy ngày từ slot nếu có
          dayOfWeek: selectedSlot.thu, // Truyền thứ từ slot
          startTime: selectedSlot.gioBatDau,
          endTime: selectedSlot.gioKetThuc,
          price: selectedSlot.giaThue || 0,
        }
      }
    });
  };

  const handleSubmitRating = async () => {
    if (newRating === 0) {
      setError('Vui lòng chọn số sao để đánh giá.');
      return;
    }

    setSubmittingRating(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post(`/api/create-evaluate/${fieldId}`, {
        soSao: newRating,
        binhLuan: newComment.trim() || '' // Cho phép bình luận rỗng
      });

      if (response.data.isSuccess) {
        setSuccess('Đánh giá của bạn đã được gửi thành công!');
        setNewRating(0);
        setNewComment('');
        
        // Refresh đánh giá để hiển thị đánh giá mới
        const res = await axiosInstance.get(`/api/get-evaluate-by-id-san-bong/${fieldId}`);
        if (res.data.isSuccess) {
          setEvaluates(res.data.result || []);
        }
      } else {
        setError(response.data.errorMessages?.join(', ') || 'Không thể gửi đánh giá.');
      }
    } catch (err) {
      setError('Không thể gửi đánh giá. Vui lòng thử lại.');
      console.error('Error submitting rating:', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}><CircularProgress size={48} /><Typography sx={{ mt: 2, color: '#1976d2', fontWeight: 500, letterSpacing: 1 }}>Đang tải dữ liệu...</Typography></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Fade in timeout={700}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Avatar
            variant="rounded"
            src={field?.hinhAnhs?.[0]?.urlHinhAnh || '/default-field.jpg'}
            alt={field?.tenSanBong}
            sx={{ width: 96, height: 96, boxShadow: 2, border: '2px solid #1976d2', bgcolor: '#fff' }}
          >
            {field?.tenSanBong?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2', mb: 0.5 }}>{field?.tenSanBong}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>{field?.diaChi}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{field?.moTa}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Số lượng sân con: <b>{subFields.length}</b></Typography>
          </Box>
        </Box>
        <Grid container spacing={3}>
          {schedules.length === 0 && (
            <Grid item xs={12}><Alert severity="info">Không có khung giờ nào cho sân này.</Alert></Grid>
          )}
          {schedules.map((slot, idx) => {
            // Tìm tên sân con từ subFields
            const subField = subFields.find(sf => sf.maSanCon === slot.maSanCon);
            const tenSanCon = subField?.tenSanCon || slot.maSanCon;
            
            return (
            <Grid item xs={12} sm={4} key={slot.mainChiSan}>
              <Fade in timeout={400 + idx * 80}>
                <Card sx={slotCardStyle(selectedSlot === slot)} onClick={() => slot.trangThai === 'AVAILABLE' && setSelectedSlot(slot)}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>{tenSanCon}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Ngày: <b>{slot.thu}</b></Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Khung giờ: <b>{slot.gioBatDau} - {slot.gioKetThuc}</b></Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Loại sân: <b>{slot.LoaiSanCon}</b></Typography>

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
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </Box>
        <Box mt={6}>
          <Typography variant="h5" sx={{ mb: 2 }}>Đánh giá của khách hàng</Typography>
          {evaluates.length === 0 ? (
            <Alert severity="info">Chưa có đánh giá nào cho sân này.</Alert>
          ) : (
            evaluates.map(ev => (
              <Box key={ev.maDanhGia} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={ev.soSao} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 2, fontWeight: 600 }}>
                    {ev.nguoiDung?.hoTen || ev.nguoiDanhGia || 'Ẩn danh'}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: 2, color: 'gray' }}>{ev.ngayDanhGia ? new Date(ev.ngayDanhGia).toLocaleDateString() : ''}</Typography>
                </Box>
                <Typography variant="body1">{ev.binhLuan}</Typography>
              </Box>
            ))
          )}
        </Box>

        {/* Form đánh giá mới */}
        <Box mt={4} sx={{ p: 3, border: '2px solid #1976d2', borderRadius: 3, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
            Chia sẻ trải nghiệm của bạn
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Đánh giá của bạn:
            </Typography>
            <Rating
              value={newRating}
              onChange={(event, newValue) => setNewRating(newValue || 0)}
              size="large"
              sx={{ fontSize: '2rem' }}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bình luận của bạn (tùy chọn)"
              placeholder="Hãy chia sẻ trải nghiệm của bạn về sân bóng này..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              sx={{ bgcolor: 'white' }}
            />
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmitRating}
              disabled={submittingRating || newRating === 0}
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: 2
              }}
            >
              {submittingRating ? <CircularProgress size={24} color="inherit" /> : 'Gửi đánh giá'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
};

export default FieldDetailPage;
