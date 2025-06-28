import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Grid, Card, CardContent, CardMedia, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const CustomerDashboard = () => {
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
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={(Array.isArray(field.hinhAnhs) && field.hinhAnhs[0]?.urlHinhAnh) || 'https://co-nhan-tao.com/wp-content/uploads/2019/12/thiet-ke-san-co-nhan-tao-14.jpg'}
                                        alt={field.tenSanBong}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {field.tenSanBong}
                                        </Typography>
                                        <Typography>
                                            {field.diaChi}
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ p: 2 }}>
                                        <Button size="small" variant="contained" onClick={() => handleViewDetails(field)}>
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
