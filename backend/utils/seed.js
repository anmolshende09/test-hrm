require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const fs = require("fs");
const path = require("path");

// Dynamically require all models so we can deleteMany on them
const modelsDir = path.join(__dirname, "../models");
const models = {};
fs.readdirSync(modelsDir).forEach((file) => {
  if (file.endsWith(".js")) {
    const modelName = file.replace(".js", "");
    models[modelName] = require(path.join(modelsDir, file));
  }
});

// Import Seeders
const seedCore = require("./seeders/core");
const seedAttendance = require("./seeders/attendance");
const seedPayroll = require("./seeders/payroll");
const seedRecruitment = require("./seeders/recruitment");
const seedLifecycle = require("./seeders/lifecycle");

const clearDatabase = async () => {
  console.log("Wiping existing database collections...");
  for (const modelName of Object.keys(models)) {
    try {
      await models[modelName].deleteMany({});
      console.log(`- Cleared ${modelName}`);
    } catch (err) {
      console.error(`Failed to clear ${modelName}:`, err.message);
    }
  }
  console.log("Database wiped successfully.\n");
};

const run = async () => {
  try {
    await connectDB();
    await clearDatabase();

    // The seeders will return references that subsequent seeders might need
    console.log("--- Seeding Core (Branches, Depts, Employees, Users) ---");
    const coreData = await seedCore(models);
    
    console.log("\n--- Seeding Attendance & Leaves ---");
    await seedAttendance(models, coreData);
    
    console.log("\n--- Seeding Payroll ---");
    await seedPayroll(models, coreData);

    console.log("\n--- Seeding Recruitment ---");
    await seedRecruitment(models, coreData);

    console.log("\n--- Seeding Lifecycle & Misc ---");
    await seedLifecycle(models, coreData);

    console.log("\n✅ All seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

run();
