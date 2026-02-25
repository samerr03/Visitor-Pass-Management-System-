require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const { connectDB, getProdConnection } = require("./config/db");
const { getModels } = require("./models/ModelFactory");

async function resetAdminPassword() {
    try {
        await connectDB();
        const prodConn = getProdConnection();
        const { User } = getModels(prodConn);

        const email = "admin@example.com";
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log("User not found!");
        } else {
            console.log(`Resetting password for ${email}...`);
            // This triggers the pre('save') hook in models/User.js which securely hashes via bcryptjs
            user.password = 'password123';
            await user.save();
            console.log("Password reset successfully to: password123");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

resetAdminPassword();
