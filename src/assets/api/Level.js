import api from "./Api";

export const getEnabledLevels = async () => {
  try {
    const response = await api.get(`/level/getEnabledLevels`);
    return response.data;
  } catch (error) {
    console.error("Error fetching levels:", error);
    return [];
  }
};
