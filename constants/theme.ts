// constants/theme.ts
export const COLORS = {
  primary: "#7b1e3a",      // ChowEasy Brand Red
  primaryDark: "#5a1228",  // Darker shade for contrast
  secondary: "#FFC107",    // Amber for ratings/warnings
  background: "#F4F6F8",   // Light gray-blue professional background
  surface: "#FFFFFF",      // Pure white for cards
  text: "#111827",         // Nearly black for readability
  textLight: "#6B7280",    // Muted gray
  success: "#059669",      // Professional Green
  danger: "#DC2626",       // Professional Red
  border: "#E5E7EB",       // Subtle borders
  white: "#FFFFFF",
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};