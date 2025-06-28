import React, { useState, useEffect } from 'react';
import Rating from '@mui/material/Rating';
import { Modal, TextField } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, Typography, Box, Alert } from '@mui/material';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal state
    const [open, setOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch bookings and all pitches in parallel
                const [bookingsResponse, pitchesResponse] = await Promise.all([
                    axiosInstance.get('/api/order/get-order-by-id-user'),
                    axiosInstance.get('/api/football/get-all-detailfootball')
                ]);

                if (bookingsResponse.data.isSuccess && pitchesResponse.data.isSuccess) {
                    const orders = bookingsResponse.data.result || [];
                    const pitches = pitchesResponse.data.result || [];

                    // Create a lookup map for pitch names
                    const pitchNameMap = pitches.reduce((map, pitch) => {
                        map[pitch.id] = pitch.tenSanBong;
                        return map;
                    }, {});

                    // Flatten the booking data and add pitch names
                    const flattenedBookings = orders.flatMap(order =>
                        order.chiTietDonDatSans.map(detail => ({
                            bookingDetailId: detail.id,
                            orderId: order.maDatSan,
                            pitchId: detail.maSanBong,
                            pitchName: pitchNameMap[detail.maSanBong] || 'Unknown Pitch',
                            orderDate: order.ngayDat,
                            dayOfWeek: detail.thu,
                            startTime: detail.gioBatDau,
                            endTime: detail.gioKetThuc,
                            status: order.trangThai,
                        }))
                    ).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Sort by most recent

                    setBookings(flattenedBookings);
                } else {
                    // Handle cases where one or both API calls might fail
                    const errorMsg = bookingsResponse.data.errorMessages?.join(', ') || pitchesResponse.data.errorMessages?.join(', ') || 'An error occurred';
                    setError(errorMsg);
                    setBookings([]);
                }

            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error(err);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleOpenRateModal = (booking) => {
        setSelectedBooking(booking);
        setRating(0);
        setComment('');
        setOpen(true);
    };

    const handleCloseRateModal = () => {
        setOpen(false);
        setSelectedBooking(null);
    };

    const handleCancelBooking = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                const response = await axiosInstance.put(`/api/order/cancel-order/${orderId}`, { status: 'YEUCAUHUY' });
                if (response.data.isSuccess) {
                    setSuccess('Cancellation request sent successfully.');
                    // Optimistically update UI to reflect the new status
                    setBookings(prev => prev.map(b => b.orderId === orderId ? { ...b, status: 'YEUCAUHUY' } : b));
                } else {
                    setError(response.data.errorMessages.join(', '));
                }
            } catch (err) {
                setError('Failed to cancel booking.');
                console.error(err);
            }
        }
    };

    const handleSubmitRating = async () => {
        if (!selectedBooking) return;
        try {
            const response = await axiosInstance.post(`/api/create-evaluate/${selectedBooking.pitchId}`,
              {
                soSao: rating,
                binhLuan: comment
              }
            );
            if (response.data.isSuccess) {
                setSuccess('Rating submitted successfully.');
                handleCloseRateModal();
                // Optimistically update UI to prevent re-rating
                setBookings(prev => prev.map(b => 
                    b.bookingDetailId === selectedBooking.bookingDetailId ? { ...b, isRated: true } : b
                ));
            } else {
                setError(response.data.errorMessages.join(', '));
            }
        } catch (err) {
            setError('Failed to submit rating.');
            console.error(err);
        }
    };

    if (loading) {
        return <Typography sx={{ p: 3 }}>Loading...</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>My Bookings</Typography>
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Pitch Name</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookings.length > 0 ? bookings.map((booking) => {
                            const isPast = true; // Luôn cho phép đánh giá để test
                            return (
                                <TableRow key={booking.bookingDetailId}>
                                    <TableCell>{booking.pitchName}</TableCell>
                                    <TableCell>{new Date(booking.orderDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{`${booking.startTime} - ${booking.endTime}`}</TableCell>
                                    <TableCell>
                                        <Chip label={booking.status} color={booking.status === 'DAXACNHAN' ? 'success' : 'default'} />
                                    </TableCell>
                                    <TableCell>
                                        {!isPast && booking.status === 'DAXACNHAN' && (
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleCancelBooking(booking.orderId)}>
                                                Cancel
                                            </Button>
                                        )}
                                        {isPast && (booking.status === 'DAXACNHAN' || booking.status === 'CONFIRMED') && !booking.isRated && (
                                            <Button size="small" variant="contained" color="primary" onClick={() => handleOpenRateModal(booking)}>
                                                Rate
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No bookings found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={open} onClose={handleCloseRateModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography variant="h6">Rate Your Experience</Typography>
                    <Rating
                        name="simple-controlled"
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue);
                        }}
                    />
                    <TextField
                        label="Comment"
                        multiline
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCloseRateModal}>Cancel</Button>
                        <Button onClick={handleSubmitRating} variant="contained" sx={{ ml: 1 }}>Submit</Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default MyBookingsPage;
