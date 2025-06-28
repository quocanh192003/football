import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Grid
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const FieldEditPage = () => {
    const { fieldId } = useParams();
    const navigate = useNavigate();
    const isNew = fieldId === 'new';
    const { user } = useAuth();

    const [fieldData, setFieldData] = useState({
        maSanBong: '',
        tenSanBong: '',
        soLuongSan: '',
        diaChi: '',
        soDienThoai: '',
        moTa: '',
        hinhAnhFiles: null
    });
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isNew) {
            const fetchField = async () => {
                try {
                    const response = await axiosInstance.get(`/api/FootballField/get-field-by-id?fieldId=${fieldId}`);
                    if (response.data.isSuccess) {
                        setFieldData(response.data.data);
                    } else {
                        setError('Failed to load field data.');
                    }
                } catch (err) {
                    setError('Failed to fetch field data.');
                } finally {
                    setLoading(false);
                }
            };
            fetchField();
        }
    }, [fieldId, isNew]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'hinhAnhFiles') {
            setFieldData({ ...fieldData, hinhAnhFiles: files });
        } else {
            setFieldData({ ...fieldData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let response;
            const maChuSan = user?.id || user?.unique_name || user?.nameid || '';
            const formData = new FormData();
            formData.append('maSanBong', fieldData.maSanBong);
            formData.append('tenSanBong', fieldData.tenSanBong);
            formData.append('soLuongSan', fieldData.soLuongSan);
            formData.append('diaChi', fieldData.diaChi);
            formData.append('soDienThoai', fieldData.soDienThoai);
            formData.append('moTa', fieldData.moTa);
            formData.append('maChuSan', maChuSan);
            if (fieldData.hinhAnhFiles) {
                for (let i = 0; i < fieldData.hinhAnhFiles.length; i++) {
                    formData.append('hinhAnhFiles', fieldData.hinhAnhFiles[i]);
                }
            }
            if (isNew) {
                response = await axiosInstance.post('/api/football/create-football', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await axiosInstance.put(`/api/football/update-football/${fieldId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.isSuccess) {
                setSuccess(`Field ${isNew ? 'created' : 'updated'} successfully!`);
                setTimeout(() => navigate('/owner/fields'), 2000);
            } else {
                setError(response.data.errorMessages.join(', '));
            }
        } catch (err) {
            setError(`Failed to ${isNew ? 'create' : 'update'} field.`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isNew) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isNew ? 'Create New Field' : 'Edit Field'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
    <Grid item xs={12} sm={6}>
        <TextField
            name="tenSanBong"
            label="Field Name"
            value={fieldData.tenSanBong}
            onChange={handleChange}
            fullWidth
            required
        />
    </Grid>
    <Grid item xs={12} sm={6}>
        <TextField
            name="maSanBong"
            label="Field Code"
            value={fieldData.maSanBong}
            onChange={handleChange}
            fullWidth
            required
        />
    </Grid>
    <Grid item xs={12} sm={6}>
        <TextField
            name="soLuongSan"
            label="Number of Subfields"
            value={fieldData.soLuongSan}
            onChange={handleChange}
            fullWidth
            required
            type="number"
        />
    </Grid>
    <Grid item xs={12} sm={6}>
        <TextField
            name="soDienThoai"
            label="Phone Number"
            value={fieldData.soDienThoai}
            onChange={handleChange}
            fullWidth
            required
        />
    </Grid>
    <Grid item xs={12}>
        <TextField
            name="diaChi"
            label="Address"
            value={fieldData.diaChi}
            onChange={handleChange}
            fullWidth
            required
        />
    </Grid>
    <Grid item xs={12}>
        <TextField
            name="moTa"
            label="Description"
            value={fieldData.moTa}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
        />
    </Grid>
    <Grid item xs={12}>
        <Button
            variant="contained"
            component="label"
            sx={{ mr: 2 }}
        >
            Upload Images
            <input
                type="file"
                name="hinhAnhFiles"
                multiple
                hidden
                onChange={handleChange}
            />
        </Button>
        {fieldData.hinhAnhFiles && Array.from(fieldData.hinhAnhFiles).map((file, idx) => (
            <span key={idx} style={{ marginRight: 8 }}>{file.name}</span>
        ))}
    </Grid>
    <Grid item xs={12}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (isNew ? 'Create Field' : 'Save Changes')}
        </Button>
        <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/owner/fields')}>
            Cancel
        </Button>
    </Grid>
</Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default FieldEditPage;
