const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/txt-readers"); // <-- CHANGE HERE

// --- Main Function ---
async function generateTxtReaders() {
  console.log("Starting generation of Plain Text Reader's Version files..."); // <-- CHANGE HERE

  try {
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    await fs.mkdir(DIST_DIR, { recursive: true });

    const bookFiles = (await fs.readdir(SOURCE_DIR))
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .sort();

    for (const bookFile of bookFiles) {
      const bookAbbr = path.basename(bookFile, ".json").substring(3);
      const bookMeta = bookMetadata[bookAbbr];

      if (!bookMeta) {
        console.warn(`  -> WARNING: No metadata for ${bookAbbr}. Skipping.`);
        continue;
      }

      const filePath = path.join(SOURCE_DIR, bookFile);
      const bookData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      let textContent = `${bookMeta.fr_name}\n\n`;

      for (const chapter of bookData.chapters) {
        textContent += `CHAPITRE ${chapter.chapter}\n`;
        for (const verse of chapter.verses) {
          // Just the text of the verse, followed by a new line
          textContent += `${verse.text}\n`; // <-- VERSE NUMBER REMOVED HERE
        }
        textContent += `\n`; // Add a blank line after each chapter
      }

      const outPath = path.join(DIST_DIR, `${bookAbbr}.txt`);
      await fs.writeFile(outPath, textContent);
      console.log(`  -> Generated: ${outPath}`);
    }

    console.log("\n✅ Plain Text Reader's Version generation complete!"); // <-- CHANGE HERE
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
}

generateTxtReaders();
