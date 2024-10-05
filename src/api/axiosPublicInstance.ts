import axios from 'axios';

const axiosPublicInstance = axios.create({
  baseURL: 'https://wander-wave-backend.onrender.com/api/',
});

export default axiosPublicInstance;
