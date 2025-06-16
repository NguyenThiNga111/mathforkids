export const lightColors = {
  // Backgrounds
  backgroundSidebar: '#FFFFFF',
  backgroundSidebarhover: '#2563eb',
  backgroundCard: '#FFFFFF',
  backgroundContent: '#F8F8FF',
  backgroundNavbar: '#FFFFFF',
  backgroundWhite: '#FFFFFF',
  backgroundAround: '#1e293b',
  backgroundPage: '#e5e7eb',
  backgroundFilter: '#F9F9FB',
  backgroundDisabled: '#e5e7eb',
  backgroundHover: '#F5F5F5',

  // Buttons and Hover
  backgroundButton: '#4880FF',
  backgroundButtonhover: '#2563eb',
  backgroundButtonadd: '#FF0066',
  colorButtonadd: '#fff',
  buttonAdd: '#1685FB',
  buttonUpdate: '#1685FB',
  buttonDetail: '#F4A100', // Thêm cho nhất quán (dựa trên darkColors)
  buttonLessonDetail: '#60D56C', // Thêm cho nhất quán (dựa trên darkColors)
  buttonDetailhover: '#D98A4A', // Thêm cho nhất quán
  buttonLessonDetailhover: '#3DA964', // Thêm cho nhất quán
  backgroundSave: '#3b82f6',
  backgroundSavehover: '#2e6bcc',
  backgroundCancel: '#ff4d4f',
  backgroundCancelhover: '#e64446',

  // Text
  colorText: '#202224',
  colorTextwhite: '#FFFFFF',
  colorTitle: '#1B2431',
  colorCard: '#6b7280',
  colordHover: '#696969',
  colorCardvalue: '#202224',
  colorTextsearch: '#D8D8D8',
  colorSearch: '#202224', // Thêm cho nhất quán (dựa trên darkColors)
  subTitle: '#6b7280',
  labelLogin: '#374151',
  colorPage: '#202224',
  colorDisabled: '#9ca3af',
  errorText: '#ff0000',
  colorFilter: '#202224',
  tableColor: '#202224',

  // Borders
  colorBorder: '#D8D8D8',
  borderSearch: '#CCC',
  filterBorder: '#d1d5db',
  borderInput: '#3b82f6',
  sidebarDivider: '#FFFFFF',

  // Sidebar
  activeBackground: '#FFFFFF',
  colorSidebaractive: '#4880FF',
  colorSidebar: '#081028',
  backgroundSidebarheader: '#3366FF',
  sidebarItem: '#E6ECFF',

  // Tables and Hover
  tableName: '#e5e7eb',
  buttonFilter: '#FFFFFF',
  tableHover: '#E6ECFF', // Thêm cho nhất quán (dựa trên darkColors hover)

  // Miscellaneous
  colorExport: '#F4A100',
  backgroundGradient: 'linear-gradient(135deg,#2e6bcc 0%, #1e40af 100%)',
};
export const darkColors = {
  // Backgrounds
  backgroundSidebar: '#1A2A44', // Dark navy sidebar
  backgroundSidebarhover: '#223355', // Hover effect for sidebar
  backgroundCard: '#1E3556', // Card background
  backgroundContent: '#15233A', // Main content background, matches DashStack
  backgroundNavbar: '#1A2A44', // Navbar background
  backgroundWhite: '#1E3556', // "White" replacement for dark theme
  backgroundAround: '#15233A', // Secondary areas
  backgroundPage: '#15233A', // Main page background
  backgroundFilter: '#1E3556', // Filter dropdown background
  backgroundDisabled: '#2A4066', // Disabled elements
  backgroundHover: '#DCDCDC',

  // Buttons and Hover
  backgroundButton: '#3A6EA5', // Primary button color
  backgroundButtonhover: '#2D5884', // Hover color for buttons
  backgroundButtonadd: '#FF9800', // Add button, matches DashStack orange
  colorButtonadd: '#FFFFFF', // White text for add button
  buttonAdd: '#FF9800', // Matches backgroundButtonadd
  buttonUpdate: '#3A6EA5', // Update button
  buttonDetail: '#FF9800', // Detail button, orange from DashStack
  buttonLessonDetail: '#4CAF50', // Green for lesson details
  buttonDetailhover: '#F57C00', // Darker orange for hover
  buttonLessonDetailhover: '#45A049', // Darker green for hover
  backgroundSave: '#4CAF50', // Save button
  backgroundSavehover: '#45A049', // Save hover
  backgroundCancel: '#F44336', // Cancel button
  backgroundCancelhover: '#DA190B', // Cancel hover

  // Text
  colorBlack: "#000",
  colorText: '#B0C4DE', // Light text for readability
  colorTextwhite: '#FFFFFF', // Pure white for emphasis
  colorTitle: '#D3D8E0', // Titles
  colorCard: '#000', // Card labels
  colorCardvalue: '#000', // Card values
  colordHover: '#696969',
  colorCardtitle: '#E0E7F0', // Card values 
  colorTextsearch: '#A9B7C9', // Search placeholder
  colorSearch: '#000', // Search text
  subTitle: '#A9B7C9', // Subtitles
  labelLogin: '#B0C4DE', // Login labels
  colorPage: '#B0C4DE', // Pagination text
  colorDisabled: '#6D829E', // Disabled text
  errorText: '#F44336', // Error messages
  colorFilter: '#B0C4DE', // Filter text
  tableColor: '#B0C4DE', // Table text

  // Borders
  colorBorder: '#2A4066', // Subtle border
  borderSearch: '#2A4066', // Search border
  filterBorder: '#2A4066', // Filter border
  borderInput: '#3A6EA5', // Focused input border
  sidebarDivider: '#2A4066', // Sidebar divider

  // Sidebar
  activeBackground: '#3A6EA5', // Active sidebar item
  colorSidebaractive: '#FFFFFF', // Active sidebar text
  colorSidebar: '#A9B7C9', // Inactive sidebar text
  backgroundSidebarheader: '#1E3556', // Sidebar header
  sidebarItem: '#223355', // Sidebar item background

  // Tables and Hover
  tableName: '#223355', // Table header
  buttonFilter: '#1E3556', // Filter button
  tableHover: '#2D5884', // New hover color for table rows, matches button hover

  // Miscellaneous
  colorExport: '#FF9800', // Export button
  backgroundGradient: 'linear-gradient(135deg, #3A6EA5 0%, #1E3556 100%)', // Gradient
};
// Hàm chuyển màu thành biến CSS trong :root
export function injectColorsToRoot(colors: Record<string, string>) {
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(cssVar, value);
  });
}



