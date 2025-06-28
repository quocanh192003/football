import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, CircularProgress, Alert,
    Chip, Tabs, Tab, ButtonGroup
} from '@mui/material';
import { format } from 'date-fns';

// Maps booking status to chip color
const getStatusChipColor = (status) => {
    switch (status) {
        case 'CONFIRMED':
            return 'success';
        case 'PENDING':
            return 'warning';
        case 'CANCELLED': // Kept for the action, though not displayed in a tab
            return 'error';
        default:
            return 'default';
    }
};

// Maps payment status to chip color
const getPaymentStatusChipColor = (status) => {
    return status === 'PAID' ? 'success' : 'default';
};

const ManageBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Define English statuses for tabs
    const tabStatuses = {
        0: 'PENDING',
        1: 'CONFIRMED', 	

    };
    const [currentTab, setCurrentTab] = useState(tabStatuses[0]);

    // Create a reverse map for finding tab index from status string
    const statusToTabIndex = Object.fromEntries(Object.entries(tabStatuses).map(([k, v]) => [v, parseInt(k)]));

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await axiosInstance.get('/api/order/get-all-order-by-status', {
                params: { status: currentTab }
            });
            if (response.data.isSuccess) {
                setBookings(response.data.result || []);
            } else {
                setBookings([]);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setBookings([]); // If API returns 404, it means no bookings for this status
            } else {
                setError('Failed to fetch bookings. Please try again.');
                setBookings([]);
            }
        } finally {
            setLoading(false);
        }
    }, [currentTab]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(tabStatuses[newValue]);
    };

    // Handles updating booking status (e.g., Confirm, Cancel)
    // Try sending status as 'COMPLETE' or 'CANCELLED' (English, matching API doc)
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setError('');
            setSuccess('');
            // Use status as is (COMPLETE, CANCELLED)
            const response = await axiosInstance.put(`/api/order/confirm-order/${orderId}`, { status: newStatus });
            if (response.data.isSuccess) {
                setSuccess(`Booking status updated to "${newStatus}" successfully!`);
                fetchBookings(); // Refresh list
            } else {
                setError(response.data.errorMessages.join(', '));
                console.error('Update booking status error:', response.data);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError('Failed to update booking status: ' + JSON.stringify(err.response.data));
                console.error('Update booking status error:', err.response.data);
            } else {
                setError('Failed to update booking status.');
            }
        }
    };

    // Handles confirming payment
    const handleConfirmPayment = async (orderId) => {
        try {
            setError('');
            setSuccess('');
            const response = await axiosInstance.put(`/api/order/confirm-payment/${orderId}`);
            if (response.data.isSuccess) {
                setSuccess('Payment confirmed successfully!');
                fetchBookings(); // Refresh list
            } else {
                setError(response.data.errorMessages.join(', '));
            }
        } catch (err) {
            setError('Failed to confirm payment.');
        }
    };

    // Renders action buttons based on booking status
    const renderActionButtons = (booking) => {
        switch (booking.trangThai) {
            case 'PENDING':
                return (
                    <ButtonGroup variant="contained" size="small">
                        <Button color="success" onClick={() => handleUpdateStatus(booking.maDatSan, 'CONFIRM')}>Confirm</Button>
                        <Button color="error" onClick={() => handleUpdateStatus(booking.maDatSan, 'CANCELLED')}>Cancel</Button>
                    </ButtonGroup>
                );
            case 'CONFIRM':
            case 'COMPLETE':
                if (booking.trangThaiTT !== 'PAID') {
                    return (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="small" 
                            onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xác nhận đã nhận thanh toán cho đơn này?')) {
                                    handleConfirmPayment(booking.maDatSan);
                                }
                            }}
                        >
                            Confirm Payment
                        </Button>
                    );
                }
                return null;
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Manage Bookings
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={statusToTabIndex[currentTab]} onChange={handleTabChange} aria-label="booking status tabs">
                        <Tab label="Pending" />
                        <Tab label="Completed" />
                    </Tabs>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Field</TableCell>
                                    <TableCell>Pitch</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Total Price</TableCell>
                                    <TableCell>Booking Status</TableCell>
                                    <TableCell>Payment Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.length > 0 ? bookings.map((booking) => {
                                    const detail = booking.chiTietDonDatSans && booking.chiTietDonDatSans[0];
                                    return (
                                        <TableRow key={booking.maDatSan}>
                                            <TableCell>{booking.maKhachHang || '--'}</TableCell>
                                            <TableCell>{'--'}</TableCell>
                                            <TableCell>{detail?.maSanBong || '--'}</TableCell>
                                            <TableCell>{detail?.maSanCon || '--'}</TableCell>
                                            <TableCell>{safeFormatDate(booking.ngayDat)}</TableCell>
                                            <TableCell>{detail ? `${detail.gioBatDau} - ${detail.gioKetThuc}` : '--'}</TableCell>
                                            <TableCell>{booking.tongTien?.toLocaleString() || '--'} VNĐ</TableCell>
                                            <TableCell>
                                                <Chip label={booking.trangThai} color={getStatusChipColor(booking.trangThai)} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={booking.trangThaiTT} color={getPaymentStatusChipColor(booking.trangThaiTT)} />
                                            </TableCell>
                                            <TableCell>{renderActionButtons(booking)}</TableCell>
                                        </TableRow>
                                    );
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">No bookings found for this status.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Container>
    );
};

// Helper: safely format date string, fallback to '--' if invalid
function safeFormatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '--' : format(d, 'dd/MM/yyyy');
}
// Helper: safely format time range, fallback to '--' if invalid
function safeTimeRange(start, end) {
    if (!start || !end) return '--';
    return `${start} - ${end}`;
}

export default ManageBookingsPage;
