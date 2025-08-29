const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_JSON_FILE = path.join(
  __dirname,
  "../formats/json-flat/fillion-array-of-objects.json"
);
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/sql");
const SQL_OUTPUT_FILE = path.join(DIST_DIR, "fillion.sql");
const BATCH_SIZE = 500; // Number of rows per INSERT statement for efficiency

/**
 * Escapes a string for use in an SQL query.
 * Replaces single quotes with two single quotes.
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
function escapeSql(str) {
  return str.replace(/'/g, "''");
}

// --- Main Function ---
async function generateSqlDump() {
  console.log("Starting generation of SQL dump file...");

  try {
    // 1. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Load the source data
    const verseData = JSON.parse(await fs.readFile(SOURCE_JSON_FILE, "utf-8"));
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log(`  -> Loaded ${verseData.length} verses from JSON.`);

    // 3. Prepare the SQL content
    const sqlContent = [];

    // Add a header
    sqlContent.push("-- Fillion Bible SQL Dump");
    sqlContent.push(`-- Generated on: ${new Date().toISOString()}`);
    sqlContent.push("--");
    sqlContent.push("");

    // Add DROP/CREATE TABLE statements
    sqlContent.push("DROP TABLE IF EXISTS `verses`;");
    sqlContent.push(`
CREATE TABLE \`verses\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`book_num\` tinyint(4) NOT NULL,
  \`book_abbr\` varchar(3) NOT NULL,
  \`chapter\` smallint(6) NOT NULL,
  \`verse\` smallint(6) NOT NULL,
  \`text\` text NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`reference_index\` (\`book_abbr\`,\`chapter\`,\`verse\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Note: This schema is optimized for MySQL. For PostgreSQL, use SERIAL for the id.`);
    sqlContent.push("");

    // 4. Generate INSERT statements in batches
    console.log(
      `  -> Generating INSERT statements with a batch size of ${BATCH_SIZE}...`
    );
    let valueRows = [];
    const insertPrefix =
      "INSERT INTO `verses` (`book_num`, `book_abbr`, `chapter`, `verse`, `text`) VALUES \n";

    for (let i = 0; i < verseData.length; i++) {
      const verse = verseData[i];
      const meta = bookMetadata[verse.book];

      if (meta) {
        const row = `(${meta.book_num}, '${verse.book}', ${verse.chapter}, ${
          verse.verse
        }, '${escapeSql(verse.text)}')`;
        valueRows.push(row);
      }

      // If the batch is full or it's the last item, write the INSERT statement
      if (valueRows.length === BATCH_SIZE || i === verseData.length - 1) {
        if (valueRows.length > 0) {
          const insertStatement = insertPrefix + valueRows.join(",\n") + ";";
          sqlContent.push(insertStatement);
          sqlContent.push("");
          valueRows = []; // Reset the batch
        }
      }
    }

    // 5. Write the final .sql file
    await fs.writeFile(SQL_OUTPUT_FILE, sqlContent.join("\n"));
    console.log(`  -> Successfully wrote SQL dump to: ${SQL_OUTPUT_FILE}`);

    console.log("\n✅ SQL dump generation complete!");
  } catch (error) {
    console.error(
      "\n[ERROR] An error occurred during SQL dump generation:",
      error
    );
  }
}

// --- Run the Script ---
generateSqlDump();
