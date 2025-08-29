const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/rst");

// --- Main Function ---
async function generateRst() {
  console.log("Starting generation of reStructuredText (.rst) files...");

  try {
    // 1. Load book metadata for full names
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log("Successfully loaded book metadata.");

    // 2. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 3. Get and sort all source files
    const bookFiles = (await fs.readdir(SOURCE_DIR))
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .sort();

    // 4. Process each book file
    for (const bookFile of bookFiles) {
      const bookAbbr = path.basename(bookFile, ".json").substring(3);
      const bookMeta = bookMetadata[bookAbbr];

      if (!bookMeta) {
        console.warn(`  -> WARNING: No metadata for ${bookAbbr}. Skipping.`);
        continue;
      }

      const filePath = path.join(SOURCE_DIR, bookFile);
      const bookData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      // 5. Build the .rst content in an array
      const rstContent = [];

      // Book Title (H1: Underlined with '=')
      const bookTitle = bookMeta.fr_name;
      rstContent.push(bookTitle);
      rstContent.push("=".repeat(bookTitle.length));
      rstContent.push("");

      for (const chapter of bookData.chapters) {
        // Chapter Title (H2: Underlined with '-')
        const chapterTitle = `Chapitre ${chapter.chapter}`;
        rstContent.push(chapterTitle);
        rstContent.push("-".repeat(chapterTitle.length));
        rstContent.push("");

        for (const verse of chapter.verses) {
          // Verse: Bold number, then text.
          rstContent.push(`**${verse.verse}** ${verse.text.trim()}`);
        }
        rstContent.push(""); // Blank line after each chapter
      }

      // 6. Join all lines and write the .rst file
      const outPath = path.join(DIST_DIR, `${bookAbbr}.rst`);
      await fs.writeFile(outPath, rstContent.join("\n"));
      console.log(`  -> Generated: ${outPath}`);
    }

    console.log("\n✅ reStructuredText generation complete!");
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
}

// --- Run the Script ---
generateRst();
