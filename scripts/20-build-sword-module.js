const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");

// --- Configuration ---
const OSIS_INPUT_FILE = path.join(__dirname, "../formats/osis/fillion.osis");
const CONF_INPUT_FILE = path.join(__dirname, "../formats/sword/fillion.conf");
const BUILD_DIR = path.join(__dirname, "../formats/sword/build");
const MODULE_ABBR = "Fillion"; // Must match the abbreviation in the .conf file
const OSIS2MOD_COMMAND = "osis2mod";

// --- Main Function ---
async function buildSwordModule() {
  console.log("Starting SWORD module build process...");

  try {
    // 1. Pre-flight check: Verify that osis2mod is installed and in the PATH
    await new Promise((resolve, reject) => {
      // 'which' for Unix-like systems, 'where' for Windows
      const checkCmd = process.platform === "win32" ? "where" : "which";
      exec(`${checkCmd} ${OSIS2MOD_COMMAND}`, (error) => {
        if (error) {
          reject(new Error(`'${OSIS2MOD_COMMAND}' command not found.`));
        } else {
          resolve();
        }
      });
    });
    console.log(`  -> Found '${OSIS2MOD_COMMAND}' command successfully.`);

    // 2. Pre-flight checks for input files
    await fs.access(OSIS_INPUT_FILE);
    await fs.access(CONF_INPUT_FILE);
    console.log("  -> Found required input files (osis and conf).");

    // 3. Set up a clean build directory
    await fs.rm(BUILD_DIR, { recursive: true, force: true }); // Delete old build dir
    await fs.mkdir(BUILD_DIR, { recursive: true });
    console.log(`  -> Created clean build directory at: ${BUILD_DIR}`);

    // 4. Copy input files to the build directory
    await fs.copyFile(OSIS_INPUT_FILE, path.join(BUILD_DIR, "fillion.osis"));
    await fs.copyFile(CONF_INPUT_FILE, path.join(BUILD_DIR, "fillion.conf"));
    console.log("  -> Copied input files to build directory.");

    // 5. Create the modules directory structure as specified in the conf file
    const modulesDir = path.join(BUILD_DIR, "modules", "texts", "ztext", "fillion");
    await fs.mkdir(modulesDir, { recursive: true });
    console.log("  -> Created module directory structure.");

    // 6. Copy the conf file to the module directory (required by SWORD)
    await fs.copyFile(path.join(BUILD_DIR, "fillion.conf"), path.join(modulesDir, "fillion.conf"));
    console.log("  -> Placed configuration file in module directory.");

    // 7. Construct the command to execute
    // Correct syntax: osis2mod <output/path> <osisDoc>
    // The output path should be the specific module directory
    const command = `${OSIS2MOD_COMMAND} ./modules/texts/ztext/fillion ./fillion.osis`;

    console.log("\nExecuting SWORD build command...");
    console.log(`> (in ${BUILD_DIR}) ${command}\n`);

    // 8. Execute the command within the build directory
    // The `cwd` option is crucial here.
    exec(command, { cwd: BUILD_DIR }, (error, stdout, stderr) => {
      if (error) {
        console.error(`\n[BUILD ERROR] An error occurred:`);
        console.error(error.message);
        if (stderr) console.error("Stderr:", stderr);
        return;
      }

      console.log("--- Build Tool Output ---");
      console.log(stdout);
      if (stderr) {
        console.warn("\n--- Build Tool Warnings ---");
        console.warn(stderr);
      }
      console.log("-------------------------");

      console.log(`\nSuccessfully built SWORD module files in:`);
      console.log(path.join(BUILD_DIR, "modules"));

      console.log("\nNext Steps:");
      console.log(`1. Navigate to '${BUILD_DIR}'.`);
      console.log("2. Zip the entire 'modules' directory.");
      console.log(
        "3. The resulting .zip file is your installable SWORD module."
      );

      console.log("\n✅ SWORD module build complete!");
    });
  } catch (error) {
    console.error(`\n[ERROR] ${error.message}`);
    console.error(
      "Please ensure SWORD utilities are installed and in your PATH, and that all prerequisite files have been generated."
    );
  }
}

// --- Run the Script ---
buildSwordModule();
