import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    Alert,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const MyFieldsPage = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFields = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/football/get-all-football');
                const maChuSan = user?.id || user?.unique_name || user?.nameid || '';
                const ownerFields = (response.data.result || []).filter(field => String(field.maChuSan) === String(maChuSan));
                setFields(ownerFields);
            } catch (err) {
                setError('Failed to fetch fields.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, [user]);

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
            <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    My Football Fields
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/owner/field/new')}
                >
                    Add New Field
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">You haven't added any fields yet.</TableCell>
                            </TableRow>
                        ) : (
                            fields.map((field) => (
                                <TableRow key={field.maSanBong}>
                                    <TableCell>{field.tenSanBong}</TableCell>
                                    <TableCell>{field.diaChi}</TableCell>
                                    <TableCell>{field.trangThai}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => navigate(`/owner/field/edit/${field.maSanBong}`)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default MyFieldsPage;
