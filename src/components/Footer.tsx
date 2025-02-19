import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        mt: 'auto',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Seamless
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                Revolutionizing the tailoring industry through technology and connecting customers with expert tailors worldwide.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton color="inherit" size="small">
                  <Facebook size={20} />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <Twitter size={20} />
                </IconButton>
                <IconButton color="inherit" size="small">
                  <Instagram size={20} />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { text: 'Home', path: '/' },
                { text: 'Measurements', path: '/measurements' },
                { text: 'Find Tailors', path: '/tailors' },
                { text: 'Login', path: '/login' },
              ].map((link) => (
                <Link
                  key={link.text}
                  component="button"
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: 'white',
                    opacity: 0.8,
                    textAlign: 'left',
                    '&:hover': {
                      opacity: 1,
                      textDecoration: 'none',
                    },
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                'Custom Tailoring',
                'Alterations',
                'Wedding Attire',
                'Corporate Uniforms',
                'Style Consultation',
              ].map((service) => (
                <Typography
                  key={service}
                  variant="body2"
                  sx={{ opacity: 0.8 }}
                >
                  {service}
                </Typography>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={18} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  123 Fashion Street, Design District
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone size={18} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={18} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  contact@seamless.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Seamless. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((text) => (
              <Link
                key={text}
                href="#"
                sx={{
                  color: 'white',
                  opacity: 0.8,
                  textDecoration: 'none',
                  '&:hover': {
                    opacity: 1,
                    textDecoration: 'underline',
                  },
                }}
              >
                {text}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;