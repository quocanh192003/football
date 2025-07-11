import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, CircularProgress, Box, Alert } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const StaffFieldListPage = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      try {
        // Lấy danh sách sân bóng mà nhân viên được phân công quản lý
        const res = await axiosInstance.get('/api/football/get-football-by-staff');
        if (res.data.isSuccess) {
          setFields(res.data.result || []);
        } else {
          setError('Không có sân bóng nào được phân công cho bạn.');
          setFields([]);
        }
      } catch (err) {
        setError('Không thể tải danh sách sân bóng được phân công.');
        console.error('Error fetching staff fields:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom textAlign="center">
        Danh sách sân được phân công
      </Typography>
      
      {fields.length === 0 && !loading && !error && (
        <Alert severity="info" sx={{ mt: 4, textAlign: 'center' }}>
          Bạn chưa được phân công quản lý sân bóng nào.
        </Alert>
      )}
      
      <Grid container spacing={4} justifyContent="center">
        {fields.map(field => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={field.maSanBong}>
            <Card sx={{ width: 280, height: 400, display: 'flex', flexDirection: 'column', boxShadow: 3, mx: 'auto', borderRadius: 3, overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="140"
                image={field.hinhAnhs?.[0]?.urlHinhAnh || '/default-field.jpg'}
                alt={field.tenSanBong}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                <Box>
                  <Typography variant="h6" color="success.main" fontWeight={600} sx={{ fontSize: 18, mb: 1 }}>
                    {field.tenSanBong}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📍 {field.diaChi}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📞 {field.soDienThoai}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1, 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '2.4em'
                    }}
                  >
                    {field.moTa || 'Không có mô tả'}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    Số sân con: {field.soLuongSan}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2, fontWeight: 700, letterSpacing: 1, borderRadius: 2, boxShadow: 2 }}
                  onClick={() => navigate(`/staff/fields/${field.maSanBong}`)}
                >
                  QUẢN LÝ SÂN
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default StaffFieldListPage; 