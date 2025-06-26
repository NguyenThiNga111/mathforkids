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
import viReward from './vi/reward.json';
import enReward from './en/reward.json';
import viAccount from './vi/account.json';
import enAccount from './en/account.json';
import viAssessment from './vi/assessment.json';
import enAssessment from './en/assessment.json';
import viExercise from './vi/exercise.json';
import enExercise from './en/exercise.json';
import viPupil from './vi/pupil.json';
import enPupil from './en/pupil.json';
import viSetting from './vi/setting.json';
import enSetting from './en/setting.json';
import viNotification from './vi/notification.json';
import enNotification from './en/notification.json';
import viConpleteTask from './vi/completetask.json';
import enConpleteTask from './en/completetask.json';
import viConpleteLesson from './vi/completelesson.json';
import enConpleteLesson from './en/completelesson.json';
import viLessonDetail from './vi/lessondetail.json';
import enLessonDetail from './en/lessondetail.json';
import viDashboard from './vi/dashboard.json';
import enDashboard from './en/dashboard.json';
import viQuestionTest from './vi/questiontest.json';
import enQuestionTest from './en/questiontest.json';
import viLevel from './vi/level.json';
import enLevel from './en/level.json';
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
                reward: viReward,
                account: viAccount,
                assessment: viAssessment,
                exercise: viExercise,
                pupil: viPupil,
                setting: viSetting,
                notification: viNotification,
                completetask: viConpleteTask,
                completelesson: viConpleteLesson,
                lessondetail: viLessonDetail,
                dashboard: viDashboard,
                questiontest: viQuestionTest,
                level: viLevel,
            },
            en: {
                common: enCommon,
                lesson: enLesson,
                sidebar: enSidebar,
                profile: enProfile,
                testsystem: enTestSystem,
                systemtask: enSystemTask,
                reward: enReward,
                account: enAccount,
                assessment: enAssessment,
                exercise: enExercise,
                pupil: enPupil,
                setting: enSetting,
                notification: enNotification,
                completetask: enConpleteTask,
                completelesson: enConpleteLesson,
                lessondetail: enLessonDetail,
                dashboard: enDashboard,
                questiontest: enQuestionTest,
                level: enLevel,

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
            'systemtask',
            'reward',
            'account',
            'assessment',
            'exercise',
            'pupil',
            'setting',
            'notification',
            'completetask',
            'completelesson',
            'lessondetail',
            'dashboard',
            'questiontest',
            'level'
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