const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getScholarships() {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships`);

    if (!response.ok) {
      throw new Error("Failed to fetch scholarships");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    throw error;
  }
}

export async function getStudentProfile(studentId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/students/${studentId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch student profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw error;
  }
}
export function getApiBaseUrl() {
  return API_BASE_URL;
}