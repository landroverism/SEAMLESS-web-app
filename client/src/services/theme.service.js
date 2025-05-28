import { ref } from 'vue';

// Create a reactive theme state
const isDarkMode = ref(false);

// Simple function to apply theme
function applyTheme(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Initialize on load
try {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
  } else {
    // Check system preference
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  // Apply initial theme
  applyTheme(isDarkMode.value);
} catch (e) {
  console.error('Theme initialization error:', e);
}

// Toggle theme function
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  
  // Save preference
  try {
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  } catch (e) {
    console.error('Could not save theme preference:', e);
  }
  
  // Apply theme
  applyTheme(isDarkMode.value);
}

export default {
  isDarkMode,
  toggleTheme
};
