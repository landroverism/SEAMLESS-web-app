import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, Rating, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const tailors = [
  {
    id: 1,
    name: 'Kelly Kevin',
    specialty: 'Formal Wear',
    rating: 4.8,
    experience: '15 years',
    image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Ham Kemboi',
    specialty: 'Suits & Blazers',
    rating: 4.9,
    experience: '12 years',
    image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Cecilia Gatimu',
    specialty: 'Wedding Dresses',
    rating: 5.0,
    experience: '20 years',
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80'
  }
];

const Tailors = () => {
  return (
    <Box>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h2" gutterBottom align="center">
          Our Expert Tailors
        </Typography>
        <Typography variant="h5" color="text.secondary" align="center" sx={{ mb: 6 }}>
          Connect with skilled professionals for your custom garments
        </Typography>

        <Grid container spacing={4}>
          {tailors.map((tailor) => (
            <Grid item xs={12} md={4} key={tailor.id}>
              <Card
                component={motion.div}
                whileHover={{ y: -5 }}
                sx={{ height: '100%' }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={tailor.image}
                  alt={tailor.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tailor.name}
                  </Typography>
                  <Chip label={tailor.specialty} color="primary" size="small" sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={tailor.rating} precision={0.1} readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({tailor.rating})
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    {tailor.experience} of experience
                  </Typography>
                  <Button variant="contained" fullWidth>
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Tailors;