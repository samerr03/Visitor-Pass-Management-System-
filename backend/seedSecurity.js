const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_management');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

const seedSecurityUser = async () => {
    try {
        await connectDB();

        const email = 'security@example.com';
        // Check if exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('Security user found. Resetting password...');
            user.password = 'password123';
            // Trigger save middleware to hash password
            await user.save();
            console.log('Success: Password reset.');
        } else {
            console.log('Creating new security user...');
            user = await User.create({
                name: 'Security Guard',
                email,
                password: 'password123',
                role: 'security'
            });
            console.log('Success: Security user created.');
        }

        console.log('Done.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedSecurityUser();
