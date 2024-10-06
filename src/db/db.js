import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_Name}`);
    console.log(`Database connected successfully!! DB HOST : ${connectionInstance.connection.host}`);

  } catch (error) {
    console.error("Database connection Failed!! : ", error);
    process.exit(1);
  }
};

export default connectDb;
