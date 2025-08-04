import React, { useState, useEffect } from "react";
import { Segmented, Flex, Space } from "antd";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterOfYear);
import { useTranslation } from "react-i18next";
import FilterGradeAndType from "./FilterGradeAndType";
import FilterWeek from "./FilterWeek";
import FilterMonth from "./FilterMonth";
import FilterQuarter from "./FilterQuarter";
import FilterYear from "./FilterYear";
import LessonPoint_Week from "./LessonPoint_Week";
import LessonPoint_Month from "./LessonPoint_Month";
import LessonPoint_Quarter from "./LessonPoint_Quarter";
import LessonPoint_Year from "./LessonPoint_Year";

export default function LessonPoint() {
  const { t, i18n } = useTranslation("dashboard");
  const [tab, setTab] = useState("week");
  const [grade, setGrade] = useState(1);
  const [type, setType] = useState("addition");
  const [weekRange, setWeekRange] = useState([
    dayjs().startOf("week"),
    dayjs().endOf("week"),
  ]);
  const [monthRange, setMonthRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [quarterRange, setQuarterRange] = useState([
    dayjs().startOf("quarter"),
    dayjs().endOf("quarter"),
  ]);
  const [yearRange, setYearRange] = useState([
    dayjs().startOf("year"),
    dayjs().endOf("year"),
  ]);

  const renderComponent = () => {
    if (tab === "week") {
      return (
        <LessonPoint_Week weekRange={weekRange} grade={grade} type={type} />
      );
    } else if (tab === "year") {
      return (
        <LessonPoint_Year yearRange={yearRange} grade={grade} type={type} />
      );
    } else if (tab === "quarter") {
      return (
        <LessonPoint_Quarter
          quarterRange={quarterRange}
          grade={grade}
          type={type}
        />
      );
    } else
      return (
        <LessonPoint_Month monthRange={monthRange} grade={grade} type={type} />
      );
  };

  const options = [
    { label: t("week"), value: "week" },
    { label: t("month"), value: "month" },
    { label: t("quarter"), value: "quarter" },
    { label: t("year"), value: "year" },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center">
        <Segmented
          options={options}
          value={tab}
          onChange={(value) => setTab(value)}
        />
        <Space>
          <FilterGradeAndType
            type={type}
            setType={setType}
            grade={grade}
            setGrade={setGrade}
          />
          {tab === "week" && (
            <FilterWeek weekRange={weekRange} setWeekRange={setWeekRange} />
          )}
          {tab === "month" && (
            <FilterMonth
              selectedMonthRange={monthRange}
              setSelectedMonthRange={setMonthRange}
            />
          )}
          {tab === "quarter" && (
            <FilterQuarter
              quarterRange={quarterRange}
              setQuarterRange={setQuarterRange}
            />
          )}
          {tab === "year" && (
            <FilterYear
              selectedYearRange={yearRange}
              setSelectedYearRange={setYearRange}
            />
          )}
        </Space>
      </Flex>
      <div>{renderComponent()}</div>
    </div>
  );
}
