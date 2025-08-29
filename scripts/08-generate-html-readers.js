const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const DIST_DIR = path.join(__dirname, "../formats/html-readers"); // <-- CHANGE HERE

// --- Main Function ---
async function generateHtmlReaders() {
  console.log("Starting generation of HTML Reader's Version files..."); // <-- CHANGE HERE

  try {
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    console.log("Successfully loaded book metadata.");

    await fs.mkdir(DIST_DIR, { recursive: true });

    const bookFiles = (await fs.readdir(SOURCE_DIR))
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .sort();

    for (const bookFile of bookFiles) {
      const bookAbbr = path.basename(bookFile, ".json").substring(3);
      const bookMeta = bookMetadata[bookAbbr];

      if (!bookMeta) {
        console.warn(
          `  -> WARNING: No metadata found for ${bookAbbr}. Skipping.`
        );
        continue;
      }

      const filePath = path.join(SOURCE_DIR, bookFile);
      const bookData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bookMeta.fr_name} | Bible Fillion (Version Lecteur)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    h1, h2 { text-align: center; color: #555; font-weight: 300; }
    .chapter { margin-bottom: 3rem; }
    .verse { margin-bottom: 0.5rem; text-indent: 1em; } /* Indent paragraphs for readability */
  </style>
</head>
<body>
  <h1>${bookMeta.fr_name}</h1>
  ${bookData.chapters
    .map(
      (chapter) => `
  <div class="chapter" id="ch-${chapter.chapter}">
    <h2>Chapitre ${chapter.chapter}</h2>
    ${chapter.verses
      .map(
        (verse) => `
    <p class="verse">${verse.text}</p>`
      )
      .join("")}
  </div>`
    )
    .join("\n")}
</body>
</html>`; // <-- VERSE NUMBER REMOVED HERE

      const outPath = path.join(DIST_DIR, `${bookAbbr}.html`);
      await fs.writeFile(outPath, htmlContent);
      console.log(`  -> Generated: ${outPath}`);
    }

    console.log("\n✅ HTML Reader's Version generation complete!"); // <-- CHANGE HERE
  } catch (error) {
    console.error("An error occurred during the generation process:", error);
  }
}

generateHtmlReaders();
