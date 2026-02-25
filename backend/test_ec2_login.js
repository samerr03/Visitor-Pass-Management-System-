const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://54.210.114.254:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });
        console.log('Login Success! Response Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.error('Login Failed with response:', err.response.status, err.response.data);
        } else {
            console.error('Login Error:', err.message);
        }
    }
}

testLogin();
