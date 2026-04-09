import { Sequelize } from "sequelize";
import "dotenv/config";

const dialect = process.env.DB_DIALECT;
const db_name = process.env.DB_NAME;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASS;
const db_host = process.env.DB_HOST;
const db_port = process.env.DB_PORT;

export const sequelize = new Sequelize(
  `${dialect}://${encodeURIComponent(db_user)}:${encodeURIComponent(db_password)}@${db_host}:${db_port}/${db_name}`,
  {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);
