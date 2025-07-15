import React, { useState, useEffect } from "react";
import { Segmented, Flex, Space } from "antd";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterOfYear);
import { useTranslation } from "react-i18next";
import FilterGrade from "./FilterGrade";
import FilterWeek from "./FilterWeek";
import FilterMonth from "./FilterMonth";
import FilterQuarter from "./FilterQuarter";
import FilterYear from "./FilterYear";
import MathTypePoint_Week from "./MathTypePoint_Week";
import MathTypePoint_Month from "./MathTypePoint_Month";
import MathTypePoint_Quarter from "./MathTypePoint_Quarter";
import MathTypePoint_Year from "./MathTypePoint_Year";

export default function MathTypePoint() {
  const { t, i18n } = useTranslation("dashboard");
  const [tab, setTab] = useState("week");
  const [grade, setGrade] = useState(1);
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
      return <MathTypePoint_Week weekRange={weekRange} grade={grade} />;
    } else if (tab === "year") {
      return <MathTypePoint_Year yearRange={yearRange} grade={grade} />;
    } else if (tab === "quarter") {
      return (
        <MathTypePoint_Quarter quarterRange={quarterRange} grade={grade} />
      );
    } else return <MathTypePoint_Month monthRange={monthRange} grade={grade} />;
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
          <FilterGrade grade={grade} setGrade={setGrade} />
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
