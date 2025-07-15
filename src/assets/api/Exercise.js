import api from "./Api";

export const countExerciseByLessonAndDisabledStatus = async (lessonId) => {
  try {
    const response = await api.get(
      `/exercise/countByLessonAndDisabledStatus/${lessonId}`,
      {
        params: {
          isDisabled: "false",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error counting exercises:", error);
    return [];
  }
};

export const filterExerciseByIsDisabled = async (
  lessonId,
  pageSize,
  startAfterId
) => {
  try {
    const response = await api.get(`/exercise/filterByIsDisabled/${lessonId}`, {
      params: {
        pageSize,
        startAfterId,
        isDisabled: "false",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
};

export const averageExercisePerLesson = async () => {
  try {
    const response = await api.get(`/exercise/averageExercisePerLesson`);
    return response.data;
  } catch (error) {
    console.error("Error getting average exercises:", error);
    return [];
  }
};