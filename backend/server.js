require("dotenv").config({ path: __dirname + "/.env" });

const app = require("./app");

const PORT = process.env.PORT || 5000;

console.log("MONGO URI:", process.env.MONGO_URI);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
