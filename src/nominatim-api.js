import axios from "axios";

const nominatimApi = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org'
})

export default nominatimApi