import axios from "axios";

export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const localApiUrl = "http://localhost:5000";

axios.interceptors.request.use((config) => {
  if (config.url?.startsWith(localApiUrl) && API_BASE_URL !== localApiUrl) {
    config.url = `${API_BASE_URL}${config.url.slice(localApiUrl.length)}`;
  }
  return config;
});
