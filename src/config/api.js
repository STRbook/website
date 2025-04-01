const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/api/login`,
    REGISTER: `${API_BASE_URL}/api/register`, 
    STUDENT_PROFILE: `${API_BASE_URL}/api/student-profile`,
    PROJECTS: `${API_BASE_URL}/api/projects`, 
    MOOC_CERTIFICATES: `${API_BASE_URL}/api/mooc-certificates`, 
    TEACHER_LOGIN: `${API_BASE_URL}/api/teacher/login`, 
    TEACHER_REGISTER: `${API_BASE_URL}/api/teacher/register`, 
    TEACHER_STUDENTS: `${API_BASE_URL}/api/teacher/students`, 
    
};

export default API_BASE_URL;
