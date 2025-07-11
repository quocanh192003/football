import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    Box,
    Button,
    Divider,
    Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';

const drawerWidth = 240;

const NavList = ({ role }) => {
    const navigate = useNavigate();
    const roleItems = {
        ADMIN: [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
            { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
            { text: 'Field Approvals', icon: <SportsSoccerIcon />, path: '/admin/approvals' },
        ],
        'CHỦ SÂN': [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/owner' },
            { text: 'My Fields', icon: <SportsSoccerIcon />, path: '/owner/fields' },
            { text: 'Staff Management', icon: <AssignmentIndIcon />, path: '/owner/staff' },
        ],
        'NHÂN VIÊN': [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/staff' },
            { text: 'Manage Bookings', icon: <AssignmentIndIcon />, path: '/staff/manage-bookings' },
            { text: 'Confirm Payment', icon: <AssignmentIndIcon color="success" />, path: '/staff/confirm-payment' },
        ],
        'KHÁCH HÀNG': [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/customer' },
            { text: 'My Bookings', icon: <SportsSoccerIcon />, path: '/customer/bookings' },
        ],
    };

    const menuItems = roleItems[role] || [];

    return (
        <List>
            {menuItems.map((item, index) => (
                <ListItem button key={item.text} onClick={() => navigate(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                </ListItem>
            ))}
        </List>
    );
};

const MainLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const drawer = (
        <div>
            <Toolbar />
            <Divider />
            {user && <NavList role={user.role} />}
            <Divider sx={{ my: 2 }} />
            {user && (
                <List>
                    <ListItem button onClick={() => {
                        if (user?.role === 'ADMIN') navigate('/admin/profile');
                        else if (user?.role === 'CHỦ SÂN') navigate('/owner/profile');
                        else if (user?.role === 'NHÂN VIÊN') navigate('/staff/profile');
                        else if (user?.role === 'KHÁCH HÀNG') navigate('/customer/profile');
                    }}>
                        <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                        <ListItemText primary="Edit Profile" />
                    </ListItem>
                </List>
            )}
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SportsFootballIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                        <Box>
                            <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                Sân bóng 24h
                            </Typography>
                            <Typography variant="caption" component="div" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: 1 }}>
                                {user?.role}
                            </Typography>
                        </Box>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                            sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: 'primary.light',
                                fontSize: '14px',
                                fontWeight: 600
                            }}
                        >
                            {(user?.fullName || user?.hoTen || user?.username || user?.email || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, fontSize: 16, color: 'white' }}>
                            {user?.fullName || user?.hoTen || user?.username || user?.email || 'User'}
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{ 
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                     }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;
