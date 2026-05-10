import axios from 'axios';

const api = axios.create({
  baseURL: 'https://employee-monitoring-backed.vercel.app/api'
});

console.log(api.getUri({ url: '/auth/admin/login' }));
console.log(api.getUri({ url: 'auth/admin/login' }));
