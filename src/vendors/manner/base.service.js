const axios = require("axios");
const https = require("https");
const EnvironmentService = require("../../shared/environment.service");
 // Adjust the path accordingly

class MannerBaseService {
  #request;
  #token;

  constructor() {
    // Set up Axios instance with base URL and https agent
    this.#request = axios.create({
      baseURL: EnvironmentService.MANNER_BASE_URL(), // Get the base URL from environment service
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, 
      }),
    });

    // Axios request interceptor to attach the authorization token from headers
    this.#request.interceptors.request.use(
      async (config) => {
        //Retrieve the access token from the request headers

        // const token = this.req.headers["authorization"];
        const token = this.#token; 

        //Add token to Authorization header if it exists
        if (token) {
          config.headers["Authorization"] = `${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  setToken(token) {
    this.#token = token; // Set the token to the private variable
  }

  // Method to fetch data via GET request
  async getData(endpoint, request) {
    const newtoken = request.headers["authorization"];
    // Set the token before making the request
    this.setToken(newtoken);

    try {
      const response = await this.#request.get(endpoint);
      return response.data; // Return the response data
    } catch (error) {
      return error.response; // Handle and return the error response
    }
  }

  // Method to send data via POST request
  async postData(url, body,request) {
    const posttoken = request.headers["authorization"];
    this.setToken(posttoken);
    
    try {
      const response = await this.#request.post(url, body);
      return response.data; // Return the response data
    } catch (error) {
      return error.response.data; // Handle and return the error response
    }
  }

  async passToken(token) {
    try {
      return token;
    } catch (error) {
      return error.response.data;
    }
  }
}

module.exports = MannerBaseService;
