import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    CardActions
} from '@mui/material';

const FieldCard = ({ field }) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="140"
                image={field.imageUrl || 'https://via.placeholder.com/300'}
                alt={field.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                    {field.name}
                </Typography>
                <Typography>
                    {field.address}
                </Typography>
            </CardContent>
            <CardActions>
                <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => navigate(`/field/${field.id}`)}>
                    View Details & Book
                </Button>
            </CardActions>
        </Card>
    );
};

export default FieldCard;
