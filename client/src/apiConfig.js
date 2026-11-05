import axios from "axios";

export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || window.location.origin
).replace(/\/+$/, "");

axios.defaults.baseURL = API_BASE_URL;
