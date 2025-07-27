import { db } from "./db";
import { MAX_DATE_MS } from "../utils/date";
import { importDB as dexieImportDB } from "dexie-export-import";

export async function exportDB() {
  const now = Date.now();
  return db.export({
    prettyJson: true,
    transform: (table, value, key) => {
      if (table === db.intervals.name) {
        // finish all in-progress activities
        if (value.end === MAX_DATE_MS) {
          value.end = now;
        }
        // convert timestamps to ISO strings
        value.start = new Date(value.start).toISOString();
        value.end = new Date(value.end).toISOString();
      }
      return { value, key };
    },
  });
}

export async function importDB(file: File) {
  await db.delete();
  /*
   clearTablesBeforeImport is not atomic, so we need to clear the tables before importing
   see https://github.com/dexie/Dexie.js/blob/v4.0.11/addons/dexie-export-import/src/import.ts#L98

   tempDB is used to support importing old db versions: https://github.com/dexie/Dexie.js/issues/1337#issuecomment-866687433
  */
  const tempDB = await dexieImportDB(file, {
    transform: (table, value, key) => {
      // convert date strings to timestamps
      if (table === db.intervals.name) {
        value.start = new Date(value.start).getTime();
        value.end = new Date(value.end).getTime();
      }
      return { value, key };
    },
  });
  tempDB.close();
  await db.open();
}

export async function clearDB() {
  // this will also reset the auto-increment IDs
  await db.delete();
  await db.open();
}
