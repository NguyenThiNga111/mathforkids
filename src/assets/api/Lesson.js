import api from "./Api";

export const getByGradeAndType = async (grade, type) => {
  try {
    const response = await api.get("/lesson/getByGradeAndType", {
      params: {
        grade,
        type,
      },
    });
    return response.data; // Đây sẽ là mảng lesson đã map từ Firestore
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
};

export const countEnabledLesson = async () => {
  try {
    const response = await api.get("/lesson/countEnabledLesson");
    return response.data; // Đây sẽ là mảng lesson đã map từ Firestore
  } catch (error) {
    console.error("Error counting enabled lessons:", error);
    return [];
  }
};
