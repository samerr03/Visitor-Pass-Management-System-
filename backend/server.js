require("dotenv").config({ path: __dirname + "/.env" });

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

const seedUser = async (Model, userData) => {
    let user = await Model.findOne({
        email: userData.email
    });

    if (!user) {
        user = await Model.create(userData);
        console.log(`Created ${userData.email}`);
    } else {
        let updated = false;

        if (!user.isDemo) {
            user.isDemo = true;
            updated = true;
        }

        if (updated) {
            await user.save();
        }

        console.log(`Already exists: ${userData.email}`);
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
    } else {
        console.log(`Demo already has: ${prodUser.email}`);
    }
};

const seedDemoAccounts = async () => {
    try {
        const prodConn = getProdConnection();

        const ProdModels = getModels(prodConn);

        const {
            User: ProdUser
        } = ProdModels;

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

        console.log("Prod DB: Demo accounts ensured.");

        if (DEMO_ENABLED) {
            const demoConn = getDemoConnection();

            const DemoModels = getModels(demoConn);

            const {
                User: DemoUser
            } = DemoModels;

            if (demoAdmin) {
                await syncUserToDemo(
                    DemoUser,
                    demoAdmin
                );
            }

            if (demoSecurity) {
                await syncUserToDemo(
                    DemoUser,
                    demoSecurity
                );
            }

            console.log("Demo DB: Demo accounts synced.");
        } else {
            console.log(
                "Demo DB sync skipped (ENABLE_DEMO_DB=false)."
            );
        }
    } catch (error) {
        console.error("Seeding Error:", error);
    }
};

const initialize = async () => {
    if (initialized) {
        return;
    }

    await connectDB();

    await seedDemoAccounts();

    initialized = true;

    console.log("Backend initialized successfully.");
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
                console.log(
                    `Server running on port ${PORT}`
                );
            });
        })
        .catch((error) => {
            console.error(
                "Failed to start server:",
                error
            );

            process.exit(1);
        });
}