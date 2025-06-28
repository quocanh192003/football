import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Button, Paper, List, ListItem, ListItemText, Divider, Rating } from '@mui/material';
import './FieldDetailsPage.css';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import axiosInstance from '../api/axiosInstance';
import { format } from 'date-fns';

const FieldDetailsPage = () => {
    const { fieldId } = useParams();
    const navigate = useNavigate();
    const [field, setField] = useState(null);
    const [availablePitches, setAvailablePitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedPitch, setSelectedPitch] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchFieldDetails = async () => {
            try {
                setLoading(true);
                setError('');
                const fieldRes = await axiosInstance.get(`/api/football/get-football/${fieldId}`);
                const scheduleRes = await axiosInstance.get(`/api/football/${fieldId}/lich-san-trong`);

                let errors = [];
                if (fieldRes.data.isSuccess) {
                    setField(fieldRes.data.result);
                } else {
                    errors.push(fieldRes.data.errorMessages.join(', '));
                }

                if (scheduleRes.data.isSuccess) {
                    setAvailablePitches(scheduleRes.data.result || []);
                } else {
                    errors.push(scheduleRes.data.errorMessages.join(', '));
                }

                if(errors.length > 0) {
                    setError(errors.join(' '));
                } else {
                    // Fetch reviews only if field details were fetched successfully
                    const reviewsRes = await axiosInstance.get(`/api/get-evaluate-by-id-san-bong/${fieldId}`);
                    if (reviewsRes.data.isSuccess) {
                        setReviews(reviewsRes.data.result || []);
                    }
                }

            } catch (err) {
                setError('Failed to fetch field details.');
            } finally {
                setLoading(false);
            }
        };

        fetchFieldDetails();
    }, [fieldId]);

    const handleBooking = (pitch, slot) => {
        const bookingDetails = {
            fieldId: field.id,
            fieldName: field.tenSanBong,
            pitchId: pitch.id,
            pitchName: pitch.tenSanBongCon,
            date: format(selectedDate, 'yyyy-MM-dd'),
            startTime: slot.thoiGianBatDau,
            endTime: slot.thoiGianKetThuc,
            price: slot.gia,
        };
        navigate('/customer/booking-confirmation', { state: { bookingDetails } });
    };

        const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.soSao, 0) / reviews.length : 0;

    const getSlotsForSelectedDate = (pitch) => {
        if (!pitch || !pitch.timeSlots) return [];
        return pitch.timeSlots.filter(slot => format(new Date(slot.ngay), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));
    };

    if (loading) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    }

    if (error) {
        return <Container><Alert severity="error">{error}</Alert></Container>;
    }

    if (!field) {
        return <Container><Alert severity="info">No field data available.</Alert></Container>;
    }

    return (
        <Container maxWidth="lg">
            {/* Banner */}
            <Box className="field-banner">
                <img src={field.hinhAnh || 'https://via.placeholder.com/1200x300.png?text=Football+Field'} alt={field.tenSanBong} />
                <Box className="field-banner-content">
                    <div className="field-banner-title">{field.tenSanBong}</div>
                    <div className="field-banner-address">{field.diaChi}</div>
                </Box>
            </Box>

            {/* Main Info */}
            <Box className="field-main-info">
                <Typography variant="h5" fontWeight={600}>Thông tin sân</Typography>
                <div className="field-rating">
                    <Rating value={averageRating} precision={0.5} readOnly />
                    <Typography sx={{ ml: 1 }}>{averageRating.toFixed(1)} ({reviews.length} đánh giá)</Typography>
                </div>
                <div className="field-description">{field.moTa}</div>
            </Box>

            {/* Booking Section */}
            <Box className="booking-section">
                <div className="booking-title">Đặt lịch sân</div>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 1 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <StaticDatePicker
                                    displayStaticWrapperAs="desktop"
                                    openTo="day"
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                        setSelectedDate(newValue);
                                        setSelectedPitch(null);
                                    }}
                                    minDate={new Date()}
                                />
                            </LocalizationProvider>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <div className="pitch-buttons">
                            {availablePitches.length > 0 ? availablePitches.map(pitch => (
                                <Button
                                    key={pitch.id}
                                    variant={selectedPitch?.id === pitch.id ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedPitch(pitch)}
                                >
                                    {pitch.tenSanBongCon} ({pitch.loaiSan})
                                </Button>
                            )) : <Typography>Chưa có sân con hoặc lịch trống.</Typography>}
                        </div>
                        {selectedPitch && (
                            <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Khung giờ trống cho {selectedPitch.tenSanBongCon} ({format(selectedDate, 'dd/MM/yyyy')})
                                </Typography>
                                <div className="slot-list">
                                    {getSlotsForSelectedDate(selectedPitch).length > 0 ? getSlotsForSelectedDate(selectedPitch).map(slot => (
                                        <Box key={slot.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                                            <Box>
                                                <Typography fontWeight={500}>{slot.thoiGianBatDau} - {slot.thoiGianKetThuc}</Typography>
                                                <Typography color="success.main">{slot.gia.toLocaleString()} VNĐ</Typography>
                                            </Box>
                                            <Button variant="contained" color="success" onClick={() => handleBooking(selectedPitch, slot)}>
                                                Đặt ngay
                                            </Button>
                                        </Box>
                                    )) : (
                                        <Typography color="text.secondary" sx={{ mt: 2 }}>Không có khung giờ trống cho ngày này.</Typography>
                                    )}
                                </div>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </Box>

            {/* Reviews Section */}
            <Box className="review-section">
                <div className="review-title">Đánh giá từ khách hàng</div>
                {reviews.length > 0 ? (
                    <List>
                        {reviews.map((review, index) => (
                            <React.Fragment key={review.id || index}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={<Rating value={review.soSao} readOnly />}
                                        secondary={
                                            <React.Fragment>
                                                <Typography
                                                    sx={{ display: 'inline' }}
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                >
                                                    {review.tenNguoiDung} - {new Date(review.ngayDanhGia).toLocaleDateString()}
                                                </Typography>
                                                {` — ${review.binhLuan}`}
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography color="text.secondary">Chưa có đánh giá nào cho sân này.</Typography>
                )}
            </Box>
        </Container>
    );
};

export default FieldDetailsPage;
