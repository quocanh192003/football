import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const getDayOfWeekInVietnamese = (date) => {
    const dayIndex = new Date(date).getDay();
    // In JS, Sunday is 0. In Vietnamese calendar, Monday is 'Thứ 2'.
    if (dayIndex === 0) return 'Chủ nhật'; // Sunday
    return `Thứ ${dayIndex + 1}`;
};

const BookingConfirmationPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { bookingDetails } = state || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1); // 1: confirm, 2: payment
    const [paymentMethod, setPaymentMethod] = useState('Thanh toán tại sân');

    const handleConfirmBooking = () => {
        setStep(2);
    };

    const handlePaymentAndBook = async () => {
        const payload = {
            phuongThucTT: paymentMethod,
            dsSanCon: [
                {
                    maSanBong: bookingDetails.fieldId,
                    maSanCon: bookingDetails.pitchId,
                    thu: getDayOfWeekInVietnamese(bookingDetails.date),
                    gioBatDau: bookingDetails.startTime,
                    gioKetThuc: bookingDetails.endTime,
                },
            ],
        };
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const response = await axiosInstance.post('/api/order/create-order', payload);
            if (response.data.isSuccess) {
                setSuccess('Booking successful! You will be redirected shortly.');
                setTimeout(() => {
                    navigate('/customer/bookings');
                }, 3000);
            } else {
                setError(response.data.errorMessages.join(', '));
            }
        } catch (err) {
            setError('An unexpected error occurred during booking.');
        } finally {
            setLoading(false);
        }
    };

    if (!bookingDetails) {
        return (
            <Container>
                <Alert severity="error">No booking details found. Please start over.</Alert>
                <Button onClick={() => navigate('/customer')}>Go to Dashboard</Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Confirm Your Booking
                </Typography>
                <Paper elevation={3} sx={{ p: 3 }}>
                    {step === 1 && (
                        <>
                            <List disablePadding>
                                <ListItem>
                                    <ListItemText primary="Sân bóng" secondary={bookingDetails.fieldName} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="Sân con" secondary={bookingDetails.pitchName} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="Ngày" secondary={new Date(bookingDetails.date).toLocaleDateString('vi-VN')} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="Thời gian" secondary={`${bookingDetails.startTime} - ${bookingDetails.endTime}`} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="Giá" secondary={`${bookingDetails.price.toLocaleString()} VNĐ`} />
                                </ListItem>
                            </List>
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleConfirmBooking}
                                >
                                    Xác nhận & Tiếp tục thanh toán
                                </Button>
                            </Box>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <FormControl component="fieldset" sx={{ mb: 3 }}>
                                <FormLabel component="legend">Chọn phương thức thanh toán</FormLabel>
                                <RadioGroup
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                >
                                    <FormControlLabel value="Thanh toán tại sân" control={<Radio />} label="Thanh toán tại sân" />
                                    <FormControlLabel value="Chuyển khoản" control={<Radio />} label="Chuyển khoản" />
                                </RadioGroup>
                            </FormControl>
                            {paymentMethod === 'Chuyển khoản' && (
                                <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fafafa', textAlign: 'center' }}>
                                    <Typography variant="subtitle1" fontWeight={600}>Thông tin chuyển khoản</Typography>
                                    <Typography>Ngân hàng: <b>Vietcombank</b></Typography>
                                    <Typography>Số tài khoản: <b>0123456789</b></Typography>
                                    <Typography>Chủ tài khoản: <b>Nguyễn Văn A</b></Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <img src="https://img.vietqr.io/image/VCB-0123456789-compact2.png" alt="QR chuyển khoản" style={{ width: 180, borderRadius: 8 }} />
                                    </Box>
                                    <Typography sx={{ mt: 1, color: 'gray', fontSize: 13 }}>
                                        Nội dung: <b>DatSan_{bookingDetails?.fieldName}</b>
                                    </Typography>
                                </Box>
                            )}
                            <Box sx={{ textAlign: 'center' }}>
                                {loading ? (
                                    <CircularProgress />
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="large"
                                        onClick={handlePaymentAndBook}
                                        disabled={!!success}
                                    >
                                        {paymentMethod === 'Chuyển khoản' ? 'Tôi đã chuyển khoản & Đặt sân' : 'Xác nhận thanh toán & Đặt sân'}
                                    </Button>
                                )}
                                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default BookingConfirmationPage;
