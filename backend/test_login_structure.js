const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: 'demo_admin@demo.com',
            password: 'demo_password'
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
