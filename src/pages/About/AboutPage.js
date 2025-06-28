import React from 'react';
import { Box, Container, Typography, Grid, Avatar, Paper } from '@mui/material';
import HomeHeader from '../../components/HomeHeader';
import HomeFooter from '../../components/HomeFooter'; 
import './AboutPage.css';

const teamMembers = [
  { name: 'Trần Văn An', role: 'CEO & Founder', avatar: '/path/to/avatar1.jpg' },
  { name: 'Nguyễn Thị Bình', role: 'CTO', avatar: '/path/to/avatar2.jpg' },
  { name: 'Lê Văn Cường', role: 'Head of Operations', avatar: '/path/to/avatar3.jpg' },
];

const AboutPage = () => {
  return (
    <Box className="about-page">
      <HomeHeader transparent={true} />
      
      {/* About Us Section */}
      <Box className="about-hero-section">
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight="bold" color="white" textAlign="center">
            Về Chúng Tôi
          </Typography>
          <Typography variant="h5" component="p" color="#eee" textAlign="center" mt={2}>
            Sứ mệnh của chúng tôi là kết nối đam mê bóng đá với công nghệ, mang lại trải nghiệm đặt sân tiện lợi và nhanh chóng nhất.
          </Typography>
        </Container>
      </Box>

      {/* Our Mission Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
              Sứ Mệnh & Tầm Nhìn
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={2}>
              Chúng tôi tin rằng mọi người đều xứng đáng có được những trận cầu đỉnh cao mà không phải bận tâm về việc tìm kiếm và đặt sân. Sứ mệnh của Sân Bóng Online là đơn giản hóa quy trình này, giúp bạn tập trung hoàn toàn vào trận đấu.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tầm nhìn của chúng tôi là trở thành nền tảng đặt sân bóng đá số một tại Việt Nam, nơi mọi người yêu bóng đá có thể tìm thấy "sân nhà" của mình.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <img src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1949&auto=format&fit=crop" alt="Our Mission" className="about-image" />
          </Grid>
        </Grid>
      </Container>

      {/* Our Team Section */}
      <Box sx={{ py: 8, backgroundColor: '#f4f6f8' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" gutterBottom>
            Đội Ngũ Của Chúng Tôi
          </Typography>
          <Grid container spacing={4} justifyContent="center" mt={4}>
            {teamMembers.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.name}>
                <Paper elevation={3} className="team-member-card">
                  <Avatar alt={member.name} src={member.avatar} sx={{ width: 100, height: 100, mb: 2 }} />
                  <Typography variant="h6" component="h3">{member.name}</Typography>
                  <Typography color="primary">{member.role}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <HomeFooter />
    </Box>
  );
};

export default AboutPage;
