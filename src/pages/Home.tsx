import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { Ruler, Users, Clock } from 'lucide-react';

const Home = () => {
  return (
    <Box>
      <Box
        sx={{
          textAlign: 'center',
          mb: 8,
          mt: 4,
        }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h1" gutterBottom>
          Custom Tailoring, Simplified
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Get perfectly fitted garments from expert tailors, all from the comfort of your home
        </Typography>
        <Button variant="contained" size="large" color="primary" sx={{ mr: 2 }}>
          Get Started
        </Button>
        <Button variant="outlined" size="large">
          Learn More
        </Button>
      </Box>

      <Grid container spacing={4}>
        {[
          {
            icon: <Ruler size={32} />,
            title: 'Easy Measurements',
            description: 'Follow our guided measurement process with video tutorials',
          },
          {
            icon: <Users size={32} />,
            title: 'Expert Tailors',
            description: 'Connect with skilled tailors and view their portfolios',
          },
          {
            icon: <Clock size={32} />,
            title: 'Quick Turnaround',
            description: 'Get your custom garments delivered within 2-3 weeks',
          },
        ].map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              component={motion.div}
              whileHover={{ y: -5 }}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;