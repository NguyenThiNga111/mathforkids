import { useEffect, useState } from "react";
import { Select, Avatar, Space, Flex, Segmented } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import api from "../assets/api/Api";
import { Imgs } from "../assets/theme/images";
import { useTranslation } from "react-i18next";
import logo from "../assets/images/logo.png";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState({ name: "", image: "" });
  const [userId, setUserID] = useState(null);

  const languageOptions = [
    { value: "English", label: "English", icon: Imgs.English },
    { value: "Tiếng Việt", label: "Tiếng Việt", icon: Imgs.VietNam },
  ];

  const selectedLang = i18n.language === "en" ? "English" : "Tiếng Việt";

  useEffect(() => {
    const storedUserId = localStorage.getItem("userID");
    setUserID(storedUserId);
    if (storedUserId) fetchUserData(storedUserId);
  }, []);

  const fetchUserData = async (id) => {
    try {
      const res = await api.get(`/user/${id}`);
      if (res.data) {
        setUser({
          name: res.data.fullName || "Admin",
          image: res.data.image || "https://i.pravatar.cc/100",
        });
        const langCode = res.data.language || "vi";
        i18n.changeLanguage(langCode);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLanguageChange = async (value) => {
    const lang = value === "English" ? "en" : "vi";
    i18n.changeLanguage(lang);
    if (userId) {
      try {
        await api.patch(`/user/updateProfile/${userId}`, { language: lang });
        fetchUserData(userId);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Flex
      justify="space-between"
      align="center"
      style={{
        padding: "0 16px 0 30px",
        backgroundColor: "#3366FF",
      }}
    >
      <Space size={0}>        
        <h4 style={{ margin: 0, fontWeight: "bold", color: "white" }}>
          Math Kids
        </h4>
        <img width={100} src={logo} alt="Logo" />
      </Space>
      <Space size="large">
        <Segmented
          size="middle"
          shape="round"
          options={[
            { value: "light", icon: <SunOutlined /> },
            { value: "dark", icon: <MoonOutlined /> },
          ]}
        />
        <Select
          value={selectedLang}
          style={{ width: 150 }}
          onChange={handleLanguageChange}
          options={languageOptions.map((opt) => ({
            value: opt.value,
            label: (
              <span>
                <img
                  src={opt.icon}
                  alt={opt.label}
                  width="20"
                  style={{ marginRight: 8 }}
                />
                {opt.label}
              </span>
            ),
          }))}
        />
        <div>
          <Avatar src={user.image} />
          <span style={{ marginLeft: 10, fontWeight: "bold", color: "white" }}>
            {user.name}
          </span>
        </div>
      </Space>
    </Flex>
  );
};

export default Navbar;
