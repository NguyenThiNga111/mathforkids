import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Table, Pagination, Button } from 'antd';
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
    const [time, date] = dateString.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const filteredTests = testSystems.filter(test => {
    const levelMatch = selectedLevel === '' || String(test.levelId) === selectedLevel;
    let pointMatch = true;
    if (selectedPoint !== '') {
      if (selectedPoint === '>=90') {
        pointMatch = test.point >= 90;
      } else if (selectedPoint === '70-89') {
        pointMatch = test.point >= 70 && test.point < 90;
      } else if (selectedPoint === '50-69') {
        pointMatch = test.point >= 50 && test.point < 70;
      } else if (selectedPoint === '<50') {
        pointMatch = test.point < 50;
      }
    }
    return levelMatch && pointMatch;
  });

  const handleDetailClick = (testId) => {
    navigate(`/questiontest/${testId}`);
  };

  // Ant Design Table columns
  const columns = [
    {
      title: t('.no', { ns: 'common' }),
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => (currentPage - 1) * userPerPage + index + 1,
    },
    {
      title: t('lessonName'),
      dataIndex: 'lessonName',
      key: 'lessonName',
      render: (text, record) => lessons.find(l => l.id === record.lessonId)?.name?.[i18n.language] || '',
    },
    {
      title: t('pupilld'),
      dataIndex: 'pupilId',
      key: 'pupilId',
      render: (text, record) => pupils.find(p => p.id === record.pupilId)?.fullName || '',
    },
    {
      title: t('level'),
      dataIndex: 'level',
      key: 'level',
      render: (text, record) => levels.find(l => l.id === record.levelId)?.name?.[i18n.language] || '',
    },
    {
      title: t('point'),
      dataIndex: 'point',
      key: 'point',
    },
    {
      title: t('duration'),
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration}s`,
    },
    {
      title: t('action', { ns: 'common' }),
      key: 'action',
      render: (text, record) => (
        <button
          className="text-white px-3 py-1 buttonlessondetail"
          onClick={() => handleDetailClick(record.id)}
        >
          <FaPenAlt className="iconupdate" />
          {t('questiontest')}
        </button>
      ),
    },
  ];

  return (
    <div className="containers">
      <Navbar />
      <h1 className="container-title">{t('managementTestSystem')}</h1>
      <div className="containers-content">
        <div className="filter-bar mb-2">
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
                strokeLinejoin="round"
              >
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              <button className="filter-text">{t('filterBy', { ns: 'common' })}</button>
            </span>
            <Select
              className="filter-dropdown"
              value={selectedLevel}
              onChange={(value) => setSelectedLevel(value)}
              placeholder={t('level')}
            >
              <Select.Option value="">{t('level')}</Select.Option>
              {levelactive.map((level) => (
                <Select.Option key={level.id} value={level.id}>
                  {level.name?.[i18n.language]}
                </Select.Option>
              ))}
            </Select>
            <Select
              className="filter-dropdown"
              value={selectedPoint}
              onChange={(value) => setSelectedPoint(value)}
              placeholder={t('point')}
            >
              <Select.Option value="">{t('point')}</Select.Option>
              <Select.Option value=">=90">≥ 90</Select.Option>
              <Select.Option value="70-89">70-90</Select.Option>
              <Select.Option value="50-69">50-70</Select.Option>
              <Select.Option value="<50">10-50</Select.Option>
            </Select>
          </div>
        </div>
        <div className="table-container-test">
          <Table
            columns={columns}
            dataSource={filteredTests.slice((currentPage - 1) * userPerPage, currentPage * userPerPage)}
            pagination={false}
            rowKey="id"
            className="custom-table"
          />
          <div className="paginations">
            <Pagination
              current={currentPage}
              total={filteredTests.length}
              pageSize={userPerPage}
              onChange={(page) => setCurrentPage(page)}
              className="pagination"
              itemRender={(page, type, originalElement) => {
                if (type === 'prev') {
                  return (
                    <button className="around" disabled={currentPage === 1}>
                      {'<'}
                    </button>
                  );
                }
                if (type === 'next') {
                  return (
                    <button
                      className="around"
                      disabled={currentPage === Math.ceil(filteredTests.length / userPerPage)}
                    >
                      {'>'}
                    </button>
                  );
                }
                if (type === 'page') {
                  return (
                    <button className={`around ${currentPage === page ? 'active' : ''}`}>
                      {page}
                    </button>
                  );
                }
                return originalElement;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSystem;