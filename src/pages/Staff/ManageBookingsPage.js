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
    const [customers, setCustomers] = useState({}); // Cache customer data
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
                const bookingsData = response.data.result || [];
                console.log('Booking data structure:', bookingsData[0]); // Debug log
                console.log('Customer fields available:', bookingsData[0] ? Object.keys(bookingsData[0]).filter(key => key.toLowerCase().includes('khach') || key.toLowerCase().includes('customer') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('ten') || key.toLowerCase().includes('ho')) : []);
                setBookings(bookingsData);
                
                // Fetch customer details for each unique customer ID
                const uniqueCustomerIds = [...new Set(bookingsData.map(b => b.maKhachHang).filter(Boolean))];
                await fetchCustomerDetails(uniqueCustomerIds);
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

    // Function to fetch customer details
    const fetchCustomerDetails = async (customerIds) => {
        const customerData = {};
        try {
            let allUsers = [];
            
            // Thử nhiều API endpoints khác nhau
            const apiEndpoints = [
                '/api/User/get-all-user',
                '/api/users/get-all',
                '/api/get-all-users',
                '/api/users',
                '/api/user/get-all'
            ];
            
            for (const endpoint of apiEndpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const response = await axiosInstance.get(endpoint);
                    console.log(`Response from ${endpoint}:`, response.data);
                    
                    if (response.data.isSuccess && response.data.result) {
                        allUsers = response.data.result;
                        console.log(`Successfully got users from ${endpoint}:`, allUsers);
                        break;
                    }
                } catch (err) {
                    console.log(`Failed endpoint ${endpoint}:`, err.response?.status);
                    continue;
                }
            }
            
            if (allUsers.length > 0) {
                for (const customerId of customerIds) {
                    const user = allUsers.find(u => 
                        u.id === customerId || 
                        u.Id === customerId ||
                        u.userId === customerId ||
                        u.UserId === customerId
                    );
                    
                    if (user) {
                        customerData[customerId] = {
                            name: user.hoTen || user.HoTen || user.fullName || user.FullName || user.name || user.Name || user.userName || user.UserName || 'Unknown',
                            phone: user.soDienThoai || user.SoDienThoai || user.phoneNumber || user.PhoneNumber || user.phone || user.Phone || '--'
                        };
                        console.log(`Found customer ${customerId}:`, customerData[customerId]);
                    } else {
                        console.log(`Customer not found: ${customerId}`);
                        customerData[customerId] = {
                            name: customerId.substring(0, 8) + '...',
                            phone: '--'
                        };
                    }
                }
            } else {
                console.log('No users found from any endpoint');
                // Fallback: just show customer ID
                for (const customerId of customerIds) {
                    customerData[customerId] = {
                        name: customerId.substring(0, 8) + '...',
                        phone: '--'
                    };
                }
            }
        } catch (err) {
            console.log('Error fetching customer details:', err);
            // Fallback: just show customer ID
            for (const customerId of customerIds) {
                customerData[customerId] = {
                    name: customerId.substring(0, 8) + '...',
                    phone: '--'
                };
            }
        }
        console.log('Final customer data:', customerData);
        setCustomers(prev => ({ ...prev, ...customerData }));
    };

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
                                    <TableCell>Customer Name</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Pitch</TableCell>
                                    <TableCell>Order Date</TableCell>
                                    <TableCell>Booking Date</TableCell>
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
                                    const customer = customers[booking.maKhachHang];
                                    return (
                                        <TableRow key={booking.maDatSan}>
                                            <TableCell>{customer?.name || booking.tenKhachHang || booking.hoTen || booking.maKhachHang || '--'}</TableCell>
                                            <TableCell>{customer?.phone || booking.soDienThoai || booking.phoneNumber || '--'}</TableCell>
                                            <TableCell>{detail?.maSanCon || '--'}</TableCell>
                                            <TableCell>{safeFormatDate(booking.ngayDat)}</TableCell>
                                            <TableCell>{detail?.ngayDat ? safeFormatDate(detail.ngayDat) : (detail?.ngay ? safeFormatDate(detail.ngay) : (detail?.thu ? detail.thu : '--'))}</TableCell>
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
