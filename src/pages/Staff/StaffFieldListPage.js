import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, Button, CircularProgress, Box, Alert } from '@mui/material';
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
        const res = await axiosInstance.get('/api/football/get-all-football');
        setFields(res.data.result || []);
      } catch (err) {
        setError('Không thể tải danh sách sân bóng.');
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>Chọn sân để đặt</Typography>
      <Grid container spacing={3}>
        {fields.map(field => (
          <Grid item xs={12} sm={6} md={4} key={field.maSanBong}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main" fontWeight={600}>{field.tenSanBong}</Typography>
                <Typography variant="body2" color="text.secondary">{field.diaChi}</Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/staff/fields/${field.maSanBong}`)}
                >
                  Đặt sân
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