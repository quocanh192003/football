import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
    Container,
    Typography,
    Box,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';

const FieldApprovalPage = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchFieldsToApprove = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            // Assuming this is the correct endpoint based on backend analysis
            const response = await axiosInstance.get('/api/football/get-all-football?status=pending');
            if (response.data.isSuccess) {
                // Use response.data.result and filter PENDING
                const allFields = response.data.result || [];
                setFields(allFields.filter(f => f.trangThai === 'PENDING'));
            } else {
                setError(response.data.errorMessages.join(', '));
            }
        } catch (err) {
            setError('Failed to fetch fields. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFieldsToApprove();
    }, []);

    const handleApproval = async (fieldId, isApproved) => {
        const successMessage = isApproved ? 'Field approved successfully.' : 'Field rejected successfully.';
        const errorMessage = isApproved ? 'Failed to approve field.' : 'Failed to reject field.';

        try {
            const response = await axiosInstance.put(
                `/api/confirm-football/${fieldId}`,
                JSON.stringify(isApproved ? 'ACTIVE' : 'REJECTED'),
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.isSuccess) {
                setSuccess(successMessage);
                // Refresh the list after action
                fetchFieldsToApprove();
            } else {
                setError(response.data.errorMessages.join(', '));
            }
        } catch (err) {
            setError(errorMessage);
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Field Approvals
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Field Name</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No fields pending approval.</TableCell>
                                </TableRow>
                            ) : (
                                fields.map((field) => (
                                    <TableRow key={field.maSanBong}>
                                        <TableCell>{field.tenSanBong}</TableCell>
                                        <TableCell>{field.maChuSan}</TableCell>
                                        <TableCell>{field.diaChi}</TableCell>
                                        <TableCell>{field.soDienThoai}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => handleApproval(field.maSanBong, true)}
                                                sx={{ mr: 1 }}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleApproval(field.maSanBong, false)}
                                            >
                                                Reject
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default FieldApprovalPage;
