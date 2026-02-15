const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_management')
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({ photo: { $exists: true, $ne: '' } });
        console.log('Users with photos:', users.length);
        users.forEach(u => console.log(`${u.name}: ${u.photo}`));
        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
