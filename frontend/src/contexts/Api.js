import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api/ChatApp" : "http://localhost:4000/api/ChatApp"),
  withCredentials: true
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    req.headers.Authorization = token;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 Unauthorized if not on a public page
    if (
      error.response &&
      error.response.status === 401 &&
      window.location.pathname !== "/" &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/password")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:4000");
  return apiUrl.replace(/\/api\/ChatApp\/?$/, "");
};

export default API;