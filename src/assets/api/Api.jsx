import axios from 'axios';
const Api = axios.create({
    baseURL: 'http://localhost:3003',
    headers: {
        'Content-Type': 'application/json',
    },
});
export default Api;
