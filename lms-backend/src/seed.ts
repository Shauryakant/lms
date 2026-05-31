import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "./models/user.model";

dotenv.config();

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/lms_backend";
    await mongoose.connect(uri);
    console.log("Connected to DB for seeding...");

    // Clear existing users to prevent duplicates during testing
    await User.deleteMany({});

    const defaultPassword = await bcrypt.hash("password123", 10);

    const roles = ["Admin", "Sales", "Sanction", "Disbursement", "Collection", "Borrower"];
    
    const usersToCreate = roles.map(role => ({
      fullName: `${role} User`,
      email: `${role.toLowerCase()}@lms.com`,
      password: defaultPassword,
      role: role,
    }));

    await User.insertMany(usersToCreate);

    console.log("Database seeded successfully!");
    console.log("Login Credentials:");
    usersToCreate.forEach(u => {
      console.log(`Role: ${u.role} | Email: ${u.email} | Password: password123`);
    });

  } catch (error) {
    console.error("Error seeding database: ", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();
