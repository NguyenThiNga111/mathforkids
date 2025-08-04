import axios from 'axios';
const Api = axios.create({
    baseURL: 'https://mathforkids-be-1.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});
export default Api;
