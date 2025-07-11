import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Grid, Card, CardContent, CardMedia, CircularProgress, Alert, Button, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const CustomerDashboard = () => {
    const [fields, setFields] = useState([]);
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFieldsAndRatings = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/football/get-all-football');
                if (response.data.isSuccess) {
                    const fieldsData = response.data.result || [];
                    setFields(fieldsData);
                    
                    // Fetch ratings for each field
                    const ratingsData = {};
                    await Promise.all(
                        fieldsData.map(async (field) => {
                            try {
                                const ratingResponse = await axiosInstance.get(`/api/get-evaluate-by-id-san-bong/${field.maSanBong}`);
                                if (ratingResponse.data.isSuccess && ratingResponse.data.result && ratingResponse.data.result.length > 0) {
                                    const evaluateData = ratingResponse.data.result[0];
                                    ratingsData[field.maSanBong] = {
                                        averageRating: evaluateData.danhGiaThongKe?.trungBinhSoSao || 0,
                                        totalReviews: evaluateData.danhGiaThongKe?.soLuongDanhGia || 0
                                    };
                                } else {
                                    ratingsData[field.maSanBong] = {
                                        averageRating: 0,
                                        totalReviews: 0
                                    };
                                }
                            } catch (err) {
                                console.error(`Failed to fetch rating for field ${field.maSanBong}:`, err);
                                ratingsData[field.maSanBong] = {
                                    averageRating: 0,
                                    totalReviews: 0
                                };
                            }
                        })
                    );
                    setRatings(ratingsData);
                } else {
                    setError(response.data.errorMessages.join(', '));
                }
            } catch (err) {
                setError('Failed to fetch football fields.');
            } finally {
                setLoading(false);
            }
        };
        fetchFieldsAndRatings();
    }, []);

    const filteredFields = fields.filter(field =>
        field.tenSanBong.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (field) => {
        navigate(`/customer/fields/${field.maSanBong}`);
    };

    if (loading) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    }

    if (error) {
        return <Container><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Find Your Pitch
                </Typography>
                <TextField
                    fullWidth
                    label="Search by field name..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 4 }}
                />
                <Grid container spacing={4}>
                    {filteredFields.length > 0 ? (
                        filteredFields.map((field) => (
                            <Grid item key={field.maSanBong} xs={12} sm={6} md={4}>
                                <Card sx={{ height: 430, width: 300 ,display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 3 }}>
                                    <CardMedia
                                        component="img"
                                        height="160"
                                        image={(Array.isArray(field.hinhAnhs) && field.hinhAnhs[0]?.urlHinhAnh) || 'https://co-nhan-tao.com/wp-content/uploads/2019/12/thiet-ke-san-co-nhan-tao-14.jpg'}
                                        alt={field.tenSanBong}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                        <Typography gutterBottom variant="h5" component="h2" sx={{ fontSize: 20, fontWeight: 600, minHeight: 32 }}>
                                            {field.tenSanBong}
                                        </Typography>
                                        <Typography sx={{ fontSize: 15, color: 'text.secondary', minHeight: 24 }}>Địa chỉ:
                                            {field.diaChi}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            📞 {field.soDienThoai}
                                        </Typography>
                                        <Typography sx={{ fontSize: 15, color: 'text.secondary', minHeight: 24 }}>Mô tả:
                                            {field.moTa || 'No description available.'}
                                        </Typography>
                                       
                                                          
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Rating 
                                                value={ratings[field.maSanBong]?.averageRating || 0} 
                                                readOnly 
                                                precision={0.1}
                                                size="small"
                                            />
                                            <Typography sx={{ ml: 1, fontSize: 14, color: 'text.secondary' }}>
                                                {ratings[field.maSanBong]?.averageRating ? 
                                                    `${ratings[field.maSanBong].averageRating.toFixed(1)} (${ratings[field.maSanBong].totalReviews} đánh giá)` : 
                                                    'Chưa có đánh giá'
                                                }
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <Box sx={{ p: 2, pt: 0 }}>
                                        <Button size="small" variant="contained" fullWidth onClick={() => handleViewDetails(field)}>
                                            View Details & Book
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography sx={{ ml: 2 }}>No fields found matching your search.</Typography>
                    )}
                </Grid>
            </Box>
        </Container>
    );
};

export default CustomerDashboard;
