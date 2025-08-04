import api from "./Api";

export const countOptionByExercise = async (exerciseId, answer, options) => {
  try {
    const response = await api.post(
      `/testquestion/countOptionByExercise/${exerciseId}`,
      { answer, options }
    );
    return response.data;
  } catch (error) {
    console.error("Error counting:", error);
    return [];
  }
};
