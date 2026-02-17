const mongoose = require('mongoose');

// Default URIs
const MONGO_URI_PROD = process.env.MONGO_URI_PROD || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_management';
const MONGO_URI_DEMO = process.env.MONGO_URI_DEMO || 'mongodb://127.0.0.1:27017/vms_demo';

let prodConnection = null;
let demoConnection = null;

const connectDB = async () => {
    try {
        // Create Production Connection
        prodConnection = mongoose.createConnection(MONGO_URI_PROD);

        prodConnection.on('connected', () => {
            console.log(`✅ Production DB Connected: ${MONGO_URI_PROD}`);
        });

        prodConnection.on('error', (err) => {
            console.error('❌ Production DB Error:', err.message);
        });

        // Create Demo Connection
        demoConnection = mongoose.createConnection(MONGO_URI_DEMO);

        demoConnection.on('connected', () => {
            console.log(`⚠️  Demo DB Connected: ${MONGO_URI_DEMO}`);
        });

        demoConnection.on('error', (err) => {
            console.error('❌ Demo DB Error:', err.message);
        });

        // Wait for open
        // (Optional: await promise if critical, but createConnection is async-ish)

        return { prodConnection, demoConnection };

    } catch (error) {
        console.error('Database Connection Failed:', error);
        process.exit(1);
    }
};

const getProdConnection = () => prodConnection;
const getDemoConnection = () => demoConnection;

module.exports = {
    connectDB,
    getProdConnection,
    getDemoConnection,
    MONGO_URI_PROD,
    MONGO_URI_DEMO
};
