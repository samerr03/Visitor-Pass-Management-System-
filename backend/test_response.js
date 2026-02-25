const mongoose = require('mongoose');
require('dotenv').config();
const UserSchema = require('./models/User');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = mongoose.model('User', UserSchema);
    const user = await User.findOne({ email: 'admin@example.com' }).select('+password');
    console.log("Returned JSON:", JSON.stringify({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isDemo: user.isDemo,
            demoSessionId: user.demoSessionId
        }
    }, null, 2));
    process.exit(0);
}
run();
