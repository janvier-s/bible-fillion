const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");

// --- !!! IMPORTANT CONFIGURATION !!! ---
// Using the compiled usfm2usfx.exe from the haiola repository (wordsend version)
const CONVERTER_EXECUTABLE = "/Users/Janvier/Development/haiola/wordsend/wordsend/usfm2usfx.exe";
const CONVERTER_WORKING_DIR = "/Users/Janvier/Development/haiola/wordsend/wordsend";

// --- Script Configuration ---
const USFM_INPUT_FILE = path.join(__dirname, "../formats/usfm/fillion.usfm");
const DIST_DIR = path.join(__dirname, "../formats/usfx");
const USFX_OUTPUT_FILE = path.join(DIST_DIR, "fillion.usfx");

// --- Main Function ---
async function generateUsfx() {
  console.log("Starting generation of USFX XML file...");

  try {
    // 1. Verify the converter executable exists
    await fs.access(CONVERTER_EXECUTABLE);
  } catch (error) {
    console.error(
      `\n[ERROR] Converter executable not found at: ${CONVERTER_EXECUTABLE}`
    );
    console.error(
      "Please ensure the haiola repo is cloned and the executable is built."
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
  // Due to path parsing issues, we need to work from the converter directory
  // Copy input file, run converter, then copy output back
  const tempInputFile = "input.usfm";
  const tempOutputFile = "output.usfx";
  
  const commands = [
    `cp "${USFM_INPUT_FILE}" "${CONVERTER_WORKING_DIR}/${tempInputFile}"`,
    `cd "${CONVERTER_WORKING_DIR}" && mono usfm2usfx.exe -o ${tempOutputFile} ${tempInputFile}`,
    `cp "${CONVERTER_WORKING_DIR}/${tempOutputFile}" "${USFX_OUTPUT_FILE}"`
  ];
  
  const command = commands.join(' && ');

  console.log("Executing external converter command...");
  console.log(`> ${command}`);

  // 5. Execute the command
  exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
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

    console.log(`\nSuccessfully generated: ${USFX_OUTPUT_FILE}`);
    console.log("✅ USFX generation complete!");
  });
}

generateUsfx();
