import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  TextField,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ArrowLeft, ArrowRight, Save, RefreshCw } from 'lucide-react';

const measurementSteps = [
  {
    label: 'Chest',
    instructions: 'Measure around the fullest part of your chest, keeping the tape parallel to the ground.',
    videoUrl: 'https://www.youtube.com/watch?v=zANQQLTvAHk&pp=ygUSbWVhc3VyZSB5b3VyIGNoZXN0',
    tips: [
      'Take a deep breath and measure',
      'Keep the tape snug but not tight',
      'Make sure the tape is level around your body'
    ],
    minValue: 30,
    maxValue: 60,
    unit: 'inches'
  },
  {
    label: 'Waist',
    instructions: 'Measure around your natural waistline, keeping the tape comfortably loose.',
    videoUrl: 'https://example.com/waist-measurement',
    tips: [
      'Locate your natural waistline',
      'Keep one finger between the tape and your body',
      'Avoid measuring over thick clothing'
    ],
    minValue: 24,
    maxValue: 50,
    unit: 'inches'
  },
  {
    label: 'Shoulders',
    instructions: 'Measure across the back from shoulder point to shoulder point.',
    videoUrl: 'https://example.com/shoulder-measurement',
    tips: [
      'Stand naturally with arms at sides',
      'Measure from the outer edges of each shoulder',
      'Keep the tape straight across the back'
    ],
    minValue: 14,
    maxValue: 30,
    unit: 'inches'
  }
];

const Measurements = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [showTips, setShowTips] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, measurementSteps.length - 1));
    setShowTips(false);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    setShowTips(false);
  };

  const handleMeasurementChange = (value: string) => {
    const numValue = parseFloat(value);
    const currentStep = measurementSteps[activeStep];
    
    if (!isNaN(numValue)) {
      setMeasurements(prev => ({
        ...prev,
        [currentStep.label]: numValue
      }));
    }
  };

  const isValidMeasurement = () => {
    const currentStep = measurementSteps[activeStep];
    const value = measurements[currentStep.label];
    return value >= currentStep.minValue && value <= currentStep.maxValue;
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaved(true);
    setLoading(false);
  };

  const currentMeasurement = measurements[measurementSteps[activeStep].label] || '';

  return (
    <Box>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h2" gutterBottom align="center">
          Take Your Measurements
        </Typography>
        <Typography variant="h5" color="text.secondary" align="center" sx={{ mb: 6 }}>
          Follow our step-by-step guide for accurate measurements
        </Typography>

        {saved && (
          <Alert 
            severity="success" 
            sx={{ mb: 4 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                startIcon={<RefreshCw size={16} />}
                onClick={() => {
                  setMeasurements({});
                  setActiveStep(0);
                  setSaved(false);
                }}
              >
                Start New
              </Button>
            }
          >
            Your measurements have been saved successfully!
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {measurementSteps.map((step, index) => (
            <Step key={step.label} completed={measurements[step.label] !== undefined}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card component={motion.div} layout>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {measurementSteps[activeStep].label}
                  </Typography>
                  <Tooltip title="Show Tips">
                    <IconButton 
                      size="small" 
                      sx={{ ml: 1 }}
                      onClick={() => setShowTips(!showTips)}
                    >
                      <HelpCircle size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Typography color="text.secondary" gutterBottom>
                  {measurementSteps[activeStep].instructions}
                </Typography>

                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Box sx={{ mt: 2, mb: 2, pl: 2, borderLeft: 2, borderColor: 'primary.main' }}>
                        {measurementSteps[activeStep].tips.map((tip, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                            • {tip}
                          </Typography>
                        ))}
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                <TextField
                  fullWidth
                  label={`${measurementSteps[activeStep].label} Measurement`}
                  type="number"
                  value={currentMeasurement}
                  onChange={(e) => handleMeasurementChange(e.target.value)}
                  error={currentMeasurement !== '' && !isValidMeasurement()}
                  helperText={currentMeasurement !== '' && !isValidMeasurement() 
                    ? `Please enter a value between ${measurementSteps[activeStep].minValue} and ${measurementSteps[activeStep].maxValue} ${measurementSteps[activeStep].unit}`
                    : ''}
                  InputProps={{
                    endAdornment: measurementSteps[activeStep].unit
                  }}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Video Tutorial
                </Typography>
                <Box 
                  sx={{ 
                    aspectRatio: '16/9', 
                    bgcolor: 'grey.200', 
                    borderRadius: 1,
                    mb: 2 
                  }}
                >
                  {/* Video player would go here */}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    startIcon={<ArrowLeft />}
                    onClick={handleBack}
                    disabled={activeStep === 0}
                  >
                    Back
                  </Button>
                  {activeStep === measurementSteps.length - 1 ? (
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={loading || !Object.keys(measurements).length === measurementSteps.length}
                    >
                      Save Measurements
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      endIcon={<ArrowRight />}
                      onClick={handleNext}
                      disabled={!isValidMeasurement()}
                    >
                      Next
                    </Button>
                  )}
                </Box>
                {loading && <LinearProgress sx={{ mt: 2 }} />}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Measurements;