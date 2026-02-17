const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: __dirname + "/.env" });

const resetMainPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_management');
        console.log("Connected to DB");

        const mainUsers = [
            { email: 'admin@example.com', password: 'password123', role: 'admin', name: 'System Admin' },
            { email: 'security@example.com', password: 'password123', role: 'security', name: 'Security Staff' }
        ];

        for (const u of mainUsers) {
            let user = await User.findOne({ email: u.email });
            if (user) {
                user.password = u.password; // Triggers pre-save hash
                await user.save();
                console.log(`Reset password for ${u.email}`);
            } else {
                console.log(`User ${u.email} not found, creating...`);
                await User.create({
                    name: u.name,
                    email: u.email,
                    password: u.password,
                    role: u.role,
                    isDemo: false
                });
            }
        }

        console.log("Done");
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

resetMainPasswords();
