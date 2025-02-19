import React from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}
    >
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{ maxWidth: 400, width: '100%' }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Sign in to access your account
          </Typography>

          <Box component="form" sx={{ '& > :not(style)': { mb: 2 } }}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              required
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              required
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
            >
              Sign In
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary" align="center">
            Don't have an account?{' '}
            <Button color="primary" sx={{ textTransform: 'none' }}>
              Sign Up
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;