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
  const [countAll, setCountAll] = useState(0);
  const [visibleTest, setVisibleTest] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [testData, setTestData] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [pupils, setPupils] = useState([]);
  const navigate = useNavigate();
  const testPage = 20;

  useEffect(() => {
    fetchAllTests(null);
  }, []);

  useEffect(() => {
    if (testData.length > 0) {
      fetchLessonsAndPupils();
    }
  }, [testData]);

  const fetchAllTests = async (token = null) => {
    try {
      let url = `/test/getAll?pageSize=${testPage}`;
      if (token) {
        url += `&startAfterId=${token}`;
      }
      const response = await api.get(url);
      const newTests = response.data.data || [];
      const countResponse = await api.get(`/test/countAll`);
      setCountAll(Number(countResponse.data.count));
      setTestData((prev) => {
        const existingIds = new Set(prev.map((test) => test.id));
        const uniqueNewTests = newTests.filter((test) => !existingIds.has(test.id));
        return [...prev, ...uniqueNewTests];
      });
      setVisibleTest((prev) => {
        const existingIds = new Set(prev.map((test) => test.id));
        const uniqueNewTests = newTests.filter((test) => !existingIds.has(test.id));
        return [...prev, ...uniqueNewTests];
      });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const fetchLessonsAndPupils = async () => {
    try {
      const lessonIds = [...new Set(testData.map(test => test.lessonId))];
      const pupilIds = [...new Set(testData.map(test => test.pupilId))];

      const lessonPromises = lessonIds.map(id =>
        api.get(`/lesson/${id}`).then(res => res.data).catch(() => null)
      );
      const lessonResults = await Promise.all(lessonPromises);
      const lessonData = lessonResults.filter(Boolean);
      setLessons(lessonData);
      const pupilPromises = pupilIds.map(id =>
        api.get(`/pupil/${id}`).then(res => res.data).catch(() => null)
      );
      const pupilResults = await Promise.all(pupilPromises);
      const pupilData = pupilResults.filter(Boolean);
      setPupils(pupilData);
    } catch (error) {
      console.error('Error fetching lessons or pupils:', error);
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
  const loadMore = async () => {
    if (!nextPageToken) return;
    try {
      await fetchAllTests(nextPageToken);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleDetailClick = (testId) => {
    navigate(`/questiontest/${testId}`);
  };

  const columns = [
    {
      title: t('.no', { ns: 'common' }),
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: t('lessonName'),
      dataIndex: 'lessonName',
      key: 'lessonName',
      render: (text, record) => {
        const lesson = lessons.find(l => l.id === record.lessonId);
        return lesson?.name?.[i18n.language] || lesson?.name || 'N/A';
      },
    },
    {
      title: t('pupilld'),
      dataIndex: 'pupilId',
      key: 'pupilId',
      render: (text, record) => {
        const pupil = pupils.find(p => p.id === record.pupilId);
        return pupil?.fullName || 'N/A';
      },
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
      {/* <Navbar /> */}
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
          </div>
        </div>
        <div className="table-container-test">
          <Table
            columns={columns}
            dataSource={visibleTest}
            pagination={false}
            rowKey="id"
            className="custom-table"
          />
          <div className="paginations">
            {nextPageToken && visibleTest.length < countAll ? (
              <Button className="load-more-btn" onClick={loadMore}>
                {t('More', { ns: 'common' })}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSystem;