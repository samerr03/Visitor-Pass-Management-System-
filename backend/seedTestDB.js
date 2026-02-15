const mongoose = require('mongoose');
const User = require('./models/User');

// Explicitly use testdb as per backend/.env
const MONGO_URI = 'mongodb://127.0.0.1:27017/testdb';

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB (testdb)');

        const email = 'security@example.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User exists, resetting password...');
            existingUser.password = 'password123';
            await existingUser.save();
            console.log('Password updated.');
        } else {
            console.log('Creating new user...');
            const newUser = new User({
                name: 'Security User',
                email: email,
                password: 'password123',
                role: 'security'
            });
            await newUser.save();
            console.log('User created.');
        }

        process.exit(0);
    } catch (e) {
        console.log('ERROR:', e.message);
        process.exit(1);
    }
};

seed();
