export const lightColors = {
  backgroundSidebar: '#FFFFFF',
  backgroundSidebarhover: '#2563eb',
  backgroundCard: '#FFFFFF',
  colorCard: '#6b7280',
  colorCardvalue: '#202224',
  activeBackground: '#FFFFFF',
  colorSidebaractive: '#4880FF',
  colorSidebar: '#081028',
  backgroundSidebarheader: '#3366FF',
  sidebarItem: "#E6ECFF",
  buttonAdd: '#1685FB',
  colorTitle: '#1B2431',
  buttonUpdate: '#1685FB',
  backgroundContent: '#F8F8FF',
  backgroundNavbar: '#FFFFFF',
  backgroundButton: '#4880FF',
  backgroundButtonhover: '#2563eb',
  backgroundButtonadd: '#FF0066',
  colorButtonadd: '#fff',
  colorText: '#202224',
  colorTextwhite: '#FFFFFF',
  colorTextsearch: '#D8D8D8',
  colorBorder: '#D8D8D8',
  borderSearch: '#CCC',
  sidebarDivider: '#FFFFFF',
  filterBorder: '#d1d5db',
  colorFilter: '#202224',
  tableName: '#e5e7eb',
  tableColor: '#202224',
  buttonFilter: '#FFFFFF',
  backgroundFilter: '#F9F9FB',
  colorExport: '#F4A100',
  borderInput: '#3b82f6',
  errorText: '#ff0000',
  backgroundWhite: '#FFFFFF',
  backgroundAround: '#1e293b',
  backgroundGradient: 'linear-gradient(135deg,#2e6bcc 0%, #1e40af 100%)',
  subTitle: '#6b7280',
  labelLogin: '#374151',
  backgroundPage: '#e5e7eb',
  colorPage: '#202224',
  backgroundDisabled: '#e5e7eb',
  colorDisabled: '#9ca3af',
  // colorDisabled: '#000000',

  backgroundSave: '#3b82f6',
  backgroundSavehover: '#2e6bcc',
  backgroundCancel: '#ff4d4f',
  backgroundCancelhover: '#e64446'
};
export const darkColors = {
  backgroundSidebar: '#0B1739',
  backgroundSidebarhover: '#374151',
  backgroundCard: '#273142',
  colorCard: '#FFFFFF', // Text color, already white
  colorCardvalue: '#FFFFFF', // Text color, already white
  activeBackground: '#4880FF',
  colorSidebaractive: '#FFFFFF', // Text color, already white
  colorSidebar: '#FFFFFF', // Changed from #e5e7eb to white for text
  backgroundSidebarheader: '#1D30B5',
  sidebarItem: '#1D30B5',
  buttonAdd: '#1685FB',
  colorTitle: '#FFFFFF', // Text color, already white
  buttonUpdate: '#3b82f6',
  backgroundContent: '#1B2431',
  backgroundNavbar: '#273142',
  backgroundButton: '#4880FF',
  backgroundButtonhover: '#2563eb',
  backgroundButtonadd: '#FF0066',
  colorButtonadd: '#fff',
  colorText: '#FFFFFF', // Changed from #f3f4f6 to white for general text
  colorTextwhite: '#FFFFFF', // Already white
  colorBorder: '#D8D8D8',
  borderSearch: '#CFCFCF',
  colorSearch: '#000000',
  colorDisabled: '#fff',
  sidebarDivider: '#475569',
  filterBorder: '#64748b',
  colorFilter: '#FFFFFF', // Text color, already white
  tableName: '#273142',
  tableColor: '#FFFFFF', // Text color, already white
  buttonFilter: '#1e293b',
  backgroundFilter: '#1e293b',
  colorExport: '#F4A100',
  backgroundAround: '#fff',
  borderInput: '#60a5fa',
  errorText: '#FF0000', // Changed from #f87171 to white for error text
  backgroundWhite: '#1e293b',
  backgroundGradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
  subTitle: '#FFFFFF', // Changed from #9ca3af to white for subtitle text
  labelLogin: '#FFFFFF', // Changed from #d1d5db to white for login labels
  backgroundPage: '#1B2431', // Changed from #FFFFFF to match backgroundContent for consistency
  colorPage: '#FFFFFF', // Changed from #202224 to white for page text
  backgroundDisabled: '#e5e7eb',
  // Added missing colors from lightColors
  backgroundSave: '#3b82f6', // Same as light theme
  backgroundSavehover: '#2e6bcc', // Same as light theme
  backgroundCancel: '#ff4d4f', // Same as light theme
  backgroundCancelhover: '#e64446', // Same as light theme
  // Added for buttondetail and buttonlessondetail
  buttonDetail: '#F4A100', // Same as original CSS
  buttonLessonDetail: '#60D56C' // Same as original CSS
};
// Hàm chuyển màu thành biến CSS trong :root
export function injectColorsToRoot(colors: Record<string, string>) {
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(cssVar, value);
  });
}



