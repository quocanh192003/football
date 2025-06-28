import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';
import './HomeFooter.css';

const HomeFooter = () => (
    <Box component="footer" className="home-footer">
        <Container maxWidth="lg">
            <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" gutterBottom>Sân Bóng Online</Typography>
                    <Typography variant="body2" color="#ccc">Nền tảng đặt sân bóng đá hàng đầu Việt Nam.</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" gutterBottom>Liên kết nhanh</Typography>
                    <Link href="/" className="footer-link" display="block">Trang chủ</Link>
                    <Link href="/about" className="footer-link" display="block">Giới thiệu</Link>
                    <Link href="/fields" className="footer-link" display="block">Sân bóng</Link>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" gutterBottom>Liên hệ</Typography>
                    <Typography variant="body2" color="#ccc">Email: support@sanbongonline.vn</Typography>
                    <Typography variant="body2" color="#ccc">Hotline: 1900 1234</Typography>
                </Grid>
            </Grid>
            <Box textAlign="center" pt={4} mt={4} borderTop={1} borderColor="#444">
                <Typography variant="body2" color="#ccc">&copy; {new Date().getFullYear()} Sân Bóng Online. All Rights Reserved.</Typography>
            </Box>
        </Container>
    </Box>
);

export default HomeFooter;
