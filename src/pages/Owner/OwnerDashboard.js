import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Grid, Card, CardContent, Button, Divider, List, 
    ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, IconButton, Paper, Avatar, Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import axiosInstance from '../../api/axiosInstance';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAuth } from '../../contexts/AuthContext';

// Mock data for the revenue chart - will be replaced by API data
// const revenueData = [
//     { name: 'Jan', revenue: 4000 },
//     { name: 'Feb', revenue: 3000 },
//     { name: 'Mar', revenue: 5000 },
//     { name: 'Apr', revenue: 4500 },
//     { name: 'May', revenue: 6000 },
//     { name: 'Jun', revenue: 5500 },
// ];

const StatCard = ({ icon, title, value, color }) => (
    <Card elevation={3} sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: '12px' }}>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
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

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState({ fields: 0, bookingsToday: 0, revenueToday: 0, staff: 0 });
    const [fields, setFields] = useState([]);
    const [staff, setStaff] = useState([]);
    const [revenueChartData, setRevenueChartData] = useState([]);
    const [revenueToday, setRevenueToday] = useState(0);
    const [bookingsToday, setBookingsToday] = useState(0);
    const [addPitchError, setAddPitchError] = useState('');
    const [addPitchSuccess, setAddPitchSuccess] = useState('');
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Staff - lấy nhân viên theo mã chủ sân
                const staffRes = await axiosInstance.get('/api/get-employee-by-chusan');
                const staffList = staffRes.data.result || [];
                setStaff(staffList.map(s => ({
                    name: s.hoTen || s.fullName || s.tenNhanVien || s.name || 'No Name',
                    status: s.status || s.trangThai || 'Active',
                    email: s.email || '',
                    phone: s.soDienThoai || ''
                })));

                // Fields
                const fieldsRes = await axiosInstance.get('/api/football/get-all-football');
                const fieldsData = fieldsRes.data.result || [];
                const maChuSan = user?.id || user?.unique_name || user?.nameid || '';
                const ownerFields = fieldsData.filter(f => String(f.maChuSan) === String(maChuSan));
                setFields(ownerFields.map(f => ({ id: f.id || f.maSanBong, maSanBong: f.maSanBong, name: f.name || f.tenSanBong, address: f.address || f.diaChi, status: f.status || f.trangThai })));

                // Orders: get all CONFIRMED orders
                const ordersRes = await axiosInstance.get('/api/order/get-all-order-by-status', { params: { status: 'CONFIRMED' } });
                const orders = ordersRes.data.result || [];

                // Today's stats
                const today = new Date();
                const todayString = today.toISOString().slice(0, 10); // YYYY-MM-DD
                // Filter orders for today
                const todayOrders = orders.filter(order => {
                    const orderDate = new Date(order.ngayDat);
                    return orderDate.toISOString().slice(0, 10) === todayString;
                });
                const todayBookings = todayOrders.length;
                const todayRevenue = todayOrders
                    .filter(order => order.trangThaiTT === 'Paid')
                    .reduce((sum, order) => sum + Number(order.tongTien || 0), 0);
                setBookingsToday(todayBookings);
                setRevenueToday(todayRevenue);
                setSummary({
                    fields: ownerFields.length,
                    bookingsToday: todayBookings,
                    revenueToday: todayRevenue,
                    staff: staffList.length,
                });
                // Revenue by day for last 7 days (chỉ tính booking đã thanh toán)
                const dailyRevenue = {};
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    const key = d.toISOString().slice(0, 10);
                    dailyRevenue[key] = 0;
                }
                orders.forEach(order => {
                    const orderDate = new Date(order.ngayDat);
                    const orderDateString = orderDate.toISOString().slice(0, 10);
                    // Chỉ cộng doanh thu nếu đã thanh toán
                    if (orderDateString in dailyRevenue && order.trangThaiTT === 'Paid') {
                        dailyRevenue[orderDateString] += Number(order.tongTien || 0);
                    }
                });
                // Prepare chart data for 7 days
                const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => {
                    const d = new Date(date);
                    return {
                        name: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
                        revenue
                    };
                });
                setRevenueChartData(chartData);
            } catch (err) {
                console.error('Lỗi lấy dữ liệu dashboard:', err);
                setSummary({ fields: 0, bookingsToday: 0, revenueToday: 0, staff: 0 });
                setRevenueChartData([]);
            }
        };
        if (user) fetchDashboardData();
    }, [user]);

    // --- State for pitch/schedule management ---
    const [selectedField, setSelectedField] = useState(null);
    const [pitches, setPitches] = useState([]);
    const [selectedPitch, setSelectedPitch] = useState(null);
    const [addPitchDialogOpen, setAddPitchDialogOpen] = useState(false);
    const [slotDialogOpen, setSlotDialogOpen] = useState(false);
    const [newPitch, setNewPitch] = useState({ tenSanBongCon: '', loaiSan: '' });
    const [newSlot, setNewSlot] = useState({ ngay: '', thoiGianBatDau: '', thoiGianKetThuc: '', gia: '' });

    // --- Handlers for pitch dialog ---
    const handleOpenPitchDialog = async (field) => {
        setSelectedField(field);
        setSelectedPitch(null);
        setAddPitchDialogOpen(false);
        setSlotDialogOpen(false);
        setNewPitch({ tenSanBongCon: '', loaiSan: '' });
        setNewSlot({ ngay: '', thoiGianBatDau: '', thoiGianKetThuc: '', gia: '' });
        // Fetch pitches for this field
        try {
            const res = await axiosInstance.get(`/api/football/get-football-child/${field.id || field.maSanBong}`);
            const pitchList = res.data.result || [];
            // Fetch slots for each pitch
            const pitchesWithSlots = await Promise.all(pitchList.map(async (pitch) => {
                const slotRes = await axiosInstance.get(`/api/football/get-schedule/${pitch.id || pitch.maSanCon}`);
                return {
                    ...pitch,
                    timeSlots: slotRes.data.result || [],
                };
            }));
            setPitches(pitchesWithSlots);
        } catch (err) {
            setPitches([]);
        }
    };
    const handleClosePitchDialog = () => {
        setSelectedField(null);
        setPitches([]);
    };

    // --- Handlers for add pitch dialog ---
    const handleOpenAddPitchDialog = () => setAddPitchDialogOpen(true);
    const handleCloseAddPitchDialog = () => {
        setAddPitchDialogOpen(false);
        setNewPitch({ tenSanBongCon: '', loaiSan: '' });
    };
    const handleAddPitch = async () => {
        setAddPitchError('');
        setAddPitchSuccess('');
        if (!newPitch.tenSanBongCon || !newPitch.loaiSan) {
            setAddPitchError('Vui lòng nhập đầy đủ tên sân con và loại sân!');
            return;
        }
        try {
            // Tìm số thứ tự tiếp theo cho sân con
            let nextIndex = 1;
            if (pitches && pitches.length > 0) {
                const numbers = pitches
                    .map(p => {
                        const match = (p.maSanCon || '').match(/_san(\d+)$/);
                        return match ? parseInt(match[1], 10) : null;
                    })
                    .filter(n => n !== null);
                if (numbers.length > 0) {
                    nextIndex = Math.max(...numbers) + 1;
                }
            }
            const newMaSanCon = `${selectedField.maSanBong}_san${nextIndex}`;
            await axiosInstance.post('/api/football/create-detailfootball', {
                maSanBong: selectedField.maSanBong,
                maSanCon: newMaSanCon,
                tenSanCon: `${selectedField.name} - ${newPitch.tenSanBongCon}`,
                loaiSanCon: newPitch.loaiSan,
                trangThaiSan: 'AVAILABLE',
            });
            setAddPitchSuccess('Thêm sân con thành công!');
            handleCloseAddPitchDialog();
            setNewPitch({ tenSanBongCon: '', loaiSan: '' });
            setAddPitchError('');
            // Reload pitches
            handleOpenPitchDialog(selectedField);
        } catch (err) {
            setAddPitchError('Không thể thêm sân con. Vui lòng thử lại!');
        }
    };

    // --- Handlers for slot dialog ---
    const handleOpenSlotDialog = (pitch) => {
        setSelectedPitch(pitch);
        setSlotDialogOpen(true);
        setNewSlot({ ngay: '', thoiGianBatDau: '', thoiGianKetThuc: '', gia: '' });
    };
    const handleCloseSlotDialog = () => {
        setSlotDialogOpen(false);
        setSelectedPitch(null);
        setNewSlot({ ngay: '', thoiGianBatDau: '', thoiGianKetThuc: '', gia: '' });
    };
    const handleAddSlot = async () => {
        if (!newSlot.ngay || !newSlot.thoiGianBatDau || !newSlot.thoiGianKetThuc || !newSlot.gia) return;
        try {
            // Parse ngày và giờ sang Date object
            const date = new Date(newSlot.ngay);
            const [startHour, startMinute] = newSlot.thoiGianBatDau.split(':').map(Number);
            const [endHour, endMinute] = newSlot.thoiGianKetThuc.split(':').map(Number);
            const startDateTime = new Date(date);
            startDateTime.setHours(startHour, startMinute, 0, 0);
            const endDateTime = new Date(date);
            endDateTime.setHours(endHour, endMinute, 0, 0);
            // Lấy thứ trong tuần (tiếng Việt)
            const daysVN = ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
            const thu = daysVN[date.getDay()];
            await axiosInstance.post('/api/create-schedule', {
                maChiSan: 'MCS' + Date.now(),
                maSanCon: selectedPitch.id || selectedPitch.maSanCon,
                maSanBong: selectedField.id || selectedField.maSanBong,
                thu,
                gioBatDau: { ticks: startDateTime.getTime() },
                gioKetThuc: { ticks: endDateTime.getTime() },
                giaThue: Number(newSlot.gia),
            });
            handleCloseSlotDialog();
            // Reload pitches and slots
            handleOpenPitchDialog(selectedField);
        } catch (err) {
            alert('Không thể thêm lịch trống');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Owner Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Welcome back! Here's an overview of your business.
            </Typography>
            <Divider sx={{ my: 3 }} />

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<SportsSoccerIcon />} title="Total Fields" value={fields.length} color="#1976d2" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<AssessmentIcon />} title="Bookings Today" value={bookingsToday} color="#f57c00" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<AttachMoneyIcon />} title="Revenue Today" value={`${revenueToday.toLocaleString('vi-VN')}đ`} color="#388e3c" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<PeopleIcon />} title="Total Staff" value={staff.length} color="#7b1fa2" />
                </Grid>
            </Grid>

            {/* Main Content */}
            <Grid container spacing={3}>
                {/* Revenue Chart */}
                <Grid item xs={12} md={8}>
                    <Card elevation={3} sx={{ p: 2, borderRadius: '12px' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Revenue Overview</Typography>
                            <Box sx={{ height: 300 }}>
                                {revenueChartData.length === 0 || revenueChartData.every(d => d.revenue === 0) ? (
                                    <Typography color="text.secondary" align="center" sx={{ mt: 10 }}>
                                        Không có dữ liệu
                                    </Typography>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={revenueChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 'auto']} allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                {/* Staff List */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ borderRadius: '12px', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Staff Members</Typography>
                            <List>
                                {staff.length === 0 ? (
                                    <ListItem><ListItemText primary="No staff found" /></ListItem>
                                ) : staff.map((s, index) => (
                                    <ListItem key={index} divider>
                                        <ListItemText 
                                            primary={s.name} 
                                            secondary={
                                                <Box component="div">
                                                    {s.email && <Typography variant="body2" color="text.secondary">Email: {s.email}</Typography>}
                                                    {s.phone && <Typography variant="body2" color="text.secondary">Phone: {s.phone}</Typography>}
                                                    {s.status && <Typography variant="body2" color="primary">Status: {s.status}</Typography>}
                                                </Box>
                                            } 
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Fields List */}
                <Grid item xs={12}>
                    <Card elevation={3} sx={{ p: 2, borderRadius: '12px' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>My Fields</Typography>
                            <List>
                                {fields.map((field) => (
                                    <ListItem >
                                        <ListItemText 
                                            primary={field.name} 
                                            secondary={`${field.address} - Status: ${field.status}`} 
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* All Dialogs for managing pitches and slots */}
            {/* ... Your existing dialogs will go here, unchanged ... */}
            {/* Dialog for Pitch Management */}
            <Dialog open={!!selectedField} onClose={handleClosePitchDialog} fullWidth maxWidth="md">
                <DialogTitle>Quản lý sân con của: {selectedField?.name}</DialogTitle>
                <DialogContent>
                    <Button startIcon={<AddIcon />} onClick={handleOpenAddPitchDialog}>Thêm sân con</Button>
                    <List>
                        {pitches.map(pitch => (
                            <Box key={pitch.id || pitch.maSanCon} sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2 }}>
                                <Typography variant="h6">{pitch.tenSanCon || pitch.name} ({pitch.loaiSanCon || pitch.type})</Typography>
                                <Button onClick={() => handleOpenSlotDialog(pitch)}>Thêm lịch trống</Button>
                                <List>
                                    {pitch.timeSlots && pitch.timeSlots.map(slot => (
                                        <ListItem key={slot.id || slot.maChiSan}>
                                            <ListItemText primary={`${slot.thu}, ${new Date(slot.gioBatDau.ticks).toLocaleTimeString()} - ${new Date(slot.gioKetThuc.ticks).toLocaleTimeString()}`} secondary={`Giá: ${slot.giaThue?.toLocaleString('vi-VN')}đ`} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePitchDialog}>Đóng</Button>
                </DialogActions>
            </Dialog>
            {/* Dialog to Add Pitch */}
            <Dialog open={addPitchDialogOpen} onClose={handleCloseAddPitchDialog}>
                <DialogTitle>Thêm sân con mới</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Tên sân con" type="text" fullWidth
                        value={newPitch.tenSanBongCon} onChange={e => setNewPitch({ ...newPitch, tenSanBongCon: e.target.value })}
                    />
                    <TextField
                        margin="dense" label="Loại sân (e.g., 5v5, 7v7)" type="text" fullWidth
                        value={newPitch.loaiSan} onChange={e => setNewPitch({ ...newPitch, loaiSan: e.target.value })}
                    />
                    {addPitchError && <Typography color="error" sx={{ mt: 1 }}>{addPitchError}</Typography>}
                    {addPitchSuccess && <Alert severity="success" sx={{ mt: 1 }}>{addPitchSuccess}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddPitchDialog}>Hủy</Button>
                    <Button onClick={handleAddPitch} variant="contained">Tạo sân con</Button>
                </DialogActions>
            </Dialog>
            {/* Dialog to Add Slot */}
            <Dialog open={slotDialogOpen} onClose={handleCloseSlotDialog}>
                <DialogTitle>Thêm lịch trống cho: {selectedPitch?.tenSanCon || selectedPitch?.name}</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Ngày" type="date" fullWidth InputLabelProps={{ shrink: true }}
                        value={newSlot.ngay} onChange={e => setNewSlot({ ...newSlot, ngay: e.target.value })}
                    />
                    <TextField margin="dense" label="Giờ bắt đầu" type="time" fullWidth InputLabelProps={{ shrink: true }}
                        value={newSlot.thoiGianBatDau} onChange={e => setNewSlot({ ...newSlot, thoiGianBatDau: e.target.value })}
                    />
                    <TextField margin="dense" label="Giờ kết thúc" type="time" fullWidth InputLabelProps={{ shrink: true }}
                        value={newSlot.thoiGianKetThuc} onChange={e => setNewSlot({ ...newSlot, thoiGianKetThuc: e.target.value })}
                    />
                    <TextField margin="dense" label="Giá thuê" type="number" fullWidth
                        value={newSlot.gia} onChange={e => setNewSlot({ ...newSlot, gia: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSlotDialog}>Hủy</Button>
                    <Button onClick={handleAddSlot}>Thêm</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OwnerDashboard;
