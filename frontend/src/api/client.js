import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const healthAPI = {
    check: () => apiClient.get("/health"),
};

export const configAPI = {
    getICP: () => apiClient.get("/config/icp"),
    saveICP: (config) => apiClient.post("/config/icp", config),
};

export const companiesAPI = {
    getAll: (filters = {}) => apiClient.get("/companies", { params: filters }),
    getById: (id) => apiClient.get(`/companies/${id}`),
    scrapeLinkedIn: (id) => apiClient.post(`/scrape-linkedin/${id}`),
};

// Legacy alias for backward compatibility during transition
export const leadsAPI = companiesAPI;

export const webhookAPI = {
    sendTest: (data) => apiClient.post("/webhook/rb2b", data),
};

export default apiClient;
