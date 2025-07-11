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
    const [staffFields, setStaffFields] = useState([]); // Sân bóng của nhân viên
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

    // Fetch staff's assigned fields
    const fetchStaffFields = useCallback(async () => {
        try {
            console.log('Fetching staff fields...');
            const response = await axiosInstance.get('/api/football/get-football-by-staff');
            console.log('Staff fields response:', response.data);
            
            if (response.data.isSuccess && Array.isArray(response.data.result)) {
                const fields = response.data.result;
                setStaffFields(fields);
                console.log('Staff assigned fields:', fields.map(f => f.maSanBong));
                return fields;
            } else {
                console.log('No fields assigned to this staff');
                setStaffFields([]);
                return [];
            }
        } catch (err) {
            console.error('Error fetching staff fields:', err);
            setError('Không thể tải danh sách sân được phân công.');
            setStaffFields([]);
            return [];
        }
    }, []);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // Lấy danh sách sân của nhân viên trước
            const assignedFields = await fetchStaffFields();
            
            if (assignedFields.length === 0) {
                console.log('Staff has no assigned fields');
                setBookings([]);
                setLoading(false);
                return;
            }
            
            const assignedFieldIds = assignedFields.map(f => f.maSanBong);
            console.log('Assigned field IDs:', assignedFieldIds);
            
            // Lấy tất cả bookings theo status
            const response = await axiosInstance.get('/api/order/get-all-order-by-status', {
                params: { status: currentTab }
            });
            
            if (response.data.isSuccess) {
                const allBookings = response.data.result || [];
                console.log('All bookings:', allBookings.length);
                console.log('Sample booking structure:', allBookings[0]);
                
                // Lọc chỉ những booking thuộc sân của nhân viên
                const filteredBookings = allBookings.filter(booking => {
                    // Kiểm tra trong chi tiết đơn đặt sân
                    if (booking.chiTietDonDatSans && booking.chiTietDonDatSans.length > 0) {
                        return booking.chiTietDonDatSans.some(detail => 
                            assignedFieldIds.includes(detail.maSanBong)
                        );
                    }
                    
                    // Kiểm tra trực tiếp trên booking nếu có field
                    if (booking.maSanBong) {
                        return assignedFieldIds.includes(booking.maSanBong);
                    }
                    
                    return false;
                });
                
                console.log('Filtered bookings for staff:', filteredBookings.length);
                console.log('Filtered bookings:', filteredBookings);
                
                setBookings(filteredBookings);
                
                // Fetch customer details for each unique customer ID
                const uniqueCustomerIds = [...new Set(filteredBookings.map(b => b.maKhachHang).filter(Boolean))];
                await fetchCustomerDetails(uniqueCustomerIds);
            } else {
                setBookings([]);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
            if (err.response && err.response.status === 404) {
                setBookings([]); // If API returns 404, it means no bookings for this status
            } else {
                setError('Failed to fetch bookings. Please try again.');
                setBookings([]);
            }
        } finally {
            setLoading(false);
        }
    }, [currentTab, fetchStaffFields]);

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
                ) : staffFields.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Bạn chưa được phân công quản lý sân bóng nào. Vui lòng liên hệ quản lý để được phân công.
                    </Alert>
                ) : (
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Hiển thị đơn đặt sân cho các sân được phân công: {staffFields.map(f => f.tenSanBong).join(', ')}
                            </Typography>
                        </Box>
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
                                        <TableCell colSpan={10} align="center">
                                            Không có đơn đặt sân nào với trạng thái "{currentTab}" cho các sân được phân công.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </>
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
