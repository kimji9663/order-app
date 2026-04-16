require("dotenv").config();

const express = require("express");
const { testDatabaseConnection, pool } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Order app backend is running." });
});

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ status: "ok", now: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

const startServer = async () => {
  try {
    await testDatabaseConnection();
    console.log("PostgreSQL connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error.message);
    process.exit(1);
  }
};

startServer();
