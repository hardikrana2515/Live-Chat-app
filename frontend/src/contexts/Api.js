import axios from "axios"

const API = axios.create({
  baseURL:"http://localhost:4000/api/ChatApp",
  withCredentials: true
});

export default API;