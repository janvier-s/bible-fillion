const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const TEMPLATE_FILE = path.join(__dirname, "../assets/xetex_template.tex");
const DIST_DIR = path.join(__dirname, "../formats/xetex");
const TEX_OUTPUT_FILE = path.join(DIST_DIR, "fillion.tex");

/**
 * Escapes characters that have special meaning in TeX.
 * @param {string} text The raw text to escape.
 * @returns {string} The escaped text.
 */
function escapeTex(text) {
  return text
    .replace(/[&%$#_{}~^\\]/g, "\\$&")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

// --- Main Function ---
async function generateXeTeX() {
  console.log("Starting generation of XeTeX (.tex) source file...");

  try {
    // 1. Ensure output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Load template, metadata, and book files
    let template = await fs.readFile(TEMPLATE_FILE, "utf-8");
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    const bookFiles = (await fs.readdir(SOURCE_DIR))
      .filter((file) => file.endsWith(".json"))
      .sort();

    console.log("  -> Loaded template and metadata. Processing books...");

    // 3. Generate the TeX content for the entire Bible
    const bibleContent = [];
    for (const bookFile of bookFiles) {
      const bookAbbr = path.basename(bookFile, ".json").substring(3);
      const bookMeta = bookMetadata[bookAbbr];
      if (!bookMeta) continue;

      // Add a part for OT/NT and a book chapter for the table of contents
      if (bookAbbr === "GEN") bibleContent.push("\\part{Ancien Testament}");
      if (bookAbbr === "MAT") bibleContent.push("\\part{Nouveau Testament}");
      bibleContent.push(`\\chapter{${escapeTex(bookMeta.fr_name)}}`);

      const bookData = JSON.parse(
        await fs.readFile(path.join(SOURCE_DIR, bookFile), "utf-8")
      );
      for (const chapter of bookData.chapters) {
        bibleContent.push(`\\biblechapter{${chapter.chapter}}`);
        const chapterText = chapter.verses
          .map((verse) => `\\versenum{${verse.verse}}${escapeTex(verse.text)}`)
          .join(" "); // Join verses with a space
        bibleContent.push(chapterText);
      }
    }

    // 4. Inject the generated content into the template
    const finalTexContent = template.replace(
      "%%BIBLE_CONTENT%%",
      bibleContent.join("\n\n")
    );

    // 5. Write the final .tex file
    await fs.writeFile(TEX_OUTPUT_FILE, finalTexContent);
    console.log(`  -> Successfully generated .tex file at: ${TEX_OUTPUT_FILE}`);

    console.log("\n✅ XeTeX source generation complete!");
    console.log("Next step: Run the compilation script to create the PDF.");
  } catch (error) {
    console.error(
      "\n[ERROR] An error occurred during .tex file generation:",
      error
    );
  }
}

generateXeTeX();
