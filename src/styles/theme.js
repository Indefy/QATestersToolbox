export const colors = {
  primary: '#6C63FF',
  secondary: '#4CAF50',
  background: '#1A1A2E',
  glass: 'rgba(255, 255, 255, 0.1)',
  glassLight: 'rgba(255, 255, 255, 0.05)',
  text: '#FFFFFF',
  textSecondary: '#B8B8B8',
  accent: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  gradients: {
    primary: ['#6C63FF', '#3B3B98'],
    secondary: ['#4CAF50', '#2E7D32'],
    accent: ['#FF6B6B', '#EE5253'],
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: '50%',
};

export const shadows = {
  glass: {
    shadowColor: 'rgba(255, 255, 255, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  body: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
};

export const animations = {
  scale: {
    from: { scale: 0.9 },
    to: { scale: 1 },
    config: { tension: 300, friction: 20 },
  },
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 200 },
  },
};
