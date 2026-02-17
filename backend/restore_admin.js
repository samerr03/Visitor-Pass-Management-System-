const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const restore = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = 'admin@example.com';
        const exists = await User.findOne({ email });

        if (exists) {
            console.log('Admin already exists.');
            let updated = false;

            // Ensure password is correct
            // (We assume it's correct or we reset it if we want, but let's just checking fields)
            // Actually, let's reset password to be sure.
            // exists.password = 'password123'; // Re-hash needed if we use save()? 
            // Wait, models/User.js likely has pre-save hash. Yes.

            if (!exists.staffId) {
                exists.staffId = 'ADMIN001';
                updated = true;
                console.log('Adding missing staffId');
            }
            if (!exists.phone) {
                exists.phone = '9876543210';
                updated = true;
                console.log('Adding missing phone');
            }
            if (!exists.designation) {
                exists.designation = 'System Administrator';
                updated = true;
                console.log('Adding missing designation');
            }

            if (updated) {
                await exists.save();
                console.log('Admin profile updated with missing fields.');
            } else {
                console.log('Admin profile is already complete.');
            }

        } else {
            console.log('Admin missing. Creating new...');
            await User.create({
                name: 'Super Admin',
                email: email,
                password: 'password123',
                role: 'admin',
                isDemo: false,
                staffId: 'ADMIN001',
                phone: '9876543210',
                designation: 'System Administrator',
                department: 'Administration'
            });
            console.log('Admin created with full profile.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

restore();
