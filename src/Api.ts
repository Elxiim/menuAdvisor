import Axios from 'axios';

const Api = Axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  // baseURL: "http://localhost:3008",
  headers: {},
});

export default Api;
