const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");

// This array lists all 'dist' directories containing per-book files that need numbering.
// We've added all the new formats to this list.
const TARGET_DIRS = [
  path.join(__dirname, "../formats/html"),
  path.join(__dirname, "../formats/json-fr"),
  path.join(__dirname, "../formats/txt"),
  path.join(__dirname, "../formats/md"), // <-- ADDED
  path.join(__dirname, "../formats/xml"), // <-- ADDED
  path.join(__dirname, "../formats/html-readers"), // <-- ADDED
  path.join(__dirname, "../formats/txt-readers"), // <-- ADDED
  path.join(__dirname, "../formats/rst"), // <-- ADDED
];

// --- Main Function ---
async function numberDistFiles() {
  console.log("Starting to number distribution files...");

  try {
    // 1. Load metadata and create a comprehensive lookup map
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    const lookupMap = {};
    for (const en_abbr in bookMetadata) {
      const meta = bookMetadata[en_abbr];
      // Map both English and French abbreviations to the same metadata object
      lookupMap[en_abbr] = meta;
      lookupMap[meta.fr_abbr] = meta;
    }
    console.log("Book metadata loaded and lookup map created.");

    // 2. Process each target directory
    for (const dir of TARGET_DIRS) {
      console.log(`\nProcessing directory: ${path.basename(dir)}`);
      try {
        const files = await fs.readdir(dir);

        for (const file of files) {
          // Skip files that already look numbered to make the script re-runnable
          if (/^\d{2}-/.test(file)) {
            continue;
          }

          const fileExt = path.extname(file); // .html, .json, etc.
          const baseName = path.basename(file, fileExt); // GEN, Gn, etc.

          const meta = lookupMap[baseName];

          if (meta) {
            // Format number with a leading zero (e.g., 1 -> '01', 10 -> '10')
            const numPrefix = String(meta.book_num).padStart(2, "0");
            const newFileName = `${numPrefix}-${file}`;

            const oldPath = path.join(dir, file);
            const newPath = path.join(dir, newFileName);

            await fs.rename(oldPath, newPath);
            console.log(`  Renamed: ${file} -> ${newFileName}`);
          } else {
            console.warn(
              `  -> WARNING: No metadata found for file '${file}'. Skipping.`
            );
          }
        }
      } catch (error) {
        if (error.code === "ENOENT") {
          console.warn(
            `  -> Directory not found, skipping: ${path.basename(dir)}`
          );
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    console.log("\n✅ File numbering complete!");
  } catch (error) {
    console.error("An error occurred during the renaming process:", error);
  }
}

// --- Run the Script ---
numberDistFiles();
