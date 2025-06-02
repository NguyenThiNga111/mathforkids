import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Select, Button, Breadcrumb } from 'antd';
import { FaInfoCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './questiontest.css';

const QuestionTest = () => {
  const { t, i18n } = useTranslation(['questiontest', 'common']);
  const [questionTests, setQuestionTests] = useState([]);
  const [levels, setLevels] = useState([]);
  const [test, setTest] = useState([]);

  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedQuestionTest, setSelectedQuestionTest] = useState(null);
  const { testId } = useParams();
  const navigate = useNavigate();
  const questionTestsPerPage = 16;

  useEffect(() => {
    fetchLevels();
    if (testId) {
      fetchQuestionTests();
      fetchTest();
    }
  }, [testId]);

  const fetchQuestionTests = async () => {
    try {
      const response = await api.get(`/getTestQuestionByTest/${testId}`);
      const sortedQuestionTests = response.data.sort((a, b) => {
        const dateA = parseDate(a.createdAt);
        const dateB = parseDate(b.createdAt);
        return dateB - dateA;
      });
      setQuestionTests(sortedQuestionTests);
    } catch (error) {
      console.error('Error fetching question tests:', error);
    }
  };
  const fetchTest = async () => {
    try {
      const response = await api.get(`/test/${testId}`);
      setTest(response.data);
    } catch (error) {
      toast.error(t('errorFetchData', { ns: 'common' }), {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };
  const fetchLevels = async () => {
    try {
      const response = await api.get(`/level`);
      setLevels(response.data);
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const getLevelName = (levelId) => {
    const level = levels.find((lvl) => lvl.id === levelId);
    return level ? (level.name?.[i18n.language] || level.name || levelId) : levelId;
  };

  const parseDate = (dateString) => {
    const [time, date] = dateString.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const filteredQuestionTests = questionTests.filter((qt) => {
    const matchLevel = filterLevel === 'all' ? true : qt.level === filterLevel;
    return matchLevel;
  });

  const indexOfLastQuestionTest = currentPage * questionTestsPerPage;
  const indexOfFirstQuestionTest = indexOfLastQuestionTest - questionTestsPerPage;
  const currentQuestionTests = filteredQuestionTests.slice(indexOfFirstQuestionTest, indexOfLastQuestionTest);
  const totalPages = Math.ceil(filteredQuestionTests.length / questionTestsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    },
    {
      title: t('testquestion'),
    },
  ];
  return (
    <div className="containers">
      <Navbar />
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />

      <h1 className="container-title">{t('managementQuestionTest')}</h1>
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
                    strokeLinejoin="round"
                  >
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  <button className="filter-text">{t('filterBy', { ns: 'common' })}</button>
                </span>
                <select
                  className="filter-dropdown"
                  value={filterLevel}
                  onChange={(e) => {
                    setFilterLevel(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">{t('level')}</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name?.[i18n.language] || level.name || level.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="table-container-questiontest">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">{t('no', { ns: 'common' })}</th>
                <th className="p-3">{t('question')}</th>
                <th className="p-3">{t('image')}</th>
                <th className="p-3">{t('option')}</th>
                <th className="p-3 text-center">{t('correctAnswer')}</th>
                <th className="p-3 text-center">{t('selectedAnswer')}</th>
                <th className="p-3 text-center">{t('level')}</th>
              </tr>
            </thead>
            <tbody>
              {currentQuestionTests.map((qt, index) => (
                <tr key={qt.id} className="border-t">
                  <td className="p-3">{indexOfFirstQuestionTest + index + 1}</td>
                  <td className="p-3">{qt.question?.[i18n.language] || qt.question}</td>
                  <td className="p-3">
                    {qt.image && (
                      <img
                        src={qt.image}
                        alt={qt.question?.[i18n.language] || 'Question'}
                        width="200"
                        height="100"
                        style={{ objectFit: 'cover', borderRadius: '8px', border: '2px solid #ccc' }}
                      />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {qt.option?.map((opt, idx) => (
                      opt && opt.startsWith('http') ? (
                        <img
                          src={opt}
                          alt={`Option ${idx + 1}`}
                          width="90"
                          height="90"
                          style={{ objectFit: 'cover', borderRadius: '10px', border: '2px solid #ccc', marginRight: '10px' }}
                        />
                      ) : (
                        <span key={index} style={{ marginRight: '45px' }}>
                          {opt}
                        </span>
                      )
                    ))}
                  </td>
                  <td className="p-3 text-center">
                    {qt.correctAnswer && qt.correctAnswer.startsWith('http') ? (
                      <img
                        src={qt.correctAnswer}
                        alt="Correct Answer"
                        width="90"
                        height="90"
                        style={{ objectFit: 'cover', borderRadius: '10px', border: '2px solid #ccc' }}
                      />
                    ) : (
                      <span>{qt.correctAnswer || '-'}</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {qt.selectedAnswer && qt.selectedAnswer.startsWith('http') ? (
                      <img
                        src={qt.selectedAnswer}
                        alt="Selected Answer"
                        width="90"
                        height="90"
                        style={{ objectFit: 'cover', borderRadius: '10px', border: '2px solid #ccc' }}
                      />
                    ) : (
                      <span>{qt.selectedAnswer || '-'}</span>
                    )}
                  </td>
                  <td className="p-3 text-center">{getLevelName(qt.level)}</td>
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
              {Array.from({ length: totalPages }, (_, index) => (
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
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
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
            <div className="form-content-questiontest-detail">
              <div className="detail-item">
                <label className="detail-label">{t('question')} ({i18n.language === 'vi' ? 'Vietnamese' : 'English'})</label>
                <div className="detail-content">{selectedQuestionTest.question?.[i18n.language] || selectedQuestionTest.question || '-'}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('level')}</label>
                <div className="detail-content">{getLevelName(selectedQuestionTest.level)}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('testId')}</label>
                <div className="detail-content">{selectedQuestionTest.testId || '-'}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('exerciseId')}</label>
                <div className="detail-content">{selectedQuestionTest.exerciseId || '-'}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('image')}</label>
                <div className="detail-content">
                  {selectedQuestionTest.image ? (
                    <img src={selectedQuestionTest.image} alt="Question" className="questiontest-image" />
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
                        <img src={opt} alt={`Option ${index + 1}`} className="option-image" />
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
                    <img src={selectedQuestionTest.correctAnswer} alt="Correct Answer" className="answer-image" />
                  ) : (
                    <span>{selectedQuestionTest.correctAnswer || '-'}</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('selectedAnswer')}</label>
                <div className="detail-content">
                  {selectedQuestionTest.selectedAnswer && selectedQuestionTest.selectedAnswer.startsWith('http') ? (
                    <img src={selectedQuestionTest.selectedAnswer} alt="Selected Answer" className="answer-image" />
                  ) : (
                    <span>{selectedQuestionTest.selectedAnswer || '-'}</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('createdAt')}</label>
                <div className="detail-content">{selectedQuestionTest.createdAt || '-'}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">{t('updatedAt')}</label>
                <div className="detail-content">{selectedQuestionTest.updatedAt || '-'}</div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default QuestionTest;