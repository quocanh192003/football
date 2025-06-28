import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Link } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import './HomeHeader.css';

const HomeHeader = ({ transparent = false }) => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (!transparent) return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [transparent]);

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <AppBar position="sticky" color="transparent" className={transparent ? `home-header ${scrolled ? 'scrolled' : ''}` : 'home-header scrolled'} elevation={0}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <SportsSoccerIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Sân Bóng Online
                    </Typography>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <Link component="button" onClick={() => handleNavigate('/')} className="nav-link">Trang chủ</Link>
                        <Link component="button" onClick={() => handleNavigate('/about')} className="nav-link">Giới thiệu</Link>
                        <Link component="button" onClick={() => handleNavigate('/fields')} className="nav-link">Sân bóng</Link>
                        <Button variant="outlined" color="inherit" sx={{ mr: 1, ml: 2 }} onClick={() => handleNavigate('/login')}>Đăng nhập</Button>
                        <Button variant="contained" color="success" onClick={() => handleNavigate('/register')}>Đăng ký</Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default HomeHeader;
