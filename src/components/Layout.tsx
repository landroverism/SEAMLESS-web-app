import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Scissors size={24} />
            <Typography variant="h6" sx={{ ml: 2, fontWeight: 700 }}>
              Seamless
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={() => navigate('/measurements')}>
            Measurements
          </Button>
          <Button color="inherit" onClick={() => navigate('/tailors')}>
            Find Tailors
          </Button>
          <Button color="secondary" variant="contained" onClick={() => navigate('/login')} sx={{ ml: 2 }}>
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
}

export default Layout;