const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/api/login`,
    STUDENT_PROFILE: `${API_BASE_URL}/api/student-profile`,
    // Add other endpoints as needed
};

export default API_BASE_URL;
