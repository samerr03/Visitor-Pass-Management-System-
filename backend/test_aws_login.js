require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectDB, getProdConnection, getDemoConnection } = require("./config/db");
const { getModels } = require("./models/ModelFactory");

async function checkUser() {
    try {
        await connectDB();
        const prodConn = getProdConnection();
        const { User } = getModels(prodConn);

        const email = "demo_admin@demo.com";
        const password = "demo_password";

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log("User not found!");
        } else {
            console.log("User found:", user.email, "Role:", user.role);
            console.log("Password hash length:", user.password ? user.password.length : "NO PASSWORD");

            const isMatch = await bcrypt.compare(password, user.password);
            console.log("Bcrypt compare result:", isMatch);

            console.log("Using model method:", await user.matchPassword(password));
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkUser();
