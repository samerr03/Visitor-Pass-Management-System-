
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

const verifyLogin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_management');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Using Database: ${conn.connection.name}`);

        const email = 'admin@example.com';
        const password = 'password123';

        // Check if admin exists
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User NOT FOUND');
            process.exit(1);
        }

        console.log(`User found: ${user.email}`);
        console.log(`Stored Hashed Password: ${user.password}`);

        // Manually check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password Match Result: ${isMatch}`);

        if (isMatch) {
            console.log('SUCCESS: Login verification passed.');
        } else {
            console.log('FAILURE: Password mismatch.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

verifyLogin();
