import api from "./Api";

export const countUsersByWeek = async (startDate, endDate) => {
  try {
    const response = await api.get(
      `/user/countusersbyweek?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new users:", error);
    return [];
  }
};

export const countUsersByMonth = async (startMonth, endMonth) => {
  try {
    const response = await api.get(
      `/user/countusersbymonth?startMonth=${startMonth}&endMonth=${endMonth}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new users:", error);
    return [];
  }
};

export const countUsersByQuarter = async (startYear, endYear) => {
  try {
    const response = await api.get(
      `/user/countUsersByQuarter?startYear=${startYear}&endYear=${endYear}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new users:", error);
    return [];
  }
};

export const countUsersBySeason = async (startYear, endYear) => {
  try {
    const response = await api.get(
      `/user/countUsersBySeason?startYear=${startYear}&endYear=${endYear}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new users:", error);
    return [];
  }
};

export const countUsersByYear = async (startYear, endYear) => {
  try {
    const response = await api.get(
      `/user/countusersbyyear?startYear=${startYear}&endYear=${endYear}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new users:", error);
    return [];
  }
};

export const countParents = async () => {
  try {
    const response = await api.get(`/user/countParents`);
    return response.data;
  } catch (error) {
    console.error("Error counting new parents:", error);
    return [];
  }
};
