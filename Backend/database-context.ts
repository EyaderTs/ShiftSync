import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { UserEntity } from "./src/persistences/users/user-schema";
import { SkillEntity } from "./src/persistences/skills/skill-schema";
import { LocationEntity } from "./src/persistences/locations/location-schema";
import { UserLocationEntity } from "./src/persistences/users/user-location-schema";
import { StaffAvailabilityEntity } from "./src/persistences/shifts/staff-availability-schema";
import { ShiftEntity } from "./src/persistences/shifts/shift-schema";
import { ShiftAssignmentEntity } from "./src/persistences/shifts/shift-assignment-schema";

dotenv.config();  
const isProduction = process.env.NODE_ENV === "production";

let connection: DataSource | null = null;

const DBContext = {
  async getConnection(): Promise<DataSource> {
    try {
      if (connection && connection.isInitialized) {
        return connection;
      }
      connection = await this.connect();
      return connection;
    } catch (error) {
      console.error(error);
      throw new Error("Database connection error");
    }
  },

  async connect(): Promise<DataSource> {
    try {
      const dataSource = new DataSource({
        type: "postgres",
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        schema: "public",
        // synchronize: !isProduction,
        synchronize: true,
        logging: false,
        entities: [UserEntity,LocationEntity,UserLocationEntity,SkillEntity,StaffAvailabilityEntity,ShiftEntity,ShiftAssignmentEntity],
      });

      connection = await dataSource.initialize();
      return connection;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to connect to the database");
    }
  },

  async closeConnection(): Promise<void> {
    try {
      if (connection && connection.isInitialized) {
        console.log("Closing database connection");
        await connection.destroy();
        connection = null;
      }
    } catch (error) {
      console.error("Error closing database connection", error);
    }
  },
};

export default DBContext;