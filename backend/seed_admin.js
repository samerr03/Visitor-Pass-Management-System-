
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_management');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminEmail = 'admin@example.com';
        const adminPassword = 'password123';

        // Check if admin exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists');
            // Update password to ensure it matches
            adminExists.password = adminPassword;
            await adminExists.save();
            console.log(`Password reset to: ${adminPassword}`);
        } else {
            // Create admin user
            const user = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
            });
            console.log('Admin user created successfully');
            console.log(`Credentials: ${adminEmail} / ${adminPassword}`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
