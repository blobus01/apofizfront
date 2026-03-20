import axios from "axios";
import config from "./config";

const axiosV2 = axios.create({
  baseURL: config.domain + "/api/v2",
});

export default axiosV2;