const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: __dirname + "/.env" }); // Fix path if needed, usually just .env works if in root

const resetDemoPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const demoUsers = [
            { email: 'demo_admin@demo.com', password: 'demo_password' },
            { email: 'demo_security@demo.com', password: 'demo_password' }
        ];

        for (const u of demoUsers) {
            const user = await User.findOne({ email: u.email });
            if (user) {
                user.password = u.password; // Triggers pre-save hash
                await user.save();
                console.log(`Reset password for ${u.email}`);
            } else {
                console.log(`User ${u.email} not found, creating...`);
                await User.create({
                    name: u.email.split('@')[0],
                    email: u.email,
                    password: u.password,
                    role: u.email.includes('admin') ? 'admin' : 'security',
                    isDemo: true
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

resetDemoPasswords();
