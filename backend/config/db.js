const mongoose = require("mongoose");

const MONGO_URI_PROD =
    process.env.MONGO_URI_PROD ||
    process.env.MONGO_URI;

const MONGO_URI_DEMO =
    process.env.MONGO_URI_DEMO;

const DEMO_ENABLED = process.env.ENABLE_DEMO_DB === "true";

let prodConnection = null;
let demoConnection = null;

const connectDB = async () => {
    try {
        if (!MONGO_URI_PROD) {
            throw new Error("MONGO_URI is not configured");
        }

        if (!prodConnection) {
            prodConnection = mongoose.createConnection(MONGO_URI_PROD);

            await new Promise((resolve, reject) => {
                prodConnection.once("connected", resolve);
                prodConnection.once("error", reject);
            });

            console.log("Production DB Connected");
        }

        if (DEMO_ENABLED && MONGO_URI_DEMO && !demoConnection) {
            demoConnection = mongoose.createConnection(MONGO_URI_DEMO);

            await new Promise((resolve, reject) => {
                demoConnection.once("connected", resolve);
                demoConnection.once("error", reject);
            });

            console.log("Demo DB Connected");
        } else if (!DEMO_ENABLED) {
            console.log("Demo DB connection skipped");
        }

        return {
            prodConnection,
            demoConnection
        };
    } catch (error) {
        console.error("Database Connection Failed:", error.message);
        throw error;
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
    getDemoConnection
};