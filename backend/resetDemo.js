const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config({ path: __dirname + "/.env" });

const resetDemoPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const demoUsers = [
            { email: "demo_admin@demo.com", password: "demo_password", role: "admin" },
            { email: "demo_security@demo.com", password: "demo_password", role: "security" },
        ];

        for (const u of demoUsers) {
            // ✅ if exists -> reset password (and hash via pre-save)
            const existing = await User.findOne({ email: u.email });

            if (existing) {
                existing.password = u.password;
                existing.role = u.role;
                existing.isDemo = true;
                existing.name = existing.name || u.email.split("@")[0];

                await existing.save();
                console.log(`Reset password for ${u.email}`);
            } else {
                // ✅ atomic upsert prevents duplicate key even if script runs twice
                await User.updateOne(
                    { email: u.email },
                    {
                        $setOnInsert: {
                            name: u.email.split("@")[0],
                            email: u.email,
                            password: u.password, // will be hashed ONLY if your schema hashes on save/create
                            role: u.role,
                            isDemo: true,
                        },
                    },
                    { upsert: true }
                );

                // If you need hashing guaranteed, prefer create() after re-check:
                // (see note below)

                console.log(`Created ${u.email}`);
            }
        }

        console.log("Done");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

resetDemoPasswords();