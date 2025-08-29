// This script requires the `epub-gen` package.
// Run `npm install epub-gen` in your terminal first.

const fs = require("fs").promises;
const path = require("path");
const Epub = require("epub-gen");

// --- Configuration ---
const HTML_SOURCE_DIR = path.join(__dirname, "../formats/html");
const METADATA_FILE = path.join(__dirname, "../metadata/books.json");
const COVER_IMAGE_PATH = path.join(__dirname, "../assets/cover.jpg");
const DIST_DIR = path.join(__dirname, "../formats/epub");
const EPUB_OUTPUT_FILE = path.join(DIST_DIR, "fillion.epub");

// --- Main Function ---
async function generateEpub() {
  console.log("Starting generation of ePub file...");

  try {
    // 1. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Load metadata and get sorted list of HTML files
    const bookMetadata = JSON.parse(await fs.readFile(METADATA_FILE, "utf-8"));
    const htmlFiles = (await fs.readdir(HTML_SOURCE_DIR))
      .filter((file) => file.endsWith(".html") && /^\d{2}-/.test(file))
      .sort();

    console.log(`  -> Found ${htmlFiles.length} HTML book files to process.`);

    // 3. Prepare the content array for epub-gen
    const epubContent = [];
    for (const file of htmlFiles) {
      const bookAbbr = path.basename(file, ".html").substring(3);
      const bookMeta = bookMetadata[bookAbbr];

      if (bookMeta) {
        let htmlContent = await fs.readFile(
          path.join(HTML_SOURCE_DIR, file),
          "utf-8"
        );

        // Extract only the content within the <body> tag to avoid nested HTML docs
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : "";

        epubContent.push({
          title: bookMeta.fr_name,
          data: bodyContent,
        });
      }
    }

    // 4. Define the ePub options
    const options = {
      title: "Bible Fillion (1904)",
      author: "Louis-Claude Fillion",
      publisher: "Projet Fillion Numérique",
      content: epubContent,
      verbose: true, // Set to true to see detailed output from the library
    };

    // 5. Check for and add the cover image if it exists
    try {
      await fs.access(COVER_IMAGE_PATH);
      options.cover = COVER_IMAGE_PATH;
      console.log("  -> Found cover image, adding it to the ePub.");
    } catch (error) {
      console.log("  -> No cover image found at assets/cover.jpg. Skipping.");
    }

    // 6. Generate the ePub file
    console.log("\n  -> Handing off to epub-gen library for packaging...");
    await new Epub(options, EPUB_OUTPUT_FILE).promise;

    console.log(`\nSuccessfully generated ePub file at: ${EPUB_OUTPUT_FILE}`);
    console.log("\n✅ ePub generation complete!");
  } catch (error) {
    console.error("\n[ERROR] An error occurred during ePub generation:", error);
  }
}

// --- Run the Script ---
generateEpub();
