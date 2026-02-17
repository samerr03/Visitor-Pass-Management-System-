const axios = require('axios');

const API_URL = 'http://localhost:5000/api/admin/create-security';

// Mock Admin Token (In a real scenario, we'd need a valid token. 
// For this quick test, we might struggle if auth is strict. 
// Let's assume we can mock the request or purely rely on code review if token generation is complex.)
// Actually, I can use the login function I saw earlier to get a token.

const testValidation = async () => {
    try {
        // 1. Login as Admin
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123' // Found in seed_admin.js
        });

        const token = loginRes.data.token;
        console.log('Logged in as Admin');

        // 2. Test Invalid Phone (9 digits)
        try {
            await axios.post(API_URL, {
                name: 'Test Staff',
                email: 'test@staff.com',
                password: 'password',
                phone: '123456789'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('Test Failed: Allowed 9 digits');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('Success: Blocked 9 digits');
            } else {
                console.error('Test Error:', err.message);
            }
        }

        // 3. Test Invalid Phone (11 digits)
        try {
            await axios.post(API_URL, {
                name: 'Test Staff',
                email: 'test@staff.com',
                password: 'password',
                phone: '12345678901'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('Test Failed: Allowed 11 digits');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('Success: Blocked 11 digits');
            } else {
                console.error('Test Error:', err.message);
            }
        }

    } catch (err) {
        console.error('Login Failed or Server Error:', err.message);
    }
};

testValidation();
