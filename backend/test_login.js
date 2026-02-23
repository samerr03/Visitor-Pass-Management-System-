const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: 'demo_admin@demo.com',
            password: 'demo_password'
        });
        console.log('Login Success! Token:', res.data.token.substring(0, 20) + '...');
        console.log('Role:', res.data.role);
    } catch (err) {
        console.error('Login Failed!', err.response?.data || err.message);
    }
}

testLogin();
