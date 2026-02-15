const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/testdb';

const checkUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const email = 'admin@example.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User found:', user.email);
            console.log('Role:', user.role);
            console.log('Password hash:', user.password);

            // Test generic password
            const isMatch = await user.matchPassword('password123');
            console.log('Does "password123" match?', isMatch);
        } else {
            console.log('User not found');
        }

        process.exit(0);
    } catch (e) {
        console.log('ERROR:', e.message);
        process.exit(1);
    }
};

checkUser();
