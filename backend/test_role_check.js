require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const { connectDB, getProdConnection } = require("./config/db");
const { getModels } = require("./models/ModelFactory");

async function checkUser() {
    try {
        await connectDB();
        const prodConn = getProdConnection();
        const { User } = getModels(prodConn);

        const email = "admin@example.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found!");
        } else {
            console.log("Full user object from DB:");
            console.dir(user.toObject(), { depth: null });
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkUser();
