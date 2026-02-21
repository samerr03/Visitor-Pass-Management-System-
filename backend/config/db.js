const mongoose = require("mongoose");

// Default URIs
const MONGO_URI_PROD =
    process.env.MONGO_URI_PROD ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/visitor_management";

const MONGO_URI_DEMO =
    process.env.MONGO_URI_DEMO ||
    "mongodb://127.0.0.1:27017/vms_demo";

const DEMO_ENABLED = process.env.ENABLE_DEMO_DB === "true";

let prodConnection = null;
let demoConnection = null;

const connectDB = async () => {
    try {
        // ✅ Production Connection (always required)
        prodConnection = mongoose.createConnection(MONGO_URI_PROD);

        prodConnection.on("connected", () => {
            console.log(`✅ Production DB Connected: ${MONGO_URI_PROD}`);
        });

        prodConnection.on("error", (err) => {
            console.error("❌ Production DB Error:", err.message);
        });

        // ✅ Demo Connection ONLY if enabled
        if (DEMO_ENABLED) {
            demoConnection = mongoose.createConnection(MONGO_URI_DEMO);

            demoConnection.on("connected", () => {
                console.log(`⚠️ Demo DB Connected: ${MONGO_URI_DEMO}`);
            });

            demoConnection.on("error", (err) => {
                console.error("❌ Demo DB Error:", err.message);
            });
        } else {
            console.log("🚫 Demo DB connection skipped (ENABLE_DEMO_DB=false)");
        }

        return { prodConnection, demoConnection };
    } catch (error) {
        console.error("Database Connection Failed:", error);
        process.exit(1);
    }
};

const getProdConnection = () => {
    if (!prodConnection) {
        throw new Error("Production DB not connected");
    }
    return prodConnection;
};

const getDemoConnection = () => {
    if (!DEMO_ENABLED) {
        throw new Error("Demo DB is disabled");
    }
    if (!demoConnection) {
        throw new Error("Demo DB not connected");
    }
    return demoConnection;
};

module.exports = {
    connectDB,
    getProdConnection,
    getDemoConnection,
    MONGO_URI_PROD,
    MONGO_URI_DEMO,
};