const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const DIST_DIR = path.join(__dirname, "../formats/json-flat");
const KEY_VALUE_OUTPUT_FILE = path.join(DIST_DIR, "fillion-key-value.json");
const ARRAY_OF_OBJECTS_OUTPUT_FILE = path.join(
  DIST_DIR,
  "fillion-array-of-objects.json"
);

// --- Main Function ---
async function generateFlatJSONs() {
  console.log("Starting generation of flat JSON formats...");

  try {
    // 1. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Get and sort all source files to maintain canonical order
    const allFiles = await fs.readdir(SOURCE_DIR);
    const bookFiles = allFiles
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .sort(); // Alphabetical sort works because of the "01-", "02-" prefixes

    if (bookFiles.length === 0) {
      console.error("Error: No JSON files found in the source directory.");
      return;
    }

    console.log(`Found ${bookFiles.length} book files to process.`);

    // 3. Initialize our data accumulators
    const keyValueFlat = {};
    const arrayOfObjects = [];

    // 4. Process each book file in order
    for (const bookFile of bookFiles) {
      const filePath = path.join(SOURCE_DIR, bookFile);
      let bookData;
      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        bookData = JSON.parse(fileContent);
      } catch (err) {
        console.error(`  !! Failed to read or parse ${bookFile}:`, err.message);
        continue;
      }

      const bookAbbr = bookData.book;
      if (!bookAbbr || !Array.isArray(bookData.chapters)) {
        console.warn(`  !! Skipping ${bookFile}: missing book or chapters`);
        continue;
      }
      console.log(`  -> Processing ${bookAbbr}...`);

      // 5. Iterate through chapters and verses
      for (const chapter of bookData.chapters) {
        if (
          typeof chapter.chapter === "undefined" ||
          !Array.isArray(chapter.verses)
        ) {
          console.warn(
            `    !! Skipping chapter in ${bookFile}: missing chapter number or verses`
          );
          continue;
        }
        for (const verse of chapter.verses) {
          if (
            typeof verse.verse === "undefined" ||
            typeof verse.text !== "string"
          ) {
            console.warn(
              `    !! Skipping verse in ${bookFile}: missing verse number or text`
            );
            continue;
          }
          // --- Format 1: Key-Value ---
          const key = `${bookAbbr}.${chapter.chapter}.${verse.verse}`;
          keyValueFlat[key] = verse.text;

          // --- Format 2: Array of Objects ---
          arrayOfObjects.push({
            book: bookAbbr,
            chapter: chapter.chapter,
            verse: verse.verse,
            text: verse.text,
          });
        }
      }
    }

    // 6. Write the final files
    console.log("\nWriting output files...");

    // Write the key-value file (minified for efficiency)
    await fs.writeFile(KEY_VALUE_OUTPUT_FILE, JSON.stringify(keyValueFlat));
    console.log(`Successfully created: ${KEY_VALUE_OUTPUT_FILE}`);

    // Write the array-of-objects file (pretty-printed for readability)
    await fs.writeFile(
      ARRAY_OF_OBJECTS_OUTPUT_FILE,
      JSON.stringify(arrayOfObjects, null, 2)
    );
    console.log(`Successfully created: ${ARRAY_OF_OBJECTS_OUTPUT_FILE}`);

    console.log("\n✅ Generation complete!");
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
}

// --- Run the Script ---
generateFlatJSONs();
