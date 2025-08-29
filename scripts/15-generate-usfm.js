const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/usfm");
const OUTPUT_FILE = path.join(DIST_DIR, "fillion.usfm");

// --- Main Function ---
async function generateUsfm() {
  console.log("Starting generation of USFM file...");

  try {
    // 1. Load book metadata
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log("Successfully loaded book metadata.");

    // 2. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 3. Get and sort all source files to ensure canonical order
    const bookFiles = (await fs.readdir(SOURCE_DIR))
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .sort();

    // 4. Initialize an array to hold USFM content for performance
    const usfmContent = [];

    // 5. Process each book file in order
    for (const bookFile of bookFiles) {
      const bookAbbr = path.basename(bookFile, ".json").substring(3); // e.g., "GEN"
      const bookMeta = bookMetadata[bookAbbr];

      if (!bookMeta) {
        console.warn(`  -> WARNING: No metadata for ${bookAbbr}. Skipping.`);
        continue;
      }

      const filePath = path.join(SOURCE_DIR, bookFile);
      const bookData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      console.log(`  -> Processing ${bookAbbr}...`);

      // 6. Generate USFM markers for the current book
      usfmContent.push(`\\id ${bookAbbr} Fillion Bible`); // Book identifier
      usfmContent.push(`\\h ${bookMeta.fr_name}`); // Header (human-readable title)

      for (const chapter of bookData.chapters) {
        usfmContent.push(`\\c ${chapter.chapter}`); // Chapter marker
        usfmContent.push(`\\p`); // Start each chapter with a paragraph marker

        for (const verse of chapter.verses) {
          // Verse marker, number, space, and then the text.
          // .trim() is a good practice to clean up potential whitespace issues.
          usfmContent.push(`\\v ${verse.verse} ${verse.text.trim()}`);
        }
      }
    }

    // 7. Join the array into a single string and write to file
    // We join with '\n' to ensure each marker is on a new line.
    console.log("\nWriting to single USFM file...");
    await fs.writeFile(OUTPUT_FILE, usfmContent.join("\n"));
    console.log(`Successfully generated: ${OUTPUT_FILE}`);

    console.log("\n✅ USFM generation complete!");
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
}

// --- Run the Script ---
generateUsfm();
