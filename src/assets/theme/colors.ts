export const colors = {
    primaryColor: '#4880FF',
    buttonUpdate: '#1685FB',
    secondaryColor: '#2563eb',
    activeBackground: '#ffffff',
    activeText: '#4880FF',
    hoverBackground: '#2563eb',
    textColor: '#ffffff',
    dividerColor: '#ffffff',
    sidebarText: '#202224',
    dangerColor: '#ef4444',
    grayBg: '#e5e7eb',
    grayLight: '#ccc',
    white: '#fff',
};

// Hàm chuyển màu thành biến CSS trong :root
export function injectColorsToRoot() {
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
        // Chuyển camelCase thành kebab-case
        const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(cssVar, value);
    });
}
