import api from "./Api";

export const countPupilsByWeek = async (startDate, endDate) => {
  try {
    const response = await api.get(
      `/pupil/countpupilsbyweek?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new pupils:", error);
    return [];
  }
};

export const countPupilsByMonth = async (startMonth, endMonth) => {
  try {
    const response = await api.get(
      `/pupil/countpupilsbymonth?startMonth=${startMonth}&endMonth=${endMonth}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new pupils:", error);
    return [];
  }
};

export const countPupilsByQuarter = async (startYear, endYear) => {
  try {
    const response = await api.get(
      `/pupil/countPupilsByQuarter?startYear=${startYear}&endYear=${endYear}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new pupils:", error);
    return [];
  }
};

export const countPupilsBySeason = async (startYear, endYear) => {
  try {
    const response = await api.get(
      `/pupil/countPupilsBySeason?startYear=${startYear}&endYear=${endYear}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new pupils:", error);
    return [];
  }
};

export const countPupilsByYear = async (startYear, endYear) => {
  try {
    const response = await api.get(
      `/pupil/countpupilsbyyear?startYear=${startYear}&endYear=${endYear}`
    );
    return response.data;
  } catch (error) {
    console.error("Error counting new pupils:", error);
    return [];
  }
};

export const countPupilsByGrade = async () => {
  try {
    const response = await api.get(`/pupil/countPupilsByGrade`);
    return response.data;
  } catch (error) {
    console.error("Error counting grade:", error);
    return [];
  }
};

export const countAll = async () => {
  try {
    const response = await api.get(`/pupil/countAll`);
    return response.data;
  } catch (error) {
    console.error("Error counting pupils:", error);
    return [];
  }
};
