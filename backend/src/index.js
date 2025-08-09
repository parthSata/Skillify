import dotenv from "dotenv";
import ConnectDB from "./db/config.js";
import { server } from "./app.js";
import { createInitialAdmin } from "./controllers/admin.controller.js";

dotenv.config({
  path: "./env",
});

ConnectDB()
  .then(() => {
    // createInitialAdmin();
    server.listen(process.env.VITE_PORT || 8000, () => {
      console.log(
        `✅ Server is running at port : ${process.env.VITE_PORT || 8000}`
      );
    });
  })
  .catch((error) => {
    console.log("❌ MongoDb connection Failed !!!", error);
  });
