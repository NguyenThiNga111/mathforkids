import { useState, useEffect } from 'react';
import Navbar from '../../component/Navbar';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../assets/api/Api';
import './completeLesson.css';
import moment from 'moment';

const CompleteLesson = () => {
    const [completeLessons, setCompleteLessons] = useState([]);
    const [pupils, setPupils] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // all / completed / notCompleted

    const { t, i18n } = useTranslation(['completelesson', 'common']);
    const lessonsPerPage = 15;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [completeLessonRes, pupilRes, lessonRes] = await Promise.all([
                api.get('/completelesson'),
                api.get('/pupil'),
                api.get('/lesson'),
            ]);

            const pupilMap = Object.fromEntries(pupilRes.data.map(p => [p.id, p.fullName]));
            const lessonMap = Object.fromEntries(lessonRes.data.map(l => [l.id, l.name?.[i18n.language]]));

            const enrichedData = completeLessonRes.data.map(item => ({
                ...item,
                pupilName: pupilMap[item.pupilId] || item.pupilId,
                lessonName: lessonMap[item.lessonId] || item.lessonId,
            }));

            setCompleteLessons(enrichedData);
            setPupils(pupilRes.data);
            setLessons(lessonRes.data);
        } catch (error) {
             toast.error(error.response?.data?.message?.[i18n.language], {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };
    const filteredLessons = completeLessons.filter(item => {
        if (filterStatus === 'completed') return item.isCompleted === true;
        if (filterStatus === 'notCompleted') return item.isCompleted === false;
        return true;
    });
    const indexOfLastLesson = currentPage * lessonsPerPage;
    const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
    const currentLessons = filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson);
    const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container">
            <Navbar />
            <div className="container-content">
                <h1 className="container-title">{t('managementCompleteLessons')}</h1>
                <div className="flex justify-between items-center mb-4">
                    <div className="filter-bar">
                        <div className="filter-container">
                            <div className="filter-containers">
                                <span className="filter-icon">
                                    <svg
                                        className="iconfilter"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                </span>
                                <button className="filter-text">{t('filterBy', { ns: 'common' })}</button>
                                <select
                                    className="filter-dropdown"
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('lessonstatus')}</option>
                                    <option value="completed">{t('completed')}</option>
                                    <option value="notCompleted">{t('notCompleted')}</option>
                                </select>
                                <button className="export-button">{t('exportFile', { ns: 'common' })}</button>

                            </div>
                        </div>
                    </div>
                </div>
                <table className="w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-3">{t('pupil')}</th>
                            <th className="p-3">{t('lesson')}</th>
                            <th className="p-3">{t('point')}</th>
                            <th className="p-3">{t('status')}</th>
                            <th className="p-3">{t('completedDate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLessons.map(lesson => (
                            <tr key={lesson.id} className="border-t">
                                <td className="p-3">{lesson.pupilName}</td>
                                <td className="p-3">{lesson.lessonName}</td>
                                <td className="p-3">{lesson.point}</td>
                                <td className="p-3">{lesson.isCompleted ? t('completed') : t('notCompleted')}</td>
                                <td className="p-3">{lesson.createAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end items-center mt-4 ml-auto">
                    <div className="pagination">
                        <button
                            className="around"
                            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                className={`around ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                                onClick={() => paginate(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            className="around"
                            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteLesson;
