require("dotenv").config();

const express = require("express");
const path = require("path");
const app = require("./app");

const {
    connectDB,
    getProdConnection,
    getDemoConnection
} = require("./config/db");

const { getModels } = require("./models/ModelFactory");

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

const PORT = process.env.PORT || 5000;
const DEMO_ENABLED = process.env.ENABLE_DEMO_DB === "true";

let initialized = false;
let initializationPromise = null;

const seedUser = async (Model, userData) => {
    let user = await Model.findOne({
        email: userData.email
    });

    if (!user) {
        user = await Model.create(userData);
        console.log(`Created demo user: ${userData.email}`);
    } else {
        console.log(`Demo user already exists: ${userData.email}`);
    }

    return user;
};

const syncUserToDemo = async (DemoModel, prodUser) => {
    const exists = await DemoModel.findOne({
        email: prodUser.email
    });

    if (!exists) {
        const clone = prodUser.toObject();

        delete clone._id;

        await DemoModel.create(clone);

        console.log(`Synced ${prodUser.email} to Demo DB`);
    }
};

const seedDemoAccounts = async () => {
    const prodConn = getProdConnection();
    const ProdModels = getModels(prodConn);
    const ProdUser = ProdModels.User;

    const demoAdmin = await seedUser(ProdUser, {
        email: "demo_admin@demo.com",
        name: "Demo Admin",
        password: "demo_password",
        role: "admin",
        isDemo: true,
        designation: "System Administrator - Demo"
    });

    const demoSecurity = await seedUser(ProdUser, {
        email: "demo_security@demo.com",
        name: "Demo Security",
        password: "demo_password",
        role: "security",
        isDemo: true,
        designation: "Front Desk Security - Demo"
    });

    if (DEMO_ENABLED) {
        const demoConn = getDemoConnection();
        const DemoModels = getModels(demoConn);
        const DemoUser = DemoModels.User;

        await syncUserToDemo(DemoUser, demoAdmin);
        await syncUserToDemo(DemoUser, demoSecurity);

        console.log("Demo DB accounts synced");
    }
};

const initialize = async () => {
    if (initialized) {
        return;
    }

    if (!initializationPromise) {
        initializationPromise = (async () => {
            await connectDB();
            await seedDemoAccounts();

            initialized = true;

            console.log("Backend initialized successfully");
        })();
    }

    await initializationPromise;
};

const handler = async (req, res) => {
    try {
        await initialize();
        return app(req, res);
    } catch (error) {
        console.error("Server initialization error:", error);

        return res.status(500).json({
            success: false,
            message: "Server initialization failed"
        });
    }
};

module.exports = handler;

if (require.main === module) {
    initialize()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Failed to start server:", error);
            process.exit(1);
        });
}