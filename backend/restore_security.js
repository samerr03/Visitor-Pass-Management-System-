const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const restoreSecurity = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = 'security@example.com';
        const exists = await User.findOne({ email });

        if (exists) {
            console.log('Security user already exists. Updating password and profile...');
            exists.password = 'password123';

            // Fix Profile Data
            exists.staffId = 'SEC001';
            exists.phone = '9123456780';
            exists.designation = 'Security Officer';
            exists.department = 'Security';
            exists.isDemo = false;

            await exists.save();
            console.log('Security updated: security@example.com / password123');
        } else {
            console.log('Security user missing. Creating new...');
            await User.create({
                name: 'Main Security',
                email: email,
                password: 'password123',
                role: 'security',
                isDemo: false,
                staffId: 'SEC001',
                phone: '9123456780',
                designation: 'Security Officer',
                department: 'Security'
            });
            console.log('Security created: security@example.com / password123');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

restoreSecurity();
