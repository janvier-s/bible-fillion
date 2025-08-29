const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_JSON_FILE = path.join(
  __dirname,
  "../formats/json-flat/fillion-array-of-objects.json"
);
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/csv");
const CSV_OUTPUT_FILE = path.join(DIST_DIR, "fillion.csv");

/**
 * Escapes a value for use in a CSV field.
 * If the value contains a comma, double quote, or newline, it will be
 * enclosed in double quotes, and any internal double quotes will be doubled.
 * @param {string|number} value The value to escape.
 * @returns {string} The CSV-safe string.
 */
function escapeCsvValue(value) {
  const str = String(value);

  // Check if quoting is necessary
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    // Escape internal double quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    // Enclose the entire string in double quotes
    return `"${escaped}"`;
  }

  // Return the original string if no special characters are found
  return str;
}

// --- Main Function ---
async function generateCsv() {
  console.log("Starting generation of CSV file...");

  try {
    // 1. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Load the source data
    const verseData = JSON.parse(await fs.readFile(SOURCE_JSON_FILE, "utf-8"));
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log(`  -> Loaded ${verseData.length} verses from JSON.`);

    // 3. Prepare CSV content, starting with the header
    const csvLines = [];
    const headers = ["id", "book_num", "book_abbr", "chapter", "verse", "text"];
    csvLines.push(headers.join(","));

    // 4. Process each verse object into a CSV row
    let idCounter = 1;
    for (const verse of verseData) {
      const meta = bookMetadata[verse.book];
      if (meta) {
        const row = [
          idCounter++,
          meta.book_num,
          verse.book,
          verse.chapter,
          verse.verse,
          verse.text,
        ];

        // Map each value in the row through the escaper function
        const escapedRow = row.map(escapeCsvValue);
        csvLines.push(escapedRow.join(","));
      }
    }

    // 5. Write the final .csv file
    // We join with '\n' which is the standard line ending for CSV
    await fs.writeFile(CSV_OUTPUT_FILE, csvLines.join("\n"));
    console.log(`  -> Successfully wrote CSV to: ${CSV_OUTPUT_FILE}`);

    console.log("\n✅ CSV generation complete!");
  } catch (error) {
    console.error("\n[ERROR] An error occurred during CSV generation:", error);
  }
}

// --- Run the Script ---
generateCsv();
