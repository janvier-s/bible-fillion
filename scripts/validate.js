const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "../source");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const SCHEMA_FILE = path.join(__dirname, "../metadata/book_schema.json");

// --- Main Validation Function ---
async function validateSourceData() {
  console.log("============================================");
  console.log("🔍  STARTING SOURCE DATA VALIDATION  🔍");
  console.log("============================================\n");

  const errors = [];

  // --- Load all necessary files first ---
  const sourceFiles = (await fs.readdir(SOURCE_DIR))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
  const bookSchema = JSON.parse(await fs.readFile(SCHEMA_FILE, "utf-8"));

  // --- Check 1: Sync between source files and metadata ---
  console.log("1. Checking sync between source files and metadata...");
  const sourceAbbrs = new Set(
    sourceFiles.map((f) => path.basename(f, ".json").substring(3))
  );
  const metaAbbrs = new Set(Object.keys(bookMetadata));

  for (const abbr of sourceAbbrs) {
    if (!metaAbbrs.has(abbr)) {
      errors.push(
        `Source file for '${abbr}' exists, but it's missing from metadata/books.json.`
      );
    }
  }
  for (const abbr of metaAbbrs) {
    if (!sourceAbbrs.has(abbr)) {
      errors.push(
        `Metadata for '${abbr}' exists, but its source file is missing.`
      );
    }
  }

  // --- Check 2: Detailed inspection of each book file ---
  console.log(
    "2. Inspecting each book for continuity, duplicates, and empty verses..."
  );
  for (const file of sourceFiles) {
    const bookAbbr = path.basename(file, ".json").substring(3);
    const bookData = JSON.parse(
      await fs.readFile(path.join(SOURCE_DIR, file), "utf-8")
    );

    // Check chapter count against schema
    const expectedChapters = bookSchema[bookAbbr];
    const actualChapters = bookData.chapters.length;
    if (expectedChapters !== actualChapters) {
      errors.push(
        `[${bookAbbr}] Chapter count mismatch. Expected: ${expectedChapters}, Found: ${actualChapters}.`
      );
    }

    let lastChapterNum = 0;
    const seenChapters = new Set();

    for (const chapter of bookData.chapters) {
      // Chapter continuity and duplicates
      if (seenChapters.has(chapter.chapter)) {
        errors.push(
          `[${bookAbbr}] Duplicate chapter found: Chapter ${chapter.chapter}.`
        );
      }
      seenChapters.add(chapter.chapter);
      if (chapter.chapter !== lastChapterNum + 1) {
        errors.push(
          `[${bookAbbr}] Chapter gap or wrong order. After chapter ${lastChapterNum}, expected ${
            lastChapterNum + 1
          } but got ${chapter.chapter}.`
        );
      }
      lastChapterNum = chapter.chapter;

      let lastVerseNum = 0;
      const seenVerses = new Set();
      for (const verse of chapter.verses) {
        // Verse continuity and duplicates
        if (seenVerses.has(verse.verse)) {
          errors.push(
            `[${bookAbbr} ${chapter.chapter}] Duplicate verse found: Verse ${verse.verse}.`
          );
        }
        seenVerses.add(verse.verse);
        if (verse.verse !== lastVerseNum + 1) {
          errors.push(
            `[${bookAbbr} ${
              chapter.chapter
            }] Verse gap or wrong order. After verse ${lastVerseNum}, expected ${
              lastVerseNum + 1
            } but got ${verse.verse}.`
          );
        }
        lastVerseNum = verse.verse;

        // Check for empty text
        if (!verse.text || verse.text.trim() === "") {
          errors.push(
            `[${bookAbbr} ${chapter.chapter}:${verse.verse}] Verse text is empty.`
          );
        }
      }
    }
  }

  // --- Final Report ---
  console.log("\n--------------------------------------------");
  if (errors.length === 0) {
    console.log("✅  VALIDATION PASSED! No errors found.");
    console.log("--------------------------------------------");
  } else {
    console.error(`❌  VALIDATION FAILED! Found ${errors.length} error(s):`);
    errors.forEach((err) => console.error(`  - ${err}`));
    console.error("--------------------------------------------");
    process.exit(1); // Exit with a failure code
  }
}

// --- Run the Script ---
validateSourceData();
