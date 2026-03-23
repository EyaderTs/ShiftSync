// src/index.js

import express, { Express, Request, Response } from "express";
const cors = require("cors");
import dotenv from "dotenv";

import exceptionFilter from "./infrastructure/filters/exception-filter";
import Authenticate from "./middleware/auth";

import userRoutes from "./routes/users-route";
import authRoutes from "./routes/auth-route";
import locationsRoutes from "./routes/locations-route";
import skillRoutes from "./routes/skills-route";
// import dashboardRoutes from "./routes/dashboard-route";
import availabilityRoutes from "./routes/availability-route";
import shiftRoutes from "./routes/shift-route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
// app.use(cors());
// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));
app.use(cors({
  origin: (origin:any, callback:any) => {
    if (!origin) return callback(null, true);

    if (
      origin === "https://edubaseease.tech" ||
      origin == "https://shift-sync-kappa.vercel.app"||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// Middleware to parse JSON request bodies
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use(Authenticate);

//import routs
app.use("/api/users", userRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/skills", skillRoutes);
// app.use("/api/dashboard", dashboardRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/shifts", shiftRoutes);

app.get("/api", (req: Request, res: Response) => {
  res.send("ShiftSync - Hello there");
});
app.use(exceptionFilter);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
