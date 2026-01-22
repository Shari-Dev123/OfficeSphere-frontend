const BASE_URL = "http://localhost:5000/api";

export const fetchAPI = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
      },
      ...options
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "API Error");
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
};
