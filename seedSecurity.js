const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');

dotenv.config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_management')
    .then(async () => {
        console.log('MongoDB Connected');

        const email = 'security@example.com';
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('Security user already exists');
            // Reset password to ensure we know it
            userExists.password = 'password123';
            await userExists.save();
            console.log('Password reset to: password123');
        } else {
            await User.create({
                name: 'Security Guard',
                email,
                password: 'password123',
                role: 'security'
            });
            console.log('Security user created');
        }

        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
