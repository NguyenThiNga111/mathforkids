import Navbar from "../../component/Navbar";
import { useState, useEffect } from "react";
import api from '../../assets/api/Api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FaMars, FaVenus, FaCrown, FaGraduationCap, FaUsers, FaUserGraduate, FaEdit } from 'react-icons/fa';

import { useTranslation } from 'react-i18next';
import { Select } from 'antd'; // Import Ant Design Select
import "./dashboard.css";

const { Option } = Select; // Destructure Option from Select

const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const Dashboard = () => {
  const { t } = useTranslation(['dashboard', 'common']);

  // State for time period selections
  const [userTimePeriod, setUserTimePeriod] = useState("month");
  const [pupilTimePeriod, setPupilTimePeriod] = useState("month");
  // State for time period values (month, week, year)
  const [selectedUserMonth, setSelectedUserMonth] = useState("05");
  const [selectedUserWeek, setSelectedUserWeek] = useState("1");
  const [selectedUserYear, setSelectedUserYear] = useState("2025");
  const [selectedPupilMonth, setSelectedPupilMonth] = useState("05");
  const [selectedPupilWeek, setSelectedPupilWeek] = useState("1");
  const [selectedPupilYear, setSelectedPupilYear] = useState("2025");
  // State for data
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [usersByGender, setUsersByGender] = useState({ male: 0, female: 0 });
  const [usersByTimePeriod, setUsersByTimePeriod] = useState({ current: 0, previous: 0 });
  const [pupilsByTimePeriod, setPupilsByTimePeriod] = useState({ current: 0, previous: 0 });
  const [lessonsByTimePeriod, setLessonsByTimePeriod] = useState({ current: 0, previous: 0 });
  const [studentsByGradeData, setStudentsByGradeData] = useState([
    { grade: "1", count: 0 },
    { grade: "2", count: 0 },
    { grade: "3", count: 0 },
  ]);

  // Fetch data based on selected time period
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total users
        const userResponse = await api.get("/user/countAll");
        setTotalUsers(userResponse.data.count || 0);
        // Fetch total students
        const studentResponse = await api.get("/pupil/countAll");
        setTotalStudents(studentResponse.data.count || 0);
        // Fetch total lessons
        const lessonResponse = await api.get("/lesson/countAllLesson");
        setTotalLessons(lessonResponse.data.count || 0);
        // Fetch students by grade
        const grades = [1, 2, 3];
        const gradeData = await Promise.all(
          grades.map(async (grade) => {
            try {
              const response = await api.get(`/pupil/countByGrade?grade=${grade}`);
              return { grade, count: response.data.count || 0 };
            } catch (error) {
              console.warn(`Failed to fetch data for grade ${grade}:`, error.message);
              return { grade, count: 0 };
            }
          })
        );
        setStudentsByGradeData(gradeData);
        // Fetch users by selected time period
        let usersByTimePeriodData = { current: 0, previous: 0 };
        try {
          let userEndpoint = "";
          let userParams = { year: selectedUserYear };
          if (userTimePeriod === "month") {
            userEndpoint = "/user/countusersbymonth";
            userParams.month = selectedUserMonth;
          } else if (userTimePeriod === "week") {
            userEndpoint = "/user/countusersbyweek";
            userParams.week = selectedUserWeek;
          } else if (userTimePeriod === "year") {
            userEndpoint = "/user/countusersbyyear";
          }

          const userResponse = await api.get(userEndpoint, { params: userParams });
          usersByTimePeriodData = {
            current: userResponse.data.currentMonthCount || userResponse.data.currentWeekCount || userResponse.data.currentYearCount || 0,
            previous: userResponse.data.previousMonthCount || userResponse.data.previousWeekCount || userResponse.data.previousYearCount || 0,
          };
        } catch (userError) {
          console.warn(`User data fetch failed for ${userTimePeriod}:`, userError.message);
        }
        setUsersByTimePeriod(usersByTimePeriodData);
        // Fetch users by gender
        try {
          const maleResponse = await api.get("/user/countByGender?gender=Male");
          const femaleResponse = await api.get("/user/countByGender?gender=Female");
          setUsersByGender({
            male: maleResponse.data.count || 0,
            female: femaleResponse.data.count || 0,
          });
        } catch (genderError) {
          console.warn("Failed to fetch users by gender:", genderError.message);
        }
        // Fetch pupils by selected time period
        let pupilsByTimePeriodData = { current: 0, previous: 0 };
        try {
          let pupilEndpoint = "";
          let pupilParams = { year: selectedPupilYear };
          if (pupilTimePeriod === "month") {
            pupilEndpoint = "/pupil/countpupilsbymonth";
            pupilParams.month = selectedPupilMonth;
          } else if (pupilTimePeriod === "week") {
            pupilEndpoint = "/pupil/countpupilsbyweek";
            pupilParams.week = selectedPupilWeek;
          } else if (pupilTimePeriod === "year") {
            pupilEndpoint = "/pupil/countpupilsbyyear";
          }

          const pupilResponse = await api.get(pupilEndpoint, { params: pupilParams });
          pupilsByTimePeriodData = {
            current: pupilResponse.data.currentMonthCount || pupilResponse.data.currentWeekCount || pupilResponse.data.currentYearCount || 0,
            previous: pupilResponse.data.previousMonthCount || pupilResponse.data.previousWeekCount || pupilResponse.data.previousYearCount || 0,
          };
        } catch (pupilError) {
          console.warn(`Pupil data fetch failed for ${pupilTimePeriod}:`, pupilError.message);
        }
        setPupilsByTimePeriod(pupilsByTimePeriodData); // Corrected line
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    userTimePeriod, selectedUserMonth, selectedUserWeek, selectedUserYear,
    pupilTimePeriod, selectedPupilMonth, selectedPupilWeek, selectedPupilYear
  ]);

  // Calculate trends
  const userTrend = (usersByTimePeriod.previous > 0 && usersByTimePeriod.current >= 0 && usersByTimePeriod.previous >= 0)
    ? ((usersByTimePeriod.current - usersByTimePeriod.previous) / usersByTimePeriod.previous * 100).toFixed(1)
    : 0;
  const userTrendDirection = userTrend >= 0 ? "up" : "down";
  const userTrendText = (usersByTimePeriod.current === 0 && usersByTimePeriod.previous === 0)
    ? t('noChange')
    : `${Math.abs(userTrend)}% ${t(userTrendDirection)} ${t('fromPrevious')} ${t(userTimePeriod)}`;

  const studentTrend = (pupilsByTimePeriod.previous > 0 && pupilsByTimePeriod.current >= 0 && pupilsByTimePeriod.previous >= 0)
    ? ((pupilsByTimePeriod.current - pupilsByTimePeriod.previous) / pupilsByTimePeriod.previous * 100).toFixed(1)
    : 0;
  const studentTrendDirection = studentTrend >= 0 ? "up" : "down";
  const studentTrendText = (pupilsByTimePeriod.current === 0 && pupilsByTimePeriod.previous === 0)
    ? t('noChange')
    : `${Math.abs(studentTrend)}% ${t(studentTrendDirection)} ${t('fromPrevious')} ${t(pupilTimePeriod)}`;

  const lessonTrend = (lessonsByTimePeriod.previous > 0 && lessonsByTimePeriod.current >= 0 && lessonsByTimePeriod.previous >= 0)
    ? ((lessonsByTimePeriod.current - lessonsByTimePeriod.previous) / lessonsByTimePeriod.previous * 100).toFixed(1)
    : 0;
  const lessonTrendDirection = lessonTrend >= 0 ? "up" : "down";
  const lessonTrendText = (lessonsByTimePeriod.current === 0 && lessonsByTimePeriod.previous === 0)
    ? t('noChange')
    : `${Math.abs(lessonTrend)}% ${t(lessonTrendDirection)} ${t('fromPrevious')} ${t(userTimePeriod)}`;

  const dominantGender = usersByGender.male >= usersByGender.female ? 'Male' : 'Female';
  const dominantGenderCount = usersByGender.male >= usersByGender.female ? usersByGender.male : usersByGender.female;
  const genderDifference = usersByGender.male + usersByGender.female > 0
    ? Math.abs(usersByGender.male - usersByGender.female) / (usersByGender.male + usersByGender.female) * 100
    : 0;
  const genderPercentage = genderDifference.toFixed(1);
  const genderText = usersByGender.male + usersByGender.female === 0
    ? t('noData')
    : `${t(dominantGender)}: ${genderPercentage}% ${t('ofTotalUsers')}`;


  // Generate week options (1 to 52)
  const weeks = Array.from({ length: 52 }, (_, i) => ({
    label: `${t('Week')} ${i + 1}`,
    value: (i + 1).toString().padStart(2, "0"),
  }));

  // Generate year options (e.g., 2020 to current year)
  const years = Array.from({ length: 6 }, (_, i) => {
    const year = 2020 + i;
    return { label: year.toString(), value: year.toString() };
  });

  return (
    <div className="containers">
      <Navbar />
      <h1 className="container-title">{t('Dashboard')}</h1>
      <div className="containers-contentunqie">
        {/* Statistics Cards */}
        <div className="stats-container">
          {/* Card 1: Total User */}
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">{t('TotalUser')}</h3>
                  <p className="card-value">{totalUsers.toLocaleString()}</p>
                  <p className={`card-trend ${userTrendDirection}`}>
                    {usersByTimePeriod.current === 0 && usersByTimePeriod.previous === 0 ? (
                      userTrendText
                    ) : (
                      <>
                        <span className="trend-icon">{userTrendDirection === "up" ? "↑" : "↓"}</span>
                        {userTrendText}
                      </>
                    )}
                  </p>
                </div>
                <div className="card-icon" style={{ backgroundColor: "#dbeafe" }}>
                  <svg className="w-6 h-6" fill="#93c5fd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-yellow">
              <p>{t('TotalUser')}</p>
            </div>
          </div>

          {/* Card 2: Total Student */}
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">{t('TotalStudent')}</h3>
                  <p className="card-value">{totalStudents.toLocaleString()}</p>
                  <p className={`card-trend ${studentTrendDirection}`}>
                    {pupilsByTimePeriod.current === 0 && pupilsByTimePeriod.previous === 0 ? (
                      studentTrendText
                    ) : (
                      <>
                        <span className="trend-icon">{studentTrendDirection === "up" ? "↑" : "↓"}</span>
                        {studentTrendText}
                      </>
                    )}
                  </p>
                </div>
                <div className="card-icon" style={{ backgroundColor: "#fef3c7" }}>
                  <svg className="w-6 h-6" fill="#fcd34d" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-red">
              <p>{t('TotalStudent')}</p>
            </div>
          </div>

          {/* Card 3: Users by Gender */}
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">{t('UsersByGender')}</h3>
                  <p className="card-value">{dominantGenderCount.toLocaleString()}</p>
                  <p className={`card-trend ${dominantGender.toLowerCase()}`}>
                    {genderText}
                  </p>
                </div>
                <div className="card-icon" style={{ backgroundColor: "#d1fae5" }}>
                  {dominantGender === 'Male' ? (
                    <FaMars style={{ color: "#34d399", width: "24px", height: "24px" }} />
                  ) : (
                    <FaVenus style={{ color: "#34d399", width: "24px", height: "24px" }} />
                  )}
                </div>
              </div>
            </div>
            <div className="card-footer footer-blue">
              <p>{t('UsersByGender')}</p>
            </div>
          </div>

          {/* Card 4: Total Lessons */}
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">{t('TotalLessons')}</h3>
                  <p className="card-value">{totalLessons.toLocaleString()}</p>
                  <p className={`card-trend ${lessonTrendDirection}`}>
                    {lessonsByTimePeriod.current === 0 && lessonsByTimePeriod.previous === 0 ? (
                      lessonTrendText
                    ) : (
                      <>
                        <span className="trend-icon">{lessonTrendDirection === "up" ? "↑" : "↓"}</span>
                        {lessonTrendText}
                      </>
                    )}
                  </p>
                </div>
                <div className="card-icon" style={{ backgroundColor: "#fed7aa" }}>
                  <svg className="w-6 h-6" fill="#fb923c" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332-.477-4.5-1.253"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-green">
              <p>{t('TotalLessons')}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          {/* Chart 1: Statistics User */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">{t('StatisticsUser')}</h3>
              <div className="chart-controls">
                <Select
                  value={userTimePeriod}
                  onChange={setUserTimePeriod}
                  className="filter-dropdown"
                  style={{ width: 120 }}
                >
                  <Option value="month">{t('Month')}</Option>
                  <Option value="week">{t('Week')}</Option>
                  <Option value="year">{t('Year')}</Option>
                </Select>
                {userTimePeriod === "month" && (
                  <Select
                    value={selectedUserMonth}
                    onChange={setSelectedUserMonth}
                    className="filter-dropdown"
                    style={{ width: 120 }}
                    placeholder={t('SelectMonth')}
                  >
                    {months.map((month) => (
                      <Option key={month.value} value={month.value}>
                        {t(month.label)}
                      </Option>
                    ))}
                  </Select>
                )}
                {userTimePeriod === "week" && (
                  <Select
                    value={selectedUserWeek}
                    onChange={setSelectedUserWeek}
                    className="filter-dropdown"
                    style={{ width: 120 }}
                    placeholder={t('SelectWeek')}
                  >
                    {weeks.map((week) => (
                      <Option key={week.value} value={week.value}>
                        {week.label}
                      </Option>
                    ))}
                  </Select>
                )}
                {(userTimePeriod === "month" || userTimePeriod === "week" || userTimePeriod === "year") && (
                  <Select
                    value={selectedUserYear}
                    onChange={setSelectedUserYear}
                    className="filter-dropdown"
                    style={{ width: 120 }}
                    placeholder={t('SelectYear')}
                  >
                    {years.map((year) => (
                      <Option key={year.value} value={year.value}>
                        {year.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: t('Previous'), value: usersByTimePeriod.previous },
                { name: t('Current'), value: usersByTimePeriod.current },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  domain={[0, 30]}
                  ticks={[0, 10, 20, 30]}
                  label={{ value: t('StatisticsUser'), angle: -90, position: 'insideLeft' }}
                />

                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Statistics Student */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">{t('StatisticsStudent')}</h3>
              <div className="chart-controls">
                <Select
                  value={pupilTimePeriod}
                  onChange={setPupilTimePeriod}
                  className="filter-dropdown"
                  style={{ width: 120 }}
                >
                  <Option value="month">{t('Month')}</Option>
                  <Option value="week">{t('Week')}</Option>
                  <Option value="year">{t('Year')}</Option>
                </Select>
                {pupilTimePeriod === "month" && (
                  <Select
                    value={selectedPupilMonth}
                    onChange={setSelectedPupilMonth}
                    className="filter-dropdown"
                    style={{ width: 120 }}
                    placeholder={t('SelectMonth')}
                  >
                    {months.map((month) => (
                      <Option key={month.value} value={month.value}>
                        {t(month.label)}
                      </Option>
                    ))}
                  </Select>
                )}
                {pupilTimePeriod === "week" && (
                  <Select
                    value={selectedPupilWeek}
                    onChange={setSelectedPupilWeek}
                    className="filter-dropdown"
                    style={{ width: 120 }}
                    placeholder={t('SelectWeek')}
                  >
                    {weeks.map((week) => (
                      <Option key={week.value} value={week.value}>
                        {week.label}
                      </Option>
                    ))}
                  </Select>
                )}
                {(pupilTimePeriod === "month" || pupilTimePeriod === "week" || pupilTimePeriod === "year") && (
                  <Select
                    value={selectedPupilYear}
                    onChange={setSelectedPupilYear}
                    className="filter-dropdown"
                    style={{ width: 120 }}
                    placeholder={t('SelectYear')}
                  >
                    {years.map((year) => (
                      <Option key={year.value} value={year.value}>
                        {year.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { name: t('Previous'), value: pupilsByTimePeriod.previous },
                { name: t('Current'), value: pupilsByTimePeriod.current },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis label={{ value: t('StatisticsStudent'), angle: -90, position: 'insideLeft' }} />

                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">{t('StudentsByGrade')}</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentsByGradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" label={{ value: t('Grade'), position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: t('NumberOfStudents'), angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;