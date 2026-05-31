import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";

dotenv.config();

let mongoServer: MongoMemoryServer;

jest.setTimeout(120000); // 2 minutes to allow MongoDB binary download on first run

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Set fake env variables for testing
  process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
  process.env.ACCESS_TOKEN_EXPIRY = "1d";
  process.env.REFRESH_TOKEN_EXPIRY = "10d";

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});
