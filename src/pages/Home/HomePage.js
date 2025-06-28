import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Container, Box, Grid, Card, CardMedia, CardContent, Paper } from '@mui/material';
import Slider from 'react-slick';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentIcon from '@mui/icons-material/Payment';
import HomeHeader from '../../components/HomeHeader';
import HomeFooter from '../../components/HomeFooter';
import './HomePage.css';

// --- Mock Data ---
const featuredFields = [
  { id: 1, name: 'Sân bóng Thống Nhất', location: 'Quận 10, TP.HCM', image: 'https://images.unsplash.com/photo-1598426485221-7221b3f86915?q=80&w=1932&auto=format&fit=crop' },
  { id: 2, name: 'Sân cỏ nhân tạo Tao Đàn', location: 'Quận 1, TP.HCM', image: 'https://images.unsplash.com/photo-1551958214-2d59cc744c65?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, name: 'Sân bóng Chảo Lửa', location: 'Quận Tân Bình, TP.HCM', image: 'https://images.unsplash.com/photo-1620405221334-42173b2edc7a?q=80&w=2070&auto=format&fit=crop' },
  { id: 4, name: 'Sân bóng Gia Định', location: 'Quận Gò Vấp, TP.HCM', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop' },
  { id: 5, name: 'Sân bóng Phú Nhuận', location: 'Quận Phú Nhuận, TP.HCM', image: 'https://images.unsplash.com/photo-1526232761621-5a02534f2360?q=80&w=2070&auto=format&fit=crop' },
];

const howItWorksSteps = [
    { icon: <SearchIcon className="step-icon" />, title: 'Tìm kiếm sân bóng', description: 'Dễ dàng tìm sân theo tên, địa điểm hoặc xem các sân gần bạn.' },
    { icon: <EventAvailableIcon className="step-icon" />, title: 'Chọn lịch và đặt sân', description: 'Xem lịch trống, chọn khung giờ phù hợp và đặt sân chỉ với vài cú nhấp chuột.' },
    { icon: <PaymentIcon className="step-icon" />, title: 'Thanh toán an toàn', description: 'Thanh toán tiện lợi, an toàn qua nhiều hình thức khác nhau.' },
];

// --- Animation Variants ---
const sectionVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// --- Reusable Animated Section Component ---
const AnimatedSection = ({ children, sx }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        } else {
            controls.start('hidden');
        }
    }, [controls, inView]);

    return (
        <Box ref={ref} component={motion.div} initial="hidden" animate={controls} variants={sectionVariant} sx={sx}>
            {children}
        </Box>
    );
};



// --- Main HomePage Component ---
const HomePage = () => {
    const navigate = useNavigate();
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <Box className="home-page">
            <HomeHeader transparent={true} />

            {/* Hero Section */}
            <Box className="hero-section">
                <div className="hero-overlay"></div>
                <Container maxWidth="md" className="hero-content">
                    <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                            Đặt Sân Dễ Dàng, Trải Nghiệm Đỉnh Cao
                        </Typography>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                        <Typography variant="h5" component="p" color="#eee" mb={4}>
                            Tìm kiếm và đặt sân bóng đá yêu thích của bạn chỉ trong vài giây.
                        </Typography>
                        <Button variant="contained" color="success" size="large" onClick={() => navigate('/fields')}>Đặt sân ngay</Button>
                    </motion.div>
                </Container>
            </Box>

            {/* Featured Fields Section */}
            <AnimatedSection sx={{ backgroundColor: '#fff' }} id="fields">
                <Container maxWidth="lg" className="home-section">
                    <Typography variant="h4" className="section-title">Sân Bóng Nổi Bật</Typography>
                    <Slider {...sliderSettings}>
                        {featuredFields.map((field) => (
                            <Box key={field.id} p={1}>
                                <Card className="field-card-featured" onClick={() => navigate('/fields') } sx={{cursor: 'pointer'}}>
                                    <CardMedia component="img" height="200" image={field.image} alt={field.name} />
                                    <CardContent>
                                        <Typography gutterBottom variant="h6" component="div">{field.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{field.location}</Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Slider>
                </Container>
            </AnimatedSection>

            {/* How It Works Section */}
            <AnimatedSection id="about">
                 <Container maxWidth="lg" className="home-section">
                    <Typography variant="h4" className="section-title">Đặt Sân Chỉ Với 3 Bước</Typography>
                    <Grid container spacing={4}>
                        {howItWorksSteps.map((step, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <div className="step-card">
                                    {step.icon}
                                    <Typography variant="h6" component="h3" gutterBottom>{step.title}</Typography>
                                    <Typography variant="body1" color="text.secondary">{step.description}</Typography>
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </AnimatedSection>

            {/* Testimonials Section */}
            <AnimatedSection sx={{ backgroundColor: '#fff' }}>
                <Container maxWidth="lg" className="home-section">
                    <Typography variant="h4" className="section-title">Khách Hàng Nói Gì Về Chúng Tôi</Typography>
                    {/* This would ideally be a slider as well */}
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body1" fontStyle="italic">"Ứng dụng tuyệt vời! Tôi đã đặt được sân cho đội chỉ trong 5 phút. Giao diện thân thiện và dễ sử dụng."</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" mt={2}>- Anh Minh Tuấn</Typography>
                            </Paper>
                        </Grid>
                         <Grid item xs={12} md={4}>
                            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body1" fontStyle="italic">"Giá cả rất cạnh tranh và có nhiều sân để lựa chọn. Tôi chắc chắn sẽ giới thiệu cho bạn bè."</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" mt={2}>- Chị Lan Anh</Typography>
                            </Paper>
                        </Grid>
                         <Grid item xs={12} md={4}>
                            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body1" fontStyle="italic">"Dịch vụ hỗ trợ khách hàng rất nhanh và nhiệt tình. 5 sao cho chất lượng!"</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" mt={2}>- Anh Hoàng Bách</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </AnimatedSection>

            {/* CTA for Owners */}
            <AnimatedSection>
                <Container maxWidth="lg" className="home-section cta-section">
                    <Typography variant="h4" component="h2" fontWeight="bold" color="white" textAlign="center">Trở Thành Đối Tác Của Chúng Tôi</Typography>
                    <Typography variant="h6" color="#eee" textAlign="center" mt={2} mb={4}>Quản lý sân bóng của bạn hiệu quả hơn và tiếp cận hàng ngàn khách hàng mới.</Typography>
                    <Box textAlign="center">
                         <Button variant="contained" color="success" size="large">Đăng ký chủ sân</Button>
                    </Box>
                </Container>
            </AnimatedSection>
            
            <HomeFooter />
        </Box>
    );
};

export default HomePage;
