require("dotenv").config();

const { Client } = require("pg");

const isValidIdentifier = (value) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value || "");

const createDatabaseIfNotExists = async () => {
  const dbName = process.env.DB_NAME;

  if (!isValidIdentifier(dbName)) {
    throw new Error("DB_NAME format is invalid.");
  }

  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres",
  });

  await adminClient.connect();

  const checkResult = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );

  if (checkResult.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE ${dbName}`);
    console.log(`Created database: ${dbName}`);
  } else {
    console.log(`Database already exists: ${dbName}`);
  }

  await adminClient.end();
};

const verifyConnection = async () => {
  const verifyClient = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await verifyClient.connect();
  await verifyClient.query("SELECT NOW()");
  console.log(`Verified connection to: ${process.env.DB_NAME}`);
  await verifyClient.end();
};

const run = async () => {
  try {
    await createDatabaseIfNotExists();
    await verifyConnection();
  } catch (error) {
    console.error("DB init failed:", error.message);
    process.exit(1);
  }
};

run();
