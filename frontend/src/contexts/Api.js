import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:4000/api/ChatApp",
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
    // Only redirect on 401 Unauthorized if not already on login or forgot password
    if (
      error.response &&
      error.response.status === 401 &&
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

export default API;