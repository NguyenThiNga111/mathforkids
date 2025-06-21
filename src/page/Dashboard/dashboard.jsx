import Navbar from "../../component/Navbar";
import { useState, useEffect } from "react";
import api from "../../assets/api/Api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { FaMars, FaVenus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Select } from "antd";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar as BarChartComponent } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./dashboard.css";

const { Option } = Select;

ChartJS.register(...registerables, ChartDataLabels);

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
  const { t, i18n } = useTranslation(["dashboard", "common"]);

  // State for time period selections
  const [userTimePeriod, setUserTimePeriod] = useState("month");
  const [pupilTimePeriod, setPupilTimePeriod] = useState("month");
  // State for time period values
  const [selectedUserMonth, setSelectedUserMonth] = useState("05");
  const [selectedUserWeek, setSelectedUserWeek] = useState("01");
  const [selectedUserYear, setSelectedUserYear] = useState("2025");
  const [selectedPupilMonth, setSelectedPupilMonth] = useState("05");
  const [selectedPupilWeek, setSelectedPupilWeek] = useState("01");
  const [selectedPupilYear, setSelectedPupilYear] = useState("2025");
  // State for data
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [usersByGender, setUsersByGender] = useState({ male: 0, female: 0 });
  const [usersByTimePeriod, setUsersByTimePeriod] = useState({
    current: 0,
    previous: 0,
  });
  const [pupilsByTimePeriod, setPupilsByTimePeriod] = useState({
    current: 0,
    previous: 0,
  });
  const [lessonsByTimePeriod, setLessonsByTimePeriod] = useState({
    current: 0,
    previous: 0,
  });
  const [studentsByGradeData, setStudentsByGradeData] = useState([
    { grade: "1", count: 0 },
    { grade: "2", count: 0 },
    { grade: "3", count: 0 },
  ]);
  // State for top 10 pupils
  const [top10Pupils, setTop10Pupils] = useState([]);
  // State for top 10 lessons (NEW)
  const [top10Lessons, setTop10Lessons] = useState([]);

  // Fetch data
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
              return { grade: grade.toString(), count: response.data.count || 0 };
            } catch (error) {
              console.warn(`Failed to fetch data for grade ${grade}:`, error.message);
              return { grade: grade.toString(), count: 0 };
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
            current:
              userResponse.data.currentMonthCount ||
              userResponse.data.currentWeekCount ||
              userResponse.data.currentYearCount ||
              0,
            previous:
              userResponse.data.previousMonthCount ||
              userResponse.data.previousWeekCount ||
              userResponse.data.previousYearCount ||
              0,
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
            current:
              pupilResponse.data.currentMonthCount ||
              pupilResponse.data.currentWeekCount ||
              pupilResponse.data.currentYearCount ||
              0,
            previous:
              pupilResponse.data.previousMonthCount ||
              pupilResponse.data.previousWeekCount ||
              pupilResponse.data.previousYearCount ||
              0,
          };
        } catch (pupilError) {
          console.warn(`Pupil data fetch failed for ${pupilTimePeriod}:`, pupilError.message);
        }
        setPupilsByTimePeriod(pupilsByTimePeriodData);
        // Fetch top 10 pupils
        try {
          const top10PupilsResponse = await api.get("/test/top10PupilsByAveragePoint");
          const pupilsData = top10PupilsResponse.data.data || [];
          const pupilsWithNames = await Promise.all(
            pupilsData.map(async (pupil) => {
              try {
                const pupilDetailResponse = await api.get(`/pupil/${pupil.pupilId}`);
                return {
                  ...pupil,
                  fullName: pupilDetailResponse.data.fullName || `Pupil ${pupil.pupilId}`,
                };
              } catch (error) {
                console.warn(`Failed to fetch pupil ${pupil.pupilId}:`, error.message);
                return {
                  ...pupil,
                  fullName: `Pupil ${pupil.pupilId}`,
                };
              }
            })
          );
          setTop10Pupils(pupilsWithNames.slice(0, 10));
        } catch (error) {
          console.warn("Failed to fetch top 10 pupils:", error.message);
          setTop10Pupils([]);
        }
        // Fetch top 10 lessons (NEW)
        try {
          const top10LessonsResponse = await api.get("/test/top10TestsByAveragePoint");
          const lessonsData = top10LessonsResponse.data.data || [];
          const lessonsWithNames = await Promise.all(
            lessonsData.map(async (lesson) => {
              try {
                const lessonDetailResponse = await api.get(`/lesson/${lesson.lessonId}`);
                return {
                  ...lesson,
                  name: lessonDetailResponse.data.name?.[i18n.language] || `Lesson ${lesson.lessonId}`,
                };
              } catch (error) {
                console.warn(`Failed to fetch lesson ${lesson.lessonId}:`, error.message);
                return {
                  ...lesson,
                  name: `Lesson ${lesson.lessonId}`,
                };
              }
            })
          );
          setTop10Lessons(lessonsWithNames.slice(0, 10));
        } catch (error) {
          console.warn("Failed to fetch top 10 lessons:", error.message);
          setTop10Lessons([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    userTimePeriod,
    selectedUserMonth,
    selectedUserWeek,
    selectedUserYear,
    pupilTimePeriod,
    selectedPupilMonth,
    selectedPupilWeek,
    selectedPupilYear,
  ]);

  // Calculate trends
  const userTrend =
    usersByTimePeriod.previous > 0 && usersByTimePeriod.current >= 0
      ? ((usersByTimePeriod.current - usersByTimePeriod.previous) /
        usersByTimePeriod.previous *
        100).toFixed(1)
      : 0;
  const userTrendDirection = userTrend >= 0 ? "up" : "down";
  const userTrendText =
    usersByTimePeriod.current === 0 && usersByTimePeriod.previous === 0
      ? t("noChange")
      : `${Math.abs(userTrend)}% ${t(userTrendDirection)} ${t(
        "fromPrevious"
      )}`;

  const studentTrend =
    pupilsByTimePeriod.previous > 0 && pupilsByTimePeriod.current >= 0
      ? ((pupilsByTimePeriod.current - pupilsByTimePeriod.previous) /
        pupilsByTimePeriod.previous *
        100).toFixed(1)
      : 0;
  const studentTrendDirection = studentTrend >= 0 ? "up" : "down";
  const studentTrendText =
    pupilsByTimePeriod.current === 0 && pupilsByTimePeriod.previous === 0
      ? t("noChange")
      : `${Math.abs(studentTrend)}% ${t(studentTrendDirection)} ${t(
        "fromPrevious"
      )}`;

  const lessonTrend =
    lessonsByTimePeriod.previous > 0 && lessonsByTimePeriod.current >= 0
      ? ((lessonsByTimePeriod.current - lessonsByTimePeriod.previous) /
        lessonsByTimePeriod.previous *
        100).toFixed(1)
      : 0;
  const lessonTrendDirection = lessonTrend >= 0 ? "up" : "down";
  const lessonTrendText =
    lessonsByTimePeriod.current === 0 && lessonsByTimePeriod.previous === 0
      ? t("noChange")
      : `${Math.abs(lessonTrend)}% ${t(lessonTrendDirection)} ${t(
        "fromPrevious"
      )} ${t(userTimePeriod)}`;

  const dominantGender =
    usersByGender.male >= usersByGender.female ? "Male" : "Female";
  const dominantGenderCount =
    usersByGender.male >= usersByGender.female ? usersByGender.male : usersByGender.female;
  const genderDifference =
    usersByGender.male + usersByGender.female > 0
      ? Math.abs(usersByGender.male - usersByGender.female) /
      (usersByGender.male + usersByGender.female) *
      100
      : 0;
  const genderPercentage = genderDifference.toFixed(1);
  const genderText =
    usersByGender.male + usersByGender.female === 0
      ? t("noData")
      : `${t(dominantGender)}: ${genderPercentage}% ${t("ofTotalUsers")}`;

  // Generate week options
  const weeks = Array.from({ length: 52 }, (_, i) => ({
    label: `${t("Week")} ${i + 1}`,
    value: (i + 1).toString().padStart(2, "0"),
  }));

  // Generate year options
  const years = Array.from({ length: 6 }, (_, i) => {
    const year = 2020 + i;
    return { label: year.toString(), value: year.toString() };
  });

  // Chart data for Top 10 Pupils
  const top10PupilsChartData = {
    labels: top10Pupils.map((pupil) => pupil.fullName),
    datasets: [
      {
        label: t("AveragePoint"),
        data: top10Pupils.map((pupil) => pupil.averagePoint || 0),
        backgroundColor: [
          "#ef4444", "#f59e0b", "#a855f7", "#f97316", "#10b981",
          "#3b82f6", "#84cc16", "#ec4899", "#8b5cf6", "#64748b",
        ].slice(0, top10Pupils.length), // Sử dụng màu sắc cho số lượng thực tế
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const top10LessonsChartData = {
    labels: top10Lessons.map((lesson) => lesson.name),
    datasets: [
      {
        label: t("AveragePoint"),
        data: top10Lessons.map((lesson) => lesson.averagePoint || 0),
        backgroundColor: [
          "#ef4444", "#f59e0b", "#a855f7", "#f97316", "#10b981",
          "#3b82f6", "#84cc16", "#ec4899", "#8b5cf6", "#64748b",
        ].slice(0, top10Lessons.length), // Sử dụng màu sắc cho số lượng thực tế
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };
  const top10PupilsChartOptions = {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#ffffff",
        font: { weight: "bold" },
        formatter: (value) => value.toFixed(2),
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: t("Points") },
        ticks: { callback: (value) => value.toFixed(2) },
        min: 0,
        max: 100, // Đặt giới hạn tối đa để đồng nhất với hình ảnh
      },
      y: {
        title: { display: true, text: t("pupils") },
      },
    },
  };

  const top10LessonsChartOptions = {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#ffffff",
        font: { weight: "bold" },
        formatter: (value) => value.toFixed(2),
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: t("Points") },
        ticks: { callback: (value) => value.toFixed(2) },
        min: 0,
        max: 100, // Đặt giới hạn tối đa để đồng nhất với hình ảnh
      },
      y: {
        title: { display: true, text: t("lessons") },
      },
    },
  };

  return (
    <div className="containers">
      <Navbar />
      <h1 className="container-title">{t("Dashboard")}</h1>
      <div className="containers-contentunqie">
        {/* Statistics Cards */}
        <div className="stats-container">
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">{t("TotalUser")}</h3>
                  <p className="card-value">{totalUsers.toLocaleString()}</p>
                  <p className={`card-trend ${userTrendDirection}`}>
                    {usersByTimePeriod.current === 0 &&
                      usersByTimePeriod.previous === 0 ? (
                      userTrendText
                    ) : (
                      <>
                        <span className="trend-icon">
                          {userTrendDirection === "up" ? "↑" : "↓"}
                        </span>
                        {userTrendText}
                      </>
                    )}
                  </p>
                </div>
                <div
                  className="card-icon"
                  style={{ backgroundColor: "#dbeafe" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="#93c5fd"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-yellow">
              <p>{t("TotalUser")}</p>
            </div>
          </div>
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">{t("TotalStudent")}</h3>
                  <p className="card-value">{totalStudents.toLocaleString()}</p>
                  <p className={`card-trend ${studentTrendDirection}`}>
                    {pupilsByTimePeriod.current === 0 &&
                      pupilsByTimePeriod.previous === 0 ? (
                      studentTrendText
                    ) : (
                      <>
                        <span className="trend-icon">
                          {studentTrendDirection === "up" ? "↑" : "↓"}
                        </span>
                        {studentTrendText}
                      </>
                    )}
                  </p>
                </div>
                <div
                  className="card-icon"
                  style={{ backgroundColor: "#fef3c7" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="#fcd34d"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-red">
              <p>{t("TotalStudent")}</p>
            </div>
          </div>
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">{t("UsersByGender")}</h3>
                  <p className="card-value">{dominantGenderCount.toLocaleString()}</p>
                  <p className={`card-trend ${dominantGender.toLowerCase()}`}>
                    {genderText}
                  </p>
                </div>
                <div
                  className="card-icon"
                  style={{ backgroundColor: "#d1fae5" }}
                >
                  {dominantGender === "Male" ? (
                    <FaMars
                      style={{ color: "#34d399", width: "24px", height: "24px" }}
                    />
                  ) : (
                    <FaVenus
                      style={{ color: "#34d399", width: "24px", height: "24px" }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="card-footer footer-blue">
              <p>{t("UsersByGender")}</p>
            </div>
          </div>
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">{t("TotalLessons")}</h3>
                  <p className="card-value">{totalLessons.toLocaleString()}</p>
                  <p className={`card-trend ${lessonTrendDirection}`}>
                    {lessonsByTimePeriod.current === 0 &&
                      lessonsByTimePeriod.previous === 0 ? (
                      lessonTrendText
                    ) : (
                      <>
                        <span className="trend-icon">
                          {lessonTrendDirection === "up" ? "↑" : "↓"}
                        </span>
                        {lessonTrendText}
                      </>
                    )}
                  </p>
                </div>
                <div
                  className="card-icon"
                  style={{ backgroundColor: "#fed7aa" }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="#fb923c"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332-.477-4.5-1.253"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-green">
              <p>{t("TotalLessons")}</p>
            </div>
          </div>
        </div>

        {/* Charts and Top 10 Charts */}
        <div className="charts-container">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">{t("StatisticsUser")}</h3>
              <div className="chart-controls">
                <Select
                  value={userTimePeriod}
                  onChange={setUserTimePeriod}
                  className="filter-dropdown"
                  style={{ width: 120 }}
                >
                  <Option value="month">{t("Month")}</Option>
                  <Option value="week">{t("Week")}</Option>
                  <Option value="year">{t("Year")}</Option>
                </Select>
                {userTimePeriod === "month" && (
                  <Select
                    value={selectedUserMonth}
                    onChange={setSelectedUserMonth}
                    className="filter-dropdown"
                    style={{ width: 120 }}
                    placeholder={t("SelectMonth")}
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
                    placeholder={t("SelectWeek")}
                  >
                    {weeks.map((week) => (
                      <Option key={week.value} value={week.value}>
                        {week.label}
                      </Option>
                    ))}
                  </Select>
                )}
                {(userTimePeriod === "month" ||
                  userTimePeriod === "week" ||
                  userTimePeriod === "year") && (
                    <Select
                      value={selectedUserYear}
                      onChange={setSelectedUserYear}
                      className="filter-dropdown"
                      style={{ width: 120 }}
                      placeholder={t("SelectYear")}
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
              <BarChart
                data={[
                  { name: t("Previous"), value: usersByTimePeriod.previous },
                  { name: t("Current"), value: usersByTimePeriod.current },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  domain={[0, 30]}
                  ticks={[0, 10, 20, 30]}
                  label={{
                    value: t("StatisticsUser"),
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: 'var(--color-cardtitle)' },
                    offset: 10,
                  }}
                  className="YAxis"
                />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">{t("StatisticsStudent")}</h3>
              <div className="chart-controls">
                <Select
                  value={pupilTimePeriod}
                  onChange={setPupilTimePeriod}
                  className="filter-dropdown"
                  style={{ width: 120 }}
                >
                  <Option value="month">{t("Month")}</Option>
                  <Option value="week">{t("Week")}</Option>
                  <Option value="year">{t("Year")}</Option>
                </Select>
                {pupilTimePeriod === "month" && (
                  <Select
                    value={selectedPupilMonth}
                    onChange={setSelectedPupilMonth}
                    className="filter-dropdown"
                    style={{ width: 120 }}
                    placeholder={t("SelectMonth")}
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
                    placeholder={t("SelectWeek")}
                  >
                    {weeks.map((week) => (
                      <Option key={week.value} value={week.value}>
                        {week.label}
                      </Option>
                    ))}
                  </Select>
                )}
                {(pupilTimePeriod === "month" ||
                  pupilTimePeriod === "week" ||
                  pupilTimePeriod === "year") && (
                    <Select
                      value={selectedPupilYear}
                      onChange={setSelectedPupilYear}
                      className="filter-dropdown"
                      style={{ width: 120 }}
                      placeholder={t("SelectYear")}
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
              <LineChart
                data={[
                  { name: t("Previous"), value: pupilsByTimePeriod.previous },
                  { name: t("Current"), value: pupilsByTimePeriod.current },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis
                  label={{
                    value: t("StatisticsStudent"),
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: 'var(--color-cardtitle)' },
                    offset: 10,
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">{t("StudentsByGrade")}</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentsByGradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="grade"
                  label={{
                    value: t("Grade"),
                    position: "insideBottom",
                    style: { textAnchor: "middle", fill: 'var(--color-cardtitle)' },
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: t("NumberOfStudents"),
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: 'var(--color-cardtitle)' },
                    offset: 10,
                  }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Top 10 Pupils Chart */}
          <div className="chart-card top-10-pupils">
            <div className="chart-header">
              <h3 className="chart-title">{t("Top10PupilsByAveragePoint")}</h3>
            </div>
            <div className="chart-container">
              <BarChartComponent
                data={top10PupilsChartData}
                options={top10PupilsChartOptions}
              />
            </div>
          </div>

          {/* Top 10 Lessons Chart */}
          <div className="chart-card top-10-lessons">
            <div className="chart-header">
              <h3 className="chart-title">{t("Top10LessonsByAveragePoint")}</h3>
            </div>
            <div className="chart-container">
              <BarChartComponent
                data={top10LessonsChartData}
                options={top10LessonsChartOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;