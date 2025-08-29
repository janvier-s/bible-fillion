const path = require("path");
const { execSync } = require("child_process");

// --- Configuration ---
const TEX_DIR = path.join(__dirname, "../formats/xetex");
const TEX_FILENAME = "fillion.tex";

// --- Main Function ---
async function compilePdf() {
  console.log("Starting PDF compilation process with xelatex...");
  console.log("This may take several minutes and multiple passes...");

  try {
    // The command to run. `-interaction=nonstopmode` prevents it from halting on minor errors.
    const command = `xelatex -interaction=nonstopmode "${TEX_FILENAME}"`;

    // It's standard practice to run the compiler twice to ensure the
    // table of contents and page references are correctly generated.
    console.log("\n--- Pass 1: Generating content and references ---");
    // We run the command inside the TEX_DIR to keep all auxiliary files (.aux, .log, .toc) together.
    execSync(command, { cwd: TEX_DIR, stdio: "inherit" });

    console.log("\n--- Pass 2: Finalizing table of contents and layout ---");
    execSync(command, { cwd: TEX_DIR, stdio: "inherit" });

    console.log("\n------------------------------------------------------");
    console.log("✅ PDF compilation complete!");
    console.log(
      `Find your finished document at: ${path.join(TEX_DIR, "fillion.pdf")}`
    );
    console.log("------------------------------------------------------");
  } catch (error) {
    console.error("\n[ERROR] PDF compilation failed.");
    console.error("Please check the following:");
    console.error(
      "  1. Is a TeX distribution (MacTeX, MiKTeX, TeX Live) installed and in your PATH?"
    );
    console.error(
      '  2. Does the font specified in assets/xetex_template.tex (e.g., "Linux Libertine O") exist on your system?'
    );
    console.error(
      `  3. Review the log file for detailed errors: ${path.join(
        TEX_DIR,
        "fillion.log"
      )}`
    );
  }
}

compilePdf();
