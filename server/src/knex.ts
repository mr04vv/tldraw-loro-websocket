import Knex from "knex";

export const knex = Knex({
  client: "pg",
  connection: {
    host: "localhost",
    port: 15432,
    user: "postgres",
    password: "",
    database: "app",
  },
});
