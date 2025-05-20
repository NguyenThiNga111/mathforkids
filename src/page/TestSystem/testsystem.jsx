import { useState, useEffect } from 'react';
import { Button, Input, Modal, Select } from 'antd';
import Navbar from '../../component/Navbar';
import api from '../../assets/api/Api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Imgs } from '../../assets/theme/images';
import './testsystem.css';

const { Option } = Select;

const testSystemData = [
  {
    id: 1,
    lessonId: 2,
    pupilId: 5,
    levelId: 3,
    point: 85,
    duration: 300
  },
  {
    id: 2,
    lessonId: 2,
    pupilId: 5,
    levelId: 3,
    point: 85,
    duration: 300
  },
  {
    id: 3,
    lessonId: 2,
    pupilId: 5,
    levelId: 3,
    point: 85,
    duration: 300
  },
]
const TestSystem = () => {
  const { t, i18n } = useTranslation(['testsystem', 'common']);
  const [testSystems, setTestSystems] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [pupils, setPupils] = useState([]);
  const [levels, setLevels] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // fetchAllData();
    setTestSystems(testSystemData);
  }, []);

  // const fetchAllData = async () => {
  //   try {
  //     const [tests, lessons, pupils, levels] = await Promise.all([
  //       api.get('/testSystem'),
  //       api.get('/lesson'),
  //       api.get('/pupil'),
  //       api.get('/level')
  //     ]);

  //     setTestSystems(tests.data);
  //     setLessons(lessons.data);
  //     setPupils(pupils.data);
  //     setLevels(levels.data);
  //   } catch (error) {
  //     toast.error('Error loading data');
  //   }
  // };

  const openModal = (test = null) => {
    setEditingTest(test || {
      lessonId: '',
      pupilId: '',
      levelId: '',
      point: '',
      duration: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTest(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editingTest.lessonId) newErrors.lessonId = 'Lesson is required';
    if (!editingTest.pupilId) newErrors.pupilId = 'Pupil is required';
    if (!editingTest.levelId) newErrors.levelId = 'Level is required';
    if (!editingTest.point) newErrors.point = 'Point is required';
    if (!editingTest.duration) newErrors.duration = 'Duration is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (editingTest.id) {
        await api.put(`/testSystem/${editingTest.id}`, editingTest);
        toast.success('Update successful');
      } else {
        await api.post('/testSystem', editingTest);
        toast.success('Create successful');
      }
      fetchAllData();
      closeModal();
    } catch (error) {
      toast.error('Error saving test');
    }
  };

  return (
    <div className="container">
      <Navbar />
      <div className="container-content">
        <h1 className="container-title">{t('managementTestSystem')}</h1>
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
                >
                  <option value="">{t('level')}</option>
                  <option value="1">{t('level')} 1</option>
                  <option value="2">{t('level')} 2</option>
                  <option value="3">{t('level')} 3</option>
                </select>
                <select
                  className="filter-dropdown"
                >
                  <option value="">{t('point')}</option>
                  <option value="1">{t('point')} 1</option>
                  <option value="2">{t('point')} 2</option>
                  <option value="3">{t('point')} 3</option>
                </select>
                <button className="export-button">{t('exportFile', { ns: 'common' })}</button>
              </div>
            </div>
            {/* <button
              className="bg-blue-500 text-white px-4 py-2 rounded-add"
              onClick={() => openModal('add')}
            >
              + {t('addNew', { ns: 'common' })}
            </button> */}
          </div>
        </div>

        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">{t('lessonName')}</th>
              <th className="p-3">{t('pupilld')}</th>
              <th className="p-3">{t('level')}</th>
              <th className="p-3">{t('point')}</th>
              <th className="p-3">{t('duration')}</th>
              {/* <th className="p-3">{t('action', { ns: 'common' })}</th>
              <th className="p-3">{t('available', { ns: 'common' })}</th> */}
            </tr>
          </thead>
          <tbody>
            {testSystems.map((test) => (
              <tr key={test.id} className="border-t">
                <td className="p-3">{lessons.find(l => l.id === test.lessonId)?.name?.[i18n.language]}</td>
                <td className="p-3">{pupils.find(p => p.id === test.pupilId)?.name}</td>
                <td className="p-3">{levels.find(l => l.id === test.levelId)?.name}</td>
                <td className="p-3">{test.point}</td>
                <td className="p-3">{test.duration}s</td>
                {/* <td className="p-3">
                  <button
                    className="text-white px-3 py-1 buttonupdate"
                    onClick={() => openModal('update', test)}
                  >
                    <img className="iconupdate" src={Imgs.edit} alt="Edit" />
                    {t('update', { ns: 'common' })}
                  </button>
                </td>
                <td className="p-3">
                  <label className="switch">
                    <input type="checkbox" checked={test.available} readOnly />
                    <span className="slider round"></span>
                  </label>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {/* <Modal
          title={
            <div style={{ textAlign: 'center', fontSize: '24px' }}>
              {editingTest?.id ? t('updateLesson') : t('addLesson')}
            </div>
          }
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          className="modal-content"
        >
          <div className="form-content-lesson">
            <div className="inputtext">
              <label className="titleinput">{t('lesson')}</label>
              <Select
                style={{ width: '100%', height: '50px' }}
                placeholder={t('inputgrade')}
                value={editingTest?.lessonId}
                onChange={(value) => setEditingTest({ ...editingTest, lessonId: value })}
              >
                {lessons.map(lesson => (
                  <Option key={lesson.id} value={lesson.id}>{lesson.name?.[i18n.language]}</Option>
                ))}
              </Select>
              {errors.lessonId && <div className="error-text">{errors.lessonId}</div>}
            </div>
            <div className="inputtext">
              <label className="titleinput">{t('pupil')}</label>
              <Select
                style={{ width: '100%', height: '50px' }}
                placeholder={t('inputgrade')}
                value={editingTest?.pupilId}
                onChange={(value) => setEditingTest({ ...editingTest, pupilId: value })}
              >
                {pupils.map(pupil => (
                  <Option key={pupil.id} value={pupil.id}>{pupil.name}</Option>
                ))}
              </Select>
              {errors.pupilId && <div className="error-text">{errors.pupilId}</div>}
            </div>
            <div className="inputtext">
              <label className="titleinput">{t('level')}</label>
              <Select
                style={{ width: '100%', height: '50px' }}
                placeholder={t('inputgrade')}
                value={editingTest?.levelId}
                onChange={(value) => setEditingTest({ ...editingTest, levelId: value })}
              >
                {levels.map(level => (
                  <Option key={level.id} value={level.id}>{level.name}</Option>
                ))}
              </Select>
              {errors.levelId && <div className="error-text">{errors.levelId}</div>}
            </div>

            <div className="inputtext">
              <label className="titleinput">{t('point')}</label>
              <Input
                placeholder={t('point')}
                value={editingTest?.point}
                onChange={(e) => setEditingTest({ ...editingTest, point: e.target.value })}
              />
              {errors.point && <div className="error-text">{errors.point}</div>}
            </div>

            <div className="inputtext">
              <label className="titleinput">{t('duration')}</label>
              <Input
                placeholder={t('duration')}
                value={editingTest?.duration}
                onChange={(e) => setEditingTest({ ...editingTest, duration: e.target.value })}
                addonAfter="s"
              />
              {errors.duration && <div className="error-text">{errors.duration}</div>}
            </div>
          </div>
          <div className="button-row">
            <Button type="primary" onClick={handleSave} block>
              {t('save', { ns: 'common' })}
            </Button>
            <Button type="primary" onClick={closeModal} block>
              {t('cancel', { ns: 'common' })}
            </Button>
          </div>
        </Modal> */}
      </div>
    </div>
  );
};

export default TestSystem;
