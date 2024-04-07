import { knex } from "./knex";
import { WSSharedDoc } from "./wsSharedDoc";

export const persistUpdate = async (doc: WSSharedDoc, update: Uint8Array) => {
  await knex("items").insert({ docname: doc.name, update });
};
