/**
 * Alameda County Branding Configuration
 */

export const alamedaBranding = {
  // County Identity
  county: 'ALAMEDA COUNTY',
  department: 'Human Resource Services',
  
  // App Title
  appTitle: 'Benefits Enrollment Assistant',
  
  // Colors
  colors: {
    // Header colors (dark gray)
    headerBg: '#4a4a4a', // Dark gray
    headerText: '#ffffff', // White text
    
    // Title section colors (dark green)
    titleBg: '#2d5f4f', // Dark green
    titleText: '#ffffff', // White text
    
    // Accent color
    accentColor: '#ff8c42', // Orange
    accentHover: '#ff7a1f', // Darker orange
    
    // Separator/border accent
    separatorColor: '#ff8c42', // Orange separator line
    
    // Icon background (for the logo square)
    iconBg: '#ffffff',
    iconColor: '#4a4a4a',
  },
  
  // Logo/Icon - Now using the uploaded logo.svg file
  logo: {
    type: 'image',
    content: '/src/assets/logo.svg',
  },
};

export default alamedaBranding;
