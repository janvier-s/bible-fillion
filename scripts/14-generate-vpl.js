const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/vpl");
const VPL_OUTPUT_FILE = path.join(DIST_DIR, "fillion.vpl");

// --- Main Function ---
async function generateVpl() {
  console.log("Starting generation of Verse-Per-Line (.vpl) file...");

  try {
    // 1. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Load the necessary data
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log("  -> Loaded book metadata.");

    const bookFiles = (await fs.readdir(SOURCE_DIR))
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .sort();

    // 3. Prepare an array to hold every line of the VPL file
    const vplLines = [];
    console.log("  -> Processing books...");

    // 4. Loop through each book, chapter, and verse to format the lines
    for (const bookFile of bookFiles) {
      const bookAbbr = path.basename(bookFile, ".json").substring(3);
      const bookMeta = bookMetadata[bookAbbr];

      if (!bookMeta) {
        console.warn(`  -> WARNING: No metadata for ${bookAbbr}. Skipping.`);
        continue;
      }

      const filePath = path.join(SOURCE_DIR, bookFile);
      const bookData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      for (const chapter of bookData.chapters) {
        for (const verse of chapter.verses) {
          // Format the reference string, e.g., "Genèse 1:1"
          const reference = `${bookMeta.fr_name} ${chapter.chapter}:${verse.verse}`;
          // Combine reference and text, ensuring there are no newlines in the text
          const line = `${reference} ${verse.text.replace(/\s+/g, " ").trim()}`;
          vplLines.push(line);
        }
      }
    }

    // 5. Write the final .vpl file
    await fs.writeFile(VPL_OUTPUT_FILE, vplLines.join("\n"));
    console.log(`  -> Successfully wrote VPL file to: ${VPL_OUTPUT_FILE}`);

    console.log("\n✅ VPL generation complete!");
  } catch (error) {
    console.error("\n[ERROR] An error occurred during VPL generation:", error);
  }
}

// --- Run the Script ---
generateVpl();
