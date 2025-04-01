const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/api/login`,
    REGISTER: `${API_BASE_URL}/api/register`, // Assuming a register endpoint exists or will be added
    STUDENT_PROFILE: `${API_BASE_URL}/api/student-profile`,
    PROJECTS: `${API_BASE_URL}/api/projects`, // Add projects endpoint
    MOOC_CERTIFICATES: `${API_BASE_URL}/api/mooc-certificates`, // Add MOOC endpoint
    // Add other endpoints as needed
};

export default API_BASE_URL;
