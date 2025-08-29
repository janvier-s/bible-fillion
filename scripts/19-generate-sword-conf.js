const fs = require("fs").promises;
const path = require("path");

// --- Configuration ---
const DIST_DIR = path.join(__dirname, "../formats/sword");
const CONF_OUTPUT_FILE = path.join(DIST_DIR, "fillion.conf");

// --- Main Function ---
async function generateSwordConf() {
  console.log("Starting generation of SWORD .conf file...");

  try {
    // 1. Ensure the output directory exists
    await fs.mkdir(DIST_DIR, { recursive: true });

    // 2. Define the content of the .conf file
    // This is the metadata that describes your module to the SWORD engine.
    const confContent = `
[Fillion]
DataPath=./modules/texts/ztext/fillion/
ModDrv=zText
Abbreviation=Fillion
Description=Bible Fillion (1904), traduction par Louis-Claude Fillion
Lang=fr
SourceType=OSIS
Version=1.0
History_1.0=Version initiale générée automatiquement depuis le projet GitHub.
About=La Bible Fillion, publiée en 1904, est une traduction catholique romaine de la Bible en français réalisée par l'abbé Louis-Claude Fillion. Ce module a été généré à partir de la source JSON disponible sur GitHub.
LCSH=Bible. French. Fillion. 1904.
DistributionLicense=Public Domain

# --- Optional Enhancements ---
# GlobalOptionFilter=OSISFootnotes
# GlobalOptionFilter=Headings
`;

    // 3. Write the final .conf file
    // .trim() removes leading/trailing whitespace from our template string
    await fs.writeFile(CONF_OUTPUT_FILE, confContent.trim());
    console.log(`  -> Successfully wrote SWORD config to: ${CONF_OUTPUT_FILE}`);

    console.log(`\nNext Steps:`);
    console.log(
      `1. Place this '${path.basename(
        CONF_OUTPUT_FILE
      )}' file in the same directory as your 'fillion.osis' file.`
    );
    console.log(`2. Run the SWORD utility 'osis2mod' to build the module.`);

    console.log("\n✅ SWORD .conf generation complete!");
  } catch (error) {
    console.error(
      "\n[ERROR] An error occurred during .conf file generation:",
      error
    );
  }
}

// --- Run the Script ---
generateSwordConf();
