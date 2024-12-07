import axios from 'axios';

const api = axios.create({
    baseURL: 'https://mern-todo-app1.onrender.com/api',
    withCredentials : true,
});

export default api;
