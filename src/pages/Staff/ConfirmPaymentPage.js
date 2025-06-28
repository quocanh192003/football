import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, Chip, Paper } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const ConfirmPaymentPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        // Lấy danh sách đơn đã xác nhận nhưng chưa thanh toán
        const res = await axiosInstance.get('/api/order/get-all-order-by-status', { params: { status: 'CONFIRMED' } });
        if (res.data.isSuccess) {
          setBookings((res.data.result || []).filter(b => b.trangThaiTT !== 'PAID'));
        } else {
          setError(res.data.errorMessages.join(', '));
        }
      } catch (err) {
        setError('Không thể tải danh sách xác nhận thanh toán.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleConfirmPayment = async (orderId) => {
    if (!window.confirm('Xác nhận đã nhận thanh toán cho đơn này?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.put(`/api/order/confirm-payment/${orderId}`);
      if (res.data.isSuccess) {
        setSuccess('Xác nhận thanh toán thành công!');
        setBookings(prev => prev.filter(b => b.maDatSan !== orderId));
      } else {
        setError(res.data.errorMessages.join(', '));
      }
    } catch (err) {
      setError('Xác nhận thanh toán thất bại.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Xác nhận thanh toán</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Sân</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Giờ</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái TT</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length > 0 ? bookings.map(b => {
                const detail = b.chiTietDonDatSans?.[0];
                return (
                  <TableRow key={b.maDatSan}>
                    <TableCell>{b.maDatSan}</TableCell>
                    <TableCell>{b.maKhachHang || '--'}</TableCell>
                    <TableCell>{detail?.maSanBong || '--'}</TableCell>
                    <TableCell>{b.ngayDat ? new Date(b.ngayDat).toLocaleDateString() : '--'}</TableCell>
                    <TableCell>{detail ? `${detail.gioBatDau} - ${detail.gioKetThuc}` : '--'}</TableCell>
                    <TableCell>{b.tongTien?.toLocaleString() || '--'}</TableCell>
                    <TableCell><Chip label={b.trangThaiTT} color={b.trangThaiTT === 'PAID' ? 'success' : 'warning'} size="small" /></TableCell>
                    <TableCell>
                      <Button variant="contained" color="success" size="small" onClick={() => handleConfirmPayment(b.maDatSan)}>
                        Xác nhận thanh toán
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow><TableCell colSpan={8} align="center">Không có đơn nào cần xác nhận thanh toán.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ConfirmPaymentPage;
