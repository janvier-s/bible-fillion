// This script requires the `better-sqlite3` package.
// Run `npm install better-sqlite3` in your terminal first.

const fs = require("fs").promises;
const path = require("path");
const Database = require("better-sqlite3");

// --- Configuration ---
const SOURCE_JSON_FILE = path.join(
  __dirname,
  "../formats/json-flat/fillion-array-of-objects.json"
);
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/sqlite");
const SQLITE_OUTPUT_FILE = path.join(DIST_DIR, "fillion.sqlite");

// --- Main Function ---
async function generateSqlite() {
  console.log("Starting generation of SQLite database...");
  let db;

  try {
    // 1. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Delete old database file if it exists to ensure a fresh start
    try {
      await fs.unlink(SQLITE_OUTPUT_FILE);
      console.log("  -> Deleted existing database file.");
    } catch (error) {
      if (error.code !== "ENOENT") throw error; // Ignore "file not found" error
    }

    // 3. Create a new database connection
    db = new Database(SQLITE_OUTPUT_FILE);
    console.log(`  -> Created new database at: ${SQLITE_OUTPUT_FILE}`);

    // 4. Create the table schema
    const createTableSql = `
      CREATE TABLE verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_num INTEGER NOT NULL,
        book_abbr TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL
      );
    `;
    db.exec(createTableSql);
    console.log('  -> "verses" table created successfully.');

    // 5. Load the verse data and metadata
    const verseData = JSON.parse(await fs.readFile(SOURCE_JSON_FILE, "utf-8"));
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log(`  -> Loaded ${verseData.length} verses from JSON.`);

    // 6. Prepare for efficient bulk insertion
    const insertSql = `
      INSERT INTO verses (book_num, book_abbr, chapter, verse, text)
      VALUES (@book_num, @book_abbr, @chapter, @verse, @text)
    `;
    const insert = db.prepare(insertSql);

    // 7. Use a transaction for massive performance boost
    const insertMany = db.transaction((verses) => {
      for (const verse of verses) {
        const meta = bookMetadata[verse.book];
        if (meta) {
          insert.run({
            book_num: meta.book_num,
            book_abbr: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
          });
        }
      }
    });

    console.log("  -> Beginning bulk insert transaction...");
    insertMany(verseData);
    console.log("  -> Bulk insert complete.");

    console.log("\n✅ SQLite database generation complete!");
  } catch (error) {
    console.error(
      "\n[ERROR] An error occurred during SQLite generation:",
      error
    );
  } finally {
    // 8. Always close the database connection
    if (db) {
      db.close();
      console.log("  -> Database connection closed.");
    }
  }
}

// --- Run the Script ---
generateSqlite();
