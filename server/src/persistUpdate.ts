import { knex } from "./knex";
import { WSSharedDoc } from "./wsSharedDoc";

let i = 0;
export const persistUpdate = async (doc: WSSharedDoc, update: Uint8Array) => {
  console.log(i++);
  if (i === 10) {
    console.log("can't save");
    return;
  }
  //   await knex("items").insert({ docname: doc.name, update });
};
