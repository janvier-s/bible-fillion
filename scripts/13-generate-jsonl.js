const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_JSON_FILE = path.join(
  __dirname,
  "../formats/json-flat/fillion-array-of-objects.json"
);
const DIST_DIR = path.join(__dirname, "../formats/jsonl");
const JSONL_OUTPUT_FILE = path.join(DIST_DIR, "fillion.jsonl");

// --- Main Function ---
async function generateJsonLines() {
  console.log("Starting generation of JSON Lines (.jsonl) file...");

  try {
    // 1. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Load the source data, which is already an array of objects
    const verseData = JSON.parse(await fs.readFile(SOURCE_JSON_FILE, "utf-8"));
    console.log(`  -> Loaded ${verseData.length} verses from JSON.`);

    // 3. Convert each object in the array to a JSON string
    // The .map() function creates a new array where each element is a stringified JSON object
    const jsonLines = verseData.map((verse) => JSON.stringify(verse));

    // 4. Join the array of strings with a newline character
    const fileContent = jsonLines.join("\n");

    // 5. Write the final .jsonl file
    await fs.writeFile(JSONL_OUTPUT_FILE, fileContent);
    console.log(
      `  -> Successfully wrote JSON Lines file to: ${JSONL_OUTPUT_FILE}`
    );

    console.log("\n✅ JSON Lines generation complete!");
  } catch (error) {
    console.error(
      "\n[ERROR] An error occurred during JSON Lines generation:",
      error
    );
  }
}

// --- Run the Script ---
generateJsonLines();
