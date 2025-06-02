import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select } from 'antd';
import Navbar from '../../component/Navbar';
import api from '../../assets/api/Api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaPenAlt } from 'react-icons/fa';

import './testsystem.css';

const { Option } = Select;

const TestSystem = () => {
  const { t, i18n } = useTranslation(['testsystem', 'common']);
  const [testSystems, setTestSystems] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [pupils, setPupils] = useState([]);
  const [levels, setLevels] = useState([]);
  const [levelactive, setLevelActive] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPoint, setSelectedPoint] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const userPerPage = 10;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [tests, lessons, pupils, levels, levelactive] = await Promise.all([
        api.get('/test'),
        api.get('/lesson'),
        api.get('/pupil'),
        api.get('/level'),
        api.get('/level/enabled')
      ]);
      const sortedTests = tests.data.sort((a, b) => {
        const dateA = parseDate(a.createdAt);
        const dateB = parseDate(b.createdAt);
        return dateB - dateA; // Mới nhất lên đầu
      });
      setTestSystems(sortedTests);
      setLessons(lessons.data);
      setPupils(pupils.data);
      setLevels(levels.data);
      setLevelActive(levelactive.data);
      console.log("adu", levels);

    } catch (error) {
      toast.error('Error loading data');
      console.log("sjaue", error);
    }
  };
  const parseDate = (dateString) => {
    // Chuyển đổi định dạng "09:02:13 21/5/2025" thành Date object
    const [time, date] = dateString.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };
  const filteredTests = testSystems.filter(test => {
    const levelMatch = selectedLevel === '' || String(test.levelId) === selectedLevel;
    const pointMatch = selectedPoint === '' || test.point === Number(selectedPoint);
    return levelMatch && pointMatch;
  });

  const indexOfLastUser = currentPage * userPerPage;
  const indexOfFirtsUser = indexOfLastUser - userPerPage;
  const currentUsers = filteredTests.slice(indexOfFirtsUser, indexOfLastUser);
  const totalPage = Math.ceil(filteredTests.length / userPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDetailClick = (testId) => {
    navigate(`/questiontest/${testId}`);
  };

  return (
    <div className="containers">
      <Navbar />
      <h1 className="container-title">{t('managementTestSystem')}</h1>
      <div className="containers-content">
        <div className="flex justify-between items-center mb-2">
          <div className="filter-bar">
            <div className="filter-container">
              <div className="filter-containers">
                <span className="filter-icon">
                  <svg
                    className="iconfilter"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  <button className="filter-text">
                    {t('filterBy', { ns: 'common' })}
                  </button>
                </span>
                <select
                  className="filter-dropdown"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="">{t('level')}</option>
                  {levelactive.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name?.[i18n.language]}
                    </option>
                  ))}
                </select>

                <select
                  className="filter-dropdown"
                  value={selectedPoint}
                  onChange={(e) => setSelectedPoint(e.target.value)}
                >
                  <option value="">{t('point')}</option>
                  <option value="85">85</option>
                  <option value="90">90</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="table-container-test">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">{t('.no', { ns: 'common' })}</th> {/* New No column */}
                <th className="p-3">{t('lessonName')}</th>
                <th className="p-3">{t('pupilld')}</th>
                <th className="p-3">{t('level')}</th>
                <th className="p-3">{t('point')}</th>
                <th className="p-3">{t('duration')}</th>
                <th className="p-3">{t('action', { ns: 'common' })}</th>

              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test, index) => (
                <tr key={test.id} className="border-t">
                  <td className="p-3">{indexOfFirtsUser + index + 1}</td> {/* Sequential number */}
                  <td className="p-3">{lessons.find(l => l.id === test.lessonId)?.name?.[i18n.language]}</td>
                  <td className="p-3">{pupils.find(p => p.id === test.pupilId)?.fullName}</td>
                  <td className="p-3">{levels.find(l => l.id === test.levelId)?.name}</td>
                  <td className="p-3">{test.point}</td>
                  <td className="p-3">{test.duration}s</td>
                  <td className="p-3">
                    <button
                      className="text-white px-3 py-1 buttonlessondetail"
                      onClick={() => handleDetailClick(test.id)}
                    >
                      <FaPenAlt className="iconupdate" />
                      {t('questiontest')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end items-center mt-4 ml-auto paginations">
            <div className="pagination">
              <button
                className="around"
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPage }, (_, index) => (
                <button
                  key={index + 1}
                  className={`around ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="around"
                onClick={() => currentPage < totalPage && paginate(currentPage + 1)}
                disabled={currentPage === totalPage}
              >
                &gt;
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSystem;
