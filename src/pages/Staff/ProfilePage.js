import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Avatar, CircularProgress, Alert, MenuItem } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/get-profile');
        if (res.data.isSuccess) {
          setUser(res.data.result);
        } else {
          setError(res.data.errorMessages.join(', '));
        }
      } catch (err) {
        setError('Không lấy được thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const payload = {
      hoTen: user.hoTen,
      phoneNumber: user.phoneNumber,
      ngaySinh: user.ngaySinh,
      gioiTinh: user.gioiTinh,
    };
    try {
      setLoading(true);
      setSuccess('');
      setError('');
      const response = await axiosInstance.put('/api/update-profile', payload);
      if(response.data.isSuccess) {
        setSuccess('Cập nhật thành công!');
      } else {
        setError(response.data.errorMessages.join(', '));
      }
    } catch (err) {
      setError('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setPasswordMsg('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.post('/api/Auth/change-password', passwords);
      if (res.data.isSuccess) {
        setPasswordMsg('Đổi mật khẩu thành công!');
      } else {
        setPasswordMsg(res.data.errorMessages?.[0] || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      setPasswordMsg('Đổi mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}>
        <CircularProgress />
      </Container>
    );
  }
  if (!user) {
    return (
      <Container sx={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, mb: 2 }}>{user.hoTen?.[0]}</Avatar>
        <Typography variant="h5" gutterBottom>Thông tin cá nhân</Typography>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Họ tên" name="hoTen" value={user.hoTen || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Email" name="email" value={user.email || ''} disabled fullWidth sx={{ mb: 2 }} />
        <TextField label="Số điện thoại" name="phoneNumber" value={user.phoneNumber || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Ngày sinh" name="ngaySinh" type="date" value={user.ngaySinh ? user.ngaySinh.slice(0,10) : ''} onChange={handleChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
        <TextField select label="Giới tính" name="gioiTinh" value={user.gioiTinh || ''} onChange={handleChange} fullWidth sx={{ mb: 2 }}>
          <MenuItem value="">Chọn giới tính</MenuItem>
          <MenuItem value="Nam">Nam</MenuItem>
          <MenuItem value="Nữ">Nữ</MenuItem>
        </TextField>
        <Button variant="contained" color="primary" onClick={handleSave}>Lưu thay đổi</Button>
      </Box>
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>Đổi mật khẩu</Typography>
        <form onSubmit={handlePasswordSubmit} style={{width:'100%'}}>
          <TextField label="Mật khẩu hiện tại" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Mật khẩu mới" name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Xác nhận mật khẩu mới" name="confirmNewPassword" type="password" value={passwords.confirmNewPassword} onChange={handlePasswordChange} fullWidth sx={{ mb: 2 }} />
          <Button variant="contained" color="secondary" type="submit">Đổi mật khẩu</Button>
        </form>
        {passwordMsg && <Alert severity={passwordMsg.includes('thành công') ? 'success' : 'error'} sx={{mt:2}}>{passwordMsg}</Alert>}
      </Box>
    </Container>
  );
}

export default ProfilePage; 