
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');

// Explicitly load .env
const envPath = path.join(__dirname, '.env');
const result = dotenv.config({ path: envPath });

console.log('Loading .env from:', envPath);
if (result.error) {
    console.error('Error loading .env:', result.error);
}

console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'FOUND (Filtered)' : 'NOT FOUND');
console.log('JWT_REFRESH_SECRET from env:', process.env.JWT_REFRESH_SECRET ? 'FOUND (Filtered)' : 'NOT FOUND');

try {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is missing');
    }

    const token = jwt.sign({ id: 'test' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    console.log('SUCCESS: JWT generated successfully.');
} catch (error) {
    console.error('FAILURE:', error.message);
}
