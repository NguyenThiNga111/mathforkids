import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viCommon from './vi/common.json';
import enCommon from './en/common.json';
import viLesson from './vi/lesson.json';
import enLesson from './en/lesson.json';
import viSidebar from './vi/sidebar.json';
import enSidebar from './en/sidebar.json';
import viProfile from './vi/profile.json';
import enProfile from './en/profile.json';
import viTestSystem from './vi/testsystem.json';
import enTestSystem from './en/testsystem.json';
import viSystemTask from './vi/systemtask.json';
import enSystemTask from './en/systemtask.json';
i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            vi: {
                common: viCommon,
                lesson: viLesson,
                sidebar: viSidebar,
                profile: viProfile,
                testsystem: viTestSystem,
                systemtask: viSystemTask,

            },
            en: {
                common: enCommon,
                lesson: enLesson,
                sidebar: enSidebar,
                profile: enProfile,
                testsystem: enTestSystem,
                systemtask: enSystemTask,
            },
        },
        lng: 'en', // Ngôn ngữ mặc định
        fallbackLng: 'vi', // Ngôn ngữ dự phòng nếu bản dịch bị thiếu
        ns: [
            'common',
            'lesson',
            'sidebar',
            'profile',
            'testsystem',
            'systemtask'
        ], // Danh sách namespace
        defaultNS: 'common', // Namespace mặc định
        fallbackNS: 'common', // Namespace dự phòng
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false, // Không cần escape vì React tự xử lý XSS
        },
    });

export default i18next;