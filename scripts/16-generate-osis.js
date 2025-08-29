const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");

// --- !!! IMPORTANT CONFIGURATION !!! ---
// The usfm2osis package is now installed and available via command line
const CONVERTER_COMMAND = "usfm2osis";

// --- Script Configuration ---
const USFM_INPUT_FILE = path.join(__dirname, "../formats/usfm/fillion.usfm");
const DIST_DIR = path.join(__dirname, "../formats/osis");
const OSIS_OUTPUT_FILE = path.join(DIST_DIR, "fillion.osis");

// --- Main Function ---
async function generateOsis() {
  console.log("Starting generation of OSIS XML file...");

  // 1. Verify usfm2osis command is available
  try {
    await new Promise((resolve, reject) => {
      exec("which usfm2osis", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    console.error(
      `\n[ERROR] usfm2osis command not found. Please install the usfm2osis package.`
    );
    console.error(
      "Run: pip3 install -e /Users/Janvier/Development/usfm2osis"
    );
    return; // Stop execution
  }

  try {
    // 2. Verify the input USFM file exists
    await fs.access(USFM_INPUT_FILE);
  } catch (error) {
    console.error(`\n[ERROR] Input USFM file not found at: ${USFM_INPUT_FILE}`);
    console.error('Please run the "05-generate-usfm.js" script first.');
    return; // Stop execution
  }

  // 3. Ensure the output directory exists
  await fs.mkdir(DIST_DIR, { recursive: true });

  // 4. Construct the command to execute
  const command = `${CONVERTER_COMMAND} Fillion "${USFM_INPUT_FILE}" > "${OSIS_OUTPUT_FILE}"`;

  console.log("Executing external converter command...");
  console.log(`> ${command}`);

  // 5. Execute the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`\n[EXECUTION ERROR] An error occurred:`);
      console.error(error.message);
      if (stderr) console.error("Stderr:", stderr);
      return;
    }

    if (stderr) {
      console.warn(
        `\n[CONVERTER WARNINGS] The tool produced warnings (this is often ok):`
      );
      console.warn(stderr);
    }

    console.log(`\nSuccessfully generated: ${OSIS_OUTPUT_FILE}`);
    console.log("✅ OSIS generation complete!");
  });
}

generateOsis();
