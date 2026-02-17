// server.js
require("dotenv").config({ path: __dirname + "/.env" });
const app = require("./app");
const { connectDB, getProdConnection, getDemoConnection } = require("./config/db");
const { getModels } = require("./models/ModelFactory");

const PORT = process.env.PORT || 5000;

console.log("MONGO URI PROD:", process.env.MONGO_URI_PROD || process.env.MONGO_URI);

// Initial Seeding
const seedDemoAccounts = async () => {
    try {
        const prodConn = getProdConnection();
        const demoConn = getDemoConnection();

        const ProdModels = getModels(prodConn);
        const DemoModels = getModels(demoConn);

        const { User: ProdUser } = ProdModels;
        const { User: DemoUser } = DemoModels;

        // 1. Seed Demo Admin in Production DB (for Auth)
        const demoAdmin = await seedUser(ProdUser, {
            email: 'demo_admin@demo.com',
            name: 'Demo Admin',
            password: 'demo_password',
            role: 'admin',
            isDemo: true,
            designation: 'System Administrator - Demo'
        });

        // 2. Seed Demo Security in Production DB (for Auth)
        const demoSecurity = await seedUser(ProdUser, {
            email: 'demo_security@demo.com',
            name: 'Demo Security',
            password: 'demo_password',
            role: 'security',
            isDemo: true,
            designation: 'Front Desk Security - Demo'
        });

        console.log("Prod DB: Demo accounts ensured.");

        // 3. Sync to Demo DB (so they exist there too if referenced)
        if (demoAdmin) await syncUserToDemo(DemoUser, demoAdmin);
        if (demoSecurity) await syncUserToDemo(DemoUser, demoSecurity);

        console.log("Demo DB: Demo accounts synced.");

    } catch (error) {
        console.error("Seeding Error:", error.message);
    }
};

const seedUser = async (Model, userData) => {
    let user = await Model.findOne({ email: userData.email });
    if (!user) {
        user = await Model.create(userData);
        console.log(`Created ${userData.email}`);
    } else {
        let updated = false;
        if (!user.isDemo) { user.isDemo = true; updated = true; }
        // Ensure password is set correctly if it was messed up
        // But we can't easily check hash. Assuming debug script handled it.
        if (updated) await user.save();
    }
    return user;
};

const syncUserToDemo = async (DemoModel, prodUser) => {
    const exists = await DemoModel.findById(prodUser._id);
    if (!exists) {
        const clone = prodUser.toObject();
        delete clone._id; // Let Mongo generate ID? NO, must match for references.
        clone._id = prodUser._id;
        await DemoModel.create(clone);
        console.log(`Synced ${prodUser.email} to Demo DB`);
    }
};

// Start Server
const startServer = async () => {
    await connectDB(); // Initialize Connections

    app.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);
        await seedDemoAccounts();
    });
};

startServer();
