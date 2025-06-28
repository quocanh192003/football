import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [userCount, setUserCount] = useState(0);
    const [ownerCount, setOwnerCount] = useState(0);
    const [fieldCount, setFieldCount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch all users
                const userRes = await axiosInstance.get('/api/admin/get-all');
                let users = [];
                if (userRes.data && userRes.data.isSuccess && Array.isArray(userRes.data.result)) {
                    users = userRes.data.result;
                    setUserCount(users.length);
                    setOwnerCount(users.filter(u => u.role === 'CHỦ SÂN').length);
                }
                // Fetch all fields
                const fieldRes = await axiosInstance.get('/api/football/get-all-football');
                if (fieldRes.data && fieldRes.data.isSuccess && Array.isArray(fieldRes.data.result)) {
                    setFieldCount((fieldRes.data.result || []).length);
                }
            } catch (err) {
                setError('Failed to fetch statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Thống kê hệ thống
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                {loading ? <CircularProgress /> : (
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                <PeopleIcon color="primary" sx={{ fontSize: 50, mr: 2 }} />
                                <CardContent>
                                    <Typography variant="h6">Tổng người dùng</Typography>
                                    <Typography variant="h4">{userCount}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                <SupervisorAccountIcon color="success" sx={{ fontSize: 50, mr: 2 }} />
                                <CardContent>
                                    <Typography variant="h6">Tổng chủ sân</Typography>
                                    <Typography variant="h4">{ownerCount}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                <SportsSoccerIcon color="warning" sx={{ fontSize: 50, mr: 2 }} />
                                <CardContent>
                                    <Typography variant="h6">Tổng sân bóng</Typography>
                                    <Typography variant="h4">{fieldCount}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default AdminDashboard;
