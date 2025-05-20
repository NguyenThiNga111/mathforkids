export const lightColors = {
  backgroundSidebar: '#4880FF',
  backgroundSidebarhover: '#2563eb',
  backgroundCard: '#FFFFFF',
  colorCard: '#6b7280',
  colorCardvalue: '#202224',
  activeBackground: '#FFFFFF',
  colorSidebaractive: '#4880FF',
  colorSidebar: '#FFFFFF',
  buttonAdd: '#1685FB',
  colorTitle: '#1B2431',
  buttonUpdate: '#1685FB',
  backgroundContent: '#F8F8FF',
  backgroundNavbar: '#FFFFFF',
  backgroundButton: '#4880FF',
  backgroundButtonhover: '#2563eb',
  colorText: '#202224',
  colorTextwhite: '#FFFFFF',
  colorBorder: '#F5F6FA',
  borderSearch: '#CCC',
  sidebarDivider: '#FFFFFF',
  filterBorder: '#d1d5db',
  colorFilter: '#202224',
  tableName: '#e5e7eb',
  tableColor: '#202224',
  buttonFilter: '#FFFFFF',
  backgroundFilter: '#F9F9FB',
  colorExport: '#ef4444',
  borderInput: '#3b82f6',
  errorText: '#ff0000',
  backgroundWhite: '#FFFFFF',
  backgroundGradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
  subTitle: '#6b7280',
  labelLogin: '#374151',
  backgroundPage: '#e5e7eb',
  colorPage: '#202224',
  backgroundDisabled: '#e5e7eb',
  colorDisabled: '#9ca3af'
};

export const darkColors = {
  backgroundSidebar: '#273142',
  backgroundSidebarhover: '#374151',
  backgroundCard: '#273142',
  colorCard: '#FFFFFF',
  colorCardvalue: '#FFFFFF',
  activeBackground: '#4880FF',
  colorSidebaractive: '#FFFFFF',
  colorSidebar: '#e5e7eb',
  buttonAdd: '#1685FB',
  colorTitle: '#FFFFFF',
  buttonUpdate: '#3b82f6',
  backgroundContent: '#1B2431',
  backgroundNavbar: '#273142',
  backgroundButton: '#4880FF',
  backgroundButtonhover: '#2563eb',
  colorText: '#f3f4f6',
  colorTextwhite: '#FFFFFF',
  colorBorder: '#334155',
  borderSearch: '#CFCFCF',
  sidebarDivider: '#475569',
  filterBorder: '#64748b',
  tableName: '#273142',
  tableColor: '#FFFFFF',
  buttonFilter: '#1e293b',
  colorFilter: '#FFFFFF',
  backgroundFilter: '#1e293b',
  colorExport: '#f87171',
  borderInput: '#60a5fa',
  errorText: '#f87171',
  backgroundWhite: '#1e293b',
  backgroundGradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
  subTitle: '#9ca3af',
  labelLogin: '#d1d5db',
  backgroundPage: '#FFFFFF',
  colorPage: '#202224',
  backgroundDisabled: '#e5e7eb',
  colorDisabled: '#9ca3af'

};
// Hàm chuyển màu thành biến CSS trong :root
export function injectColorsToRoot(colors: Record<string, string>) {
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(cssVar, value);
  });
}



