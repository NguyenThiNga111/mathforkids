import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Select, Button, Breadcrumb, Table } from 'antd';
import { FaInfoCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './questiontest.css';

const { Option } = Select;

const QuestionTest = () => {
  const [questionTests, setQuestionTests] = useState([]);
  const [levels, setLevels] = useState([]);
  const [test, setTest] = useState([]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedQuestionTest, setSelectedQuestionTest] = useState(null);
  const [visibleTest, setVisibleTest] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);

  const { testId } = useParams();
  const navigate = useNavigate();
  const questionTestsPerPage = 20;
  const { t, i18n } = useTranslation(['questiontest', 'common']);

  useEffect(() => {
    fetchLevels();
    if (testId) {
      fetchQuestionTests();
      fetchTest();
    }
  }, [testId]);

  const fetchQuestionTests = async () => {
    try {
      const response = await api.get(`/testquestion/getByTest/${testId}`);
      setQuestionTests(response.data.data);
      console.log("oca", response.data.data);
      // setQuestionTests((prev) => {
      //   const existingIds = new Set(prev.map((testquestion) => testquestion.id));
      //   const uniqueNewTests = response.filter((testquestion) => !existingIds.has(testquestion.id));
      //   return [...prev, ...uniqueNewTests];
      // });
      // setVisibleTest((prev) => {
      //   const existingIds = new Set(prev.map((testquestion) => testquestion.id));
      //   const uniqueNewTests = response.filter((testquestion) => !existingIds.has(testquestion.id));
      //   return [...prev, ...uniqueNewTests];
      // });
      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      console.error('Error fetching question tests:', error);
    }
  };

  const fetchTest = async () => {
    try {
      const response = await api.get(`/test/${testId}`);
      setTest(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await api.get(`/level/getEnabledLevels`);
      const levelsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setLevels(levelsData);
    } catch (error) {
      console.error('Error fetching levels:', error);
      setLevels([]);
    }
  };

  const getLevelName = (levelId) => {
    const level = levels.find((lvl) => lvl.id === levelId);
    return level ? (level.name?.[i18n.language] || level.name || levelId) : levelId;
  };

  const openDetailModal = (questionTest) => {
    setSelectedQuestionTest(questionTest);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedQuestionTest(null);
  };

  const breadcrumbItems = [
    {
      title: t('test'),
      onClick: () => navigate('/testsystem'),
      className: 'current-breadcrumb-title',
    },
    {
      title: t('testquestion'),
      className: 'current-breadcrumb',
    },
  ];

  const columns = [
    {
      title: t('.no', { ns: 'common' }),
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: t('question'),
      dataIndex: 'question',
      key: 'question',
      render: (text) => text?.[i18n.language] || text || 'N/A',
    },
    {
      title: t('image'),
      dataIndex: 'image',
      key: 'image',
      render: (image) =>
        image ? (
          <img
            src={image}
            alt="Question"
            width="200"
            height="100"
            style={{ objectFit: 'cover', borderRadius: '8px', border: '2px solid #ccc' }}
          />
        ) : (
          'N/A'
        ),
    },

    {
      title: t('level'),
      dataIndex: 'levelId',
      key: 'levelId',
      render: (levelId) => getLevelName(levelId),
    },
    {
      title: t('action', { ns: 'common' }),
      key: 'action',
      render: (_, record) => (
        <button
          className="text-white px-3 py-1 buttonlessondetail"
          onClick={() => openDetailModal(record)}
        >
          <FaInfoCircle className="iconupdate" />
          {t('detail')}
        </button>
      ),
    },
  ];

  return (
    <div className="containers">
      {/* <Navbar /> */}
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      <h1 className="container-title">{t('managementQuestionTest')}</h1>
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
            dataSource={questionTests}
            pagination={false}
            rowKey="id"
            className="custom-table"
          />

        </div>
        <Modal
          title={
            <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
              {t('questionTestDetail')}
            </div>
          }
          open={isDetailModalOpen}
          onCancel={closeDetailModal}
          footer={null}
          className="modal-content"
        >
          {selectedQuestionTest && (
            <div className="form-content-assessment-detail">
              <div className="detail-item">
                <label className="detail-label">{t('question')} (Vietnamese)</label>
                <div className="detail-content">{selectedQuestionTest.question?.vi || '-'}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('question')} (English)</label>
                <div className="detail-content">{selectedQuestionTest.question?.en || '-'}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('level')}</label>
                <div className="detail-content">{getLevelName(selectedQuestionTest.levelId)}</div>
              </div>
              {/* <div className="detail-item">
                <label className="detail-label">{t('testId')}</label>
                <div className="detail-content">{selectedQuestionTest.testId || '-'}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('exerciseId')}</label>
                <div className="detail-content">{selectedQuestionTest.exerciseId || '-'}</div>
              </div> */}
              <div className="detail-item">
                <label className="detail-label">{t('image')}</label>
                <div className="detail-content">
                  {selectedQuestionTest.image ? (
                    <img src={selectedQuestionTest.image} alt="Question" className="assessment-image" />
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('option')}</label>
                <div className="detail-content option-grid">
                  {selectedQuestionTest.option?.map((opt, index) => (
                    <div key={index} className="option-item">
                      {opt && opt.startsWith('http') ? (
                        <Image src={opt} alt={`Option ${index + 1}`} className="option-image" />
                      ) : (
                        <span>{opt || '-'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('correctAnswer')}</label>
                <div className="detail-content">
                  {selectedQuestionTest.correctAnswer && selectedQuestionTest.correctAnswer.startsWith('http') ? (
                    <Image src={selectedQuestionTest.correctAnswer} alt="Correct Answer" className="answer-image" />
                  ) : (
                    <span>{selectedQuestionTest.correctAnswer || '-'}</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('selectedAnswer')}</label>
                <div className="detail-content">
                  {selectedQuestionTest.selectedAnswer && selectedQuestionTest.selectedAnswer.startsWith('http') ? (
                    <Image src={selectedQuestionTest.selectedAnswer} alt="Selected Answer" className="answer-image" />
                  ) : (
                    <span>{selectedQuestionTest.selectedAnswer || '-'}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default QuestionTest;