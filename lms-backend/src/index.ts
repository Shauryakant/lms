import dotenv from "dotenv";
import connectDB from "./db/database";
import app from "./app";

dotenv.config();

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed: ", err);
    process.exit(1);
  });
