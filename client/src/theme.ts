import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#D4AF37', // Gold accent
      light: '#E5C158', // Lighter gold
      dark: '#B38F1D', // Darker gold
    },
    secondary: {
      main: '#A78C5F', // Earthy beige
      light: '#BEA77D', // Lighter beige
      dark: '#8A7142', // Darker beige
    },
    background: {
      default: '#FFEFD5', // Papaya Whip background
      paper: '#FFEFD5', // Papaya Whip for cards
    },
    text: {
      primary: '#2E3A3F', // Soft black for primary text (from Tailorly palette)
      secondary: '#555555', // Dark gray for secondary text
    },
    divider: '#3D3A42', // Subtle divider color
    error: {
      main: '#CF6679', // Rose color for errors
    },
    warning: {
      main: '#D4AF37', // Gold for warnings
    },
    info: {
      main: '#A78C5F', // Beige for info
    },
    success: {
      main: '#4CAF50', // Keep success green
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2E3A3F',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2E3A3F',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#FFFFFF',
    },
    h4: {
      color: '#FFFFFF',
    },
    h5: {
      color: '#FFFFFF',
    },
    h6: {
      color: '#FFFFFF',
    },
    body1: {
      color: '#FFFFFF',
    },
    body2: {
      color: '#C4C4C4',
    },
    button: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          backgroundColor: '#D4AF37', // Gold accent
          color: '#1C1B1F', // Dark text on gold buttons
          '&:hover': {
            backgroundColor: '#E5C158', // Lighter gold on hover
          },
        },
        outlined: {
          borderColor: '#D4AF37',
          color: '#D4AF37',
          '&:hover': {
            borderColor: '#E5C158',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
          },
        },
        text: {
          color: '#D4AF37',
          '&:hover': {
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#252429',
          borderRadius: 12,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
          border: '1px solid #3D3A42',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#252429',
            '& fieldset': {
              borderColor: '#3D3A42',
            },
            '&:hover fieldset': {
              borderColor: '#D4AF37',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#D4AF37',
            },
            '& input': {
              color: '#FFFFFF',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#C4C4C4',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#252429',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1C1B1F',
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1C1B1F',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#252429',
          backgroundImage: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#3D3A42',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #3D3A42',
          color: '#FFFFFF',
        },
        head: {
          color: '#D4AF37',
          fontWeight: 600,
        },
      },
    },
  },
});