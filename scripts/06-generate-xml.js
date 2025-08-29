const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/xml");

/**
 * Escapes special XML characters in a string.
 * This is crucial for creating well-formed XML documents.
 * @param {string} unsafe The string to escape.
 * @returns {string} The escaped string.
 */
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"”]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      case "”":
        return "&quot;"; // Handle curly double quotes
    }
  });
}

// --- Main Function ---
async function generateXml() {
  console.log("Starting generation of XML files...");

  try {
    // 1. Load book metadata
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

      // 5. Build the XML content string with proper indentation
      const xmlContent = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<book id="${bookAbbr}">`,
        `  <title>${escapeXml(bookMeta.fr_name)}</title>`,
        ...bookData.chapters.flatMap((chapter) => [
          `  <chapter num="${chapter.chapter}">`,
          ...chapter.verses.map(
            (verse) =>
              `    <verse num="${verse.verse}">${escapeXml(
                verse.text.trim()
              )}</verse>`
          ),
          `  </chapter>`,
        ]),
        `</book>`,
      ];

      // 6. Write the .xml file
      const outPath = path.join(DIST_DIR, `${bookAbbr}.xml`);
      await fs.writeFile(outPath, xmlContent.join("\n"));
      console.log(`  -> Generated: ${outPath}`);
    }

    console.log("\n✅ XML generation complete!");
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
}

// --- Run the Script ---
generateXml();
