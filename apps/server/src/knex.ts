import Knex from "knex";

export const knex = Knex({
  client: "pg",
  connection: {
    host: "host.docker.internal",
    port: 25432,
    user: "postgres",
    password: "",
    database: "app",
  },
});
