const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/md"); // Using 'formats' as discussed

// --- Main Function ---
async function generateMd() {
  console.log("Starting generation of Markdown (.md) files...");

  try {
    // 1. Load book metadata for full names
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log("Successfully loaded book metadata.");

    // 2. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 3. Get and sort all source files to ensure canonical order
    const bookFiles = (await fs.readdir(SOURCE_DIR))
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .sort();

    // 4. Process each book file
    for (const bookFile of bookFiles) {
      const bookAbbr = path.basename(bookFile, ".json").substring(3); // "01-GEN" -> "GEN"
      const bookMeta = bookMetadata[bookAbbr];

      if (!bookMeta) {
        console.warn(
          `  -> WARNING: No metadata found for ${bookAbbr}. Skipping.`
        );
        continue;
      }

      const filePath = path.join(SOURCE_DIR, bookFile);
      const bookData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      // 5. Build the Markdown content in an array for clarity and performance
      const mdContent = [];

      // Book Title (Level 1 Heading)
      mdContent.push(`# ${bookMeta.fr_name}`);
      mdContent.push(""); // Add a blank line

      for (const chapter of bookData.chapters) {
        // Chapter Title (Level 2 Heading)
        mdContent.push(`## Chapitre ${chapter.chapter}`);
        mdContent.push(""); // Add a blank line

        for (const verse of chapter.verses) {
          // Verse: Bold number, then text. .trim() is good practice.
          mdContent.push(`**${verse.verse}** ${verse.text.trim()}`);
        }
        mdContent.push(""); // Add a blank line after each chapter
      }

      // 6. Join all lines and write the .md file
      const outPath = path.join(DIST_DIR, `${bookAbbr}.md`);
      await fs.writeFile(outPath, mdContent.join("\n"));
      console.log(`  -> Generated: ${outPath}`);
    }

    console.log("\n✅ Markdown generation complete!");
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
}

// --- Run the Script ---
generateMd();
