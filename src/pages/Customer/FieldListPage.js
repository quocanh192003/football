import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, TextField, CardMedia, Rating, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const FieldListPage = () => {
  const [fields, setFields] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axiosInstance.get('/api/football/get-all-football');
        setFields(res.data.result || []);
      } catch (e) {
        setFields([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  const filteredFields = fields.filter(f => f.tenSanBong.toLowerCase().includes(search.toLowerCase()));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>Danh sách sân bóng</Typography>
        <TextField
          label="Tìm kiếm sân bóng"
          variant="outlined"
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />
        {loading ? <CircularProgress /> : (
          <Grid container spacing={3}>
            {filteredFields.map(field => (
              <Grid item xs={12} sm={6} md={4} key={field.maSanBong}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={field.hinhAnh || '/default-field.jpg'}
                    alt={field.tenSanBong}
                  />
                  <CardContent>
                    <Typography variant="h6">{field.tenSanBong}</Typography>
                    <Typography color="textSecondary">{field.diaChi}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Rating value={field.rating || 4} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>{field.rating || 4}</Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ mt: 'auto' }}>
                    <Button size="small" variant="contained" onClick={() => navigate(`/customer/fields/${field.maSanBong}`)}>
                      Xem chi tiết
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default FieldListPage;
