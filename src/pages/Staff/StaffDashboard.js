import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, Divider, List, ListItem, ListItemText, CircularProgress, Alert, Paper, Avatar } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ icon, title, value, color }) => (
    <Card elevation={3} sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: '12px' }}>
        <Avatar sx={{ bgcolor: `${color}.main`, color: 'white', width: 56, height: 56, mr: 2 }}>
            {icon}
        </Avatar>
        <Box>
            <Typography variant="h6" component="p" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="h4" component="p" fontWeight="bold">
                {value}
            </Typography>
        </Box>
    </Card>
);

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalRevenue: 0, confirmed: 0, pending: 0 });
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [pendingRes, confirmedRes] = await Promise.all([
                    axiosInstance.get('/api/order/get-all-order-by-status', { params: { status: 'PENDING' } }),
                    axiosInstance.get('/api/order/get-all-order-by-status', { params: { status: 'CONFIRMED' } })
                ]);

                const pending = pendingRes.data.isSuccess ? pendingRes.data.result : [];
                const confirmed = confirmedRes.data.isSuccess ? confirmedRes.data.result : [];

                let totalRevenue = 0;
                confirmed.forEach(b => {
                    if (b.trangThaiTT === 'Paid' || b.trangThaiTT === 'Đã thanh toán') {
                        totalRevenue += b.tongTien || 0;
                    }
                });

                setStats({
                    totalRevenue,
                    confirmed: confirmed.length,
                    pending: pending.length
                });
                setPendingBookings(pending);

            } catch (err) {
                setError('Could not load dashboard data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Staff Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Manage bookings and stay updated.
            </Typography>
            <Divider sx={{ my: 3 }} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* Stat Cards */}
                    <Grid item xs={12} sm={4}>
                        <StatCard icon={<AttachMoneyIcon />} title="Total Revenue (Confirmed)" value={`${stats.totalRevenue.toLocaleString()} VNĐ`} color="success" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard icon={<EventAvailableIcon />} title="Confirmed Bookings" value={stats.confirmed} color="primary" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard icon={<HourglassEmptyIcon />} title="Pending Bookings" value={stats.pending} color="warning" />
                    </Grid>

                    {/* Quick Actions */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                             <Typography variant="h5" component="h2" gutterBottom>Quick Actions</Typography>
                             <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={() => navigate('/staff/fields')}
                                >
                                    Create New Booking
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<ListAltIcon />}
                                    onClick={() => navigate('/staff/manage-bookings')}
                                >
                                    Manage All Bookings
                                </Button>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Pending Bookings List */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ borderRadius: '12px', height: '100%' }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>Pending Confirmation</Typography>
                                {pendingBookings.length > 0 ? (
                                    <List>
                                        {pendingBookings.slice(0, 5).map((booking) => (
                                            <ListItem key={booking.maDatSan} divider>
                                                <ListItemText 
                                                    primary={`Booking ID: ${booking.maDatSan}`}
                                                    secondary={`Customer ID: ${booking.maKhachHang} - Total: ${booking.tongTien.toLocaleString()} VNĐ`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography color="text.secondary">No pending bookings.</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default StaffDashboard;
