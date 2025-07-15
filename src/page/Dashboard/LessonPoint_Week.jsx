import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/plots";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getPointStatsByLessons } from "../../assets/api/Test";

export default function LessonPoint_Week({ weekRange, grade, type }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation("lesson");
  const lang = i18n.language;

  const fetchData = async () => {
    const [start, end] = weekRange;
    const formattedStart = start.startOf("day").toISOString();
    const formattedEnd = end.endOf("day").toISOString();
    console.log(formattedStart, formattedEnd);

    try {
      const rawResults = await getPointStatsByLessons(
        grade,
        type,
        formattedStart,
        formattedEnd
      );

      // Chuyển đổi từ dạng counts object sang mảng [lessonName, type, total]
      const transformed = [];
      for (const r of rawResults) {
        for (const key in r.counts) {
          transformed.push({
            lessonName: r.lessonName?.[lang],
            type: key,
            total: r.counts[key],
          });
        }
      }

      setData(transformed);
    } catch (error) {
      console.error("Failed to fetch point stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [lang, weekRange, grade, type]);

  const config = {
    data,
    xField: "lessonName",
    yField: "total",
    stack: true,
    colorField: "type",
    label: {
      text: ({ total }) => {
        return total ? total : "";
      },
      position: "inside",
      style: {
        fill: "#fff",
        // fontSize: "12px",
        fontWeight: "bold",
      },
    },
    axis: {
      x: {
        labelAutoEllipsis: {
          suffix: "...",
          minLength: 10,
          maxLength: 14,
        },
        labelAutoWrap: {
          wordWrapWidth: 80,
          maxLines: 1,
          recoverWhenFailed: true,
        },
        labelAlign: "horizontal",
        size: 10,
      },
    },
    height: 350,
  };

  return loading ? (
    <Flex justify="center" align="center" style={{ height: "371.5px" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex>
  ) : (
    <Column className="mt-3" {...config} />
  );
}
