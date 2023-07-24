const app = require("./app");
const dotenv = require("dotenv");
dotenv.config();

// ==== Start Project ====
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`server running on ${PORT}....`));
