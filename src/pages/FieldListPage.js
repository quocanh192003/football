import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Grid, Card, CardContent, CardMedia, CircularProgress, Alert, Button, Tooltip, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import HomeHeader from '../components/HomeHeader';
import HomeFooter from '../components/HomeFooter';

const FieldListPage = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFields = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/football/get-all-football');
                if (response.data.isSuccess) {
                    setFields(response.data.result || []);
                } else {
                    setError(response.data.errorMessages.join(', '));
                }
            } catch (err) {
                setError('Failed to fetch football fields.');
            } finally {
                setLoading(false);
            }
        };
        fetchFields();
    }, []);

    const filteredFields = fields.filter(field =>
        field.tenSanBong.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (field) => {
        navigate(`/field/${field.maSanBong}`);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
            <HomeHeader />
            <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Tìm Sân Bóng Của Bạn
                    </Typography>
                    <TextField
                        fullWidth
                        label="Tìm kiếm theo tên sân..."
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 4, backgroundColor: 'white' }}
                    />
                    {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>}
                    {error && <Alert severity="error">{error}</Alert>}
                    {!loading && !error && (
                        <Grid container spacing={4}>
                            {filteredFields.length > 0 ? (
                                filteredFields.map((field) => (
                                    <Grid item key={field.maSanBong} xs={12} sm={6} md={4}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }} onClick={() => handleViewDetails(field)}>
                                            <Tooltip title={field.tenSanBong}>
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={(Array.isArray(field.hinhAnhs) && field.hinhAnhs[0]?.urlHinhAnh) || 'https://co-nhan-tao.com/wp-content/uploads/2019/12/thiet-ke-san-co-nhan-tao-14.jpg'}
                                                    alt={field.tenSanBong}
                                                />
                                            </Tooltip>
                                            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                                                <Chip label={field.trangThai === 'ACTIVE' ? 'Đang hoạt động' : 'Chờ duyệt'} color={field.trangThai === 'ACTIVE' ? 'success' : 'warning'} size="small" />
                                            </Box>
                                            <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                                                <Chip label={`Sân con: ${field.soLuongSan || 0}`}
                                                    color="info" size="small" />
                                            </Box>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    {field.tenSanBong}
                                                </Typography>
                                                <Typography color="text.secondary" sx={{ mb: 1 }}>
                                                    {field.diaChi}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                                                    {field.moTa || 'Không có mô tả.'}
                                                </Typography>
                                            </CardContent>
                                            <Box sx={{ p: 2, mt: 'auto' }}>
                                                <Button fullWidth size="small" variant="contained">
                                                    Xem chi tiết & Đặt sân
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Typography sx={{ ml: 2, width: '100%', textAlign: 'center', mt: 4 }}>Không tìm thấy sân bóng nào phù hợp.</Typography>
                            )}
                        </Grid>
                    )}
                </Box>
            </Container>
            <HomeFooter />
        </Box>
    );
};

export default FieldListPage;
