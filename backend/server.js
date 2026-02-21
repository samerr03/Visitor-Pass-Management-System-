require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const app = require("./app");
const path = require("path");
const { connectDB, getProdConnection, getDemoConnection } = require("./config/db");
const { getModels } = require("./models/ModelFactory");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

const DEMO_ENABLED = process.env.ENABLE_DEMO_DB === "true";

console.log("MONGO URI PROD:", process.env.MONGO_URI_PROD || process.env.MONGO_URI);
console.log("DEMO DB ENABLED:", DEMO_ENABLED);

// Initial Seeding
const seedDemoAccounts = async () => {
    try {
        const prodConn = getProdConnection();
        const ProdModels = getModels(prodConn);
        const { User: ProdUser } = ProdModels;

        // 1) Seed Demo Admin in Production DB (for Auth)
        const demoAdmin = await seedUser(ProdUser, {
            email: "demo_admin@demo.com",
            name: "Demo Admin",
            password: "demo_password",
            role: "admin",
            isDemo: true,
            designation: "System Administrator - Demo",
        });

        // 2) Seed Demo Security in Production DB (for Auth)
        const demoSecurity = await seedUser(ProdUser, {
            email: "demo_security@demo.com",
            name: "Demo Security",
            password: "demo_password",
            role: "security",
            isDemo: true,
            designation: "Front Desk Security - Demo",
        });

        console.log("Prod DB: Demo accounts ensured.");

        // ✅ Only touch Demo DB if enabled
        if (DEMO_ENABLED) {
            const demoConn = getDemoConnection();
            const DemoModels = getModels(demoConn);
            const { User: DemoUser } = DemoModels;

            if (demoAdmin) await syncUserToDemo(DemoUser, demoAdmin);
            if (demoSecurity) await syncUserToDemo(DemoUser, demoSecurity);

            console.log("Demo DB: Demo accounts synced.");
        } else {
            console.log("Demo DB sync skipped (ENABLE_DEMO_DB=false).");
        }
    } catch (error) {
        console.error("Seeding Error:", error);
    }
};

const seedUser = async (Model, userData) => {
    let user = await Model.findOne({ email: userData.email });
    if (!user) {
        user = await Model.create(userData);
        console.log(`Created ${userData.email}`);
    } else {
        let updated = false;
        if (!user.isDemo) {
            user.isDemo = true;
            updated = true;
        }
        if (updated) await user.save();
        console.log(`Already exists: ${userData.email}`);
    }
    return user;
};

const syncUserToDemo = async (DemoModel, prodUser) => {
    // ✅ safer: check by email, not by _id (since _id may not match across DBs)
    const exists = await DemoModel.findOne({ email: prodUser.email });
    if (!exists) {
        const clone = prodUser.toObject();
        delete clone._id; // let demo DB generate its own _id
        await DemoModel.create(clone);
        console.log(`Synced ${prodUser.email} to Demo DB`);
    } else {
        console.log(`Demo already has: ${prodUser.email}`);
    }
};

const startServer = async () => {
    await connectDB(); // Initialize Connections

    app.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);

        // ✅ Seed always for prod demo logins, demo DB sync only if enabled
        await seedDemoAccounts();
    });
};

startServer();