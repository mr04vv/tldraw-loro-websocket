import { docs } from "./map";
import { WSSharedDoc } from "./wsSharedDoc";

export const getDoc = (docname: string): [WSSharedDoc, boolean] => {
  const existing = docs.get(docname);
  if (existing) {
    return [existing, false];
  }

  const doc = new WSSharedDoc(docname);

  docs.set(docname, doc);

  return [doc, true];
};
