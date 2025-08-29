const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/json-fr");

// --- Main Function ---
async function generateFrenchJSON() {
  console.log("Starting generation of French JSON version...");

  try {
    // 1. Load the book metadata
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log("Successfully loaded book metadata.");

    // 2. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 3. Get and sort all source files to maintain canonical order
    const allFiles = await fs.readdir(SOURCE_DIR);
    const bookFiles = allFiles
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .sort();

    if (bookFiles.length === 0) {
      console.error("Error: No JSON files found in the source directory.");
      return;
    }

    // 4. Process each book file
    for (const bookFile of bookFiles) {
      // Extract the English abbreviation (e.g., "GEN" from "01-GEN.json")
      const bookAbbr = path.basename(bookFile, ".json").substring(3);

      const bookMeta = bookMetadata[bookAbbr];
      if (!bookMeta) {
        console.warn(
          `  -> WARNING: No metadata found for ${bookAbbr}. Skipping file.`
        );
        continue;
      }

      const filePath = path.join(SOURCE_DIR, bookFile);
      const bookData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      // Create a new object for the French version
      const frenchBookData = {
        ...bookData, // Copy all existing data (chapters, verses, etc.)
        book: bookMeta.fr_abbr, // Overwrite the book abbreviation with the French one
      };

      // Define the new filename (e.g., "Gn.json")
      const outPath = path.join(DIST_DIR, `${bookMeta.fr_abbr}.json`);

      // Write the new file, pretty-printed
      await fs.writeFile(outPath, JSON.stringify(frenchBookData, null, 2));
      console.log(
        `  -> Generated: ${bookAbbr}.json -> ${path.basename(outPath)}`
      );
    }

    console.log("\n✅ French JSON generation complete!");
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
}

// --- Run the Script ---
generateFrenchJSON();
