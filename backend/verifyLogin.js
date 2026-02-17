const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: __dirname + "/.env" });

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const email = 'demo_admin@demo.com';
        const password = 'demo_password';

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found!");
        } else {
            console.log("User found:", user.email, user.role);
            const isMatch = await user.matchPassword(password);
            console.log("Password match result:", isMatch);
        }

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyLogin();
