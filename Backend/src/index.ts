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
import dashboardRoutes from "./routes/dashboard-route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use(Authenticate);

//import routs
app.use("/api/users", userRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api", (req: Request, res: Response) => {
  res.send("ShiftSync - Hello there");
});
app.use(exceptionFilter);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
