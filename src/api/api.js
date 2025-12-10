import axios from 'axios';

// Backend base URL
const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'https://worker-backend-1-ruzk.onrender.com/api' 
});

// Attach JWT token if present
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Auth APIs
export const authApi = {
    login: (data) => API.post('/users/login', data),
    signup: (data) => API.post('/users/signup', data),
    workerSignup: (data) => API.post('/workers/signup', data)
};

// Worker APIs
export const workerAPI = {
    getAllWorkers: (params) => API.get('/workers', { params }), // ✅ renamed
    getById: (id) => API.get(`/workers/${id}`)
};

// Booking APIs
export const bookingAPI = {
    create: (data) => API.post('/bookings', data),
    getUserBookings: () => API.get('/bookings'),
    cancelBooking: (id) => API.put(`/bookings/${id}/status`, { status: 'cancelled' }),
    updateStatus: (id, status) => API.put(`/bookings/${id}/status`, { status })
};

// Review APIs
export const reviewAPI = {
    createReview: (data) => API.post('/reviews', data),
    getWorkerReviews: (workerId) => API.get(`/reviews/worker/${workerId}`)
};

export default API;
