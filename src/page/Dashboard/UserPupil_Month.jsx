import React, { useState, useEffect, useContext } from "react";
import { Line } from "@ant-design/plots";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UserContext } from "../../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { countUsersByMonth } from "../../assets/api/User";
import { countPupilsByMonth } from "../../assets/api/Pupil";

export default function UserPupil_Month({ selectedMonthRange }) {
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const fetchData = async () => {
    try {
      const [userData, pupilData] = await Promise.all([
        countUsersByMonth(selectedMonthRange[0], selectedMonthRange[1]),
        countPupilsByMonth(selectedMonthRange[0], selectedMonthRange[1]),
      ]);

      const formattedUsers = userData.data.map((item) => ({
        label: item.label,
        type: lang === "vi" ? "Phụ huynh mới" : "New parent",
        total: item.total,
      }));

      const formattedPupils = pupilData.data.map((item) => ({
        label: item.label,
        type: lang === "vi" ? "Học sinh mới" : "New pupil",
        total: item.total,
      }));

      setData([...formattedUsers, ...formattedPupils]);
    } catch (error) {
      toast.error(error.response?.data?.message?.[i18n.language], {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [lang, selectedMonthRange]);

  const config = {
    data,
    xField: "label",
    yField: "total",
    colorField: "type",
    shapeField: "smooth",
    theme: user?.mode === "dark" ? "dark" : "light",
    height: 420,
  };

  return loading ? (
    <Flex justify="center" align="center" style={{ height: "441.5px" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex>
  ) : (
    <Line className="mt-3" {...config} />
  );
}
