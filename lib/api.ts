import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {

      const token =
        localStorage.getItem("token");

      console.log(
        "================================"
      );

      console.log(
        "API REQUEST:",
        config.method?.toUpperCase(),
        config.url
      );

      console.log(
        "API BASE URL:",
        config.baseURL
      );

      console.log(
        "JWT EXISTS:",
        !!token
      );

      console.log(
        "TOKEN LENGTH:",
        token?.length || 0
      );

      if (token) {

        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${token}`;

        console.log(
          "AUTHORIZATION HEADER: ATTACHED"
        );

      } else {

        console.log(
          "AUTHORIZATION HEADER: MISSING"
        );
      }

      console.log(
        "================================"
      );
    }

    return config;
  },
  (error) => {
    console.error(
      "API REQUEST INTERCEPTOR ERROR:",
      error
    );

    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {

    console.log(
      "API SUCCESS:",
      response.config.url,
      response.status
    );

    return response;
  },

  (error) => {

    console.error(
      "API ERROR:",
      error.config?.url,
      error.response?.status
    );

    console.error(
      "API ERROR RESPONSE:",
      error.response?.data
    );

    return Promise.reject(error);
  }
);

export default api;