const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'security'], default: 'security' },
    isDemo: { type: Boolean, default: false },
});

// Method to check password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

const debugLogin = async () => {
    try {
        console.log('Connecting to DB:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const users = await User.find({});
        console.log(`\nFound ${users.length} users in database:\n`);

        for (const user of users) {
            console.log('------------------------------------------------');
            console.log(`Email:    ${user.email}`);
            console.log(`Role:     ${user.role}`);
            console.log(`IsDemo:   ${user.isDemo}`);
            console.log(`Hash:     ${user.password.substring(0, 20)}...`);

            // Check against common passwords
            const candidates = ['password123', '123456', 'demo_password'];
            let matched = null;

            for (const pwd of candidates) {
                const isMatch = await bcrypt.compare(pwd, user.password);
                if (isMatch) {
                    matched = pwd;
                    break;
                }
            }

            if (matched) {
                console.log(`✅ Password matches: "${matched}"`);
            } else {
                console.log(`❌ Password does NOT match: password123, 123456, or demo_password`);
            }
        }
        console.log('------------------------------------------------');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

debugLogin();
