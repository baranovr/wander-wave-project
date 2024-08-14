import axios from 'axios';

const axiosPublicInstance = axios.create({
  baseURL: 'http://127.0.0.1:8008/api/',
});

export default axiosPublicInstance;
