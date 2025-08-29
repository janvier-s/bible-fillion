// This script requires the `prompts` package for the interactive menu.
// Run `npm install prompts` in your terminal first.

const { execSync } = require("child_process");
const path = require("path");
const prompts = require("prompts");

// --- Configuration: The Master List of Scripts (no changes needed here) ---
const SCRIPTS = [
  {
    file: "01-generate-flat-json.js",
    title: "Flat JSON Formats",
    key: "flat",
    groups: ["core", "dev"],
  },
  {
    file: "02-generate-french-json.js",
    title: "French-Abbreviation JSON",
    key: "json-fr",
    groups: ["core", "dev"],
  },
  {
    file: "03-generate-txt.js",
    title: "Plain Text (TXT) Files",
    key: "txt",
    groups: ["core", "text"],
  },
  {
    file: "04-generate-html.js",
    title: "HTML Files",
    key: "html",
    groups: ["core", "web"],
  },
  {
    file: "05-generate-md.js",
    title: "Markdown Files",
    key: "md",
    groups: ["core", "text"],
  },
  {
    file: "06-generate-xml.js",
    title: "Generic XML Files",
    key: "xml",
    groups: ["core", "interchange"],
  },
  {
    file: "07-generate-rst.js",
    title: "reStructuredText (RST) Files",
    key: "rst",
    groups: ["text"],
  },
  {
    file: "08-generate-html-readers.js",
    title: "HTML Reader's Version",
    key: "html-readers",
    groups: ["web", "readers"],
  },
  {
    file: "09-generate-txt-readers.js",
    title: "TXT Reader's Version",
    key: "txt-readers",
    groups: ["text", "readers"],
  },
  {
    file: "10-generate-sqlite.js",
    title: "SQLite Database",
    key: "sqlite",
    groups: ["dev", "databases"],
  },
  {
    file: "11-generate-sql.js",
    title: "SQL Dump File",
    key: "sql",
    groups: ["dev", "databases"],
  },
  {
    file: "12-generate-csv.js",
    title: "CSV File",
    key: "csv",
    groups: ["dev", "data"],
  },
  {
    file: "13-generate-jsonl.js",
    title: "JSON Lines File",
    key: "jsonl",
    groups: ["dev", "data"],
  },
  {
    file: "14-generate-vpl.js",
    title: "Verse-Per-Line (VPL) File",
    key: "vpl",
    groups: ["legacy"],
  },
  {
    file: "15-generate-usfm.js",
    title: "USFM File (Prerequisite)",
    key: "usfm",
    groups: ["interchange"],
  },
  {
    file: "16-generate-osis.js",
    title: "OSIS File",
    key: "osis",
    groups: ["interchange", "sword"],
    dependsOn: ["usfm"],
  },
  {
    file: "17-generate-usfx.js",
    title: "USFX File",
    key: "usfx",
    groups: ["interchange"],
    dependsOn: ["usfm"],
  },
  {
    file: "18-number-dist-files.js",
    title: "Numbering All Per-Book Files",
    key: "numbering",
    groups: ["utility"],
  },
  {
    file: "19-generate-sword-conf.js",
    title: "SWORD .conf File",
    key: "sword-conf",
    groups: ["sword"],
  },
  {
    file: "20-build-sword-module.js",
    title: "Final SWORD Module",
    key: "sword-module",
    groups: ["packaged", "sword"],
    dependsOn: ["osis", "sword-conf"],
  },
];

const GROUPS = {
  core: "The essential text, web, and developer formats.",
  text: "All plain-text variants (txt, md, rst).",
  web: "Formats for web display (html).",
  dev: "Formats for developers (flat json, databases, data files).",
  databases: "All database formats (sqlite, sql).",
  data: "Formats for data analysis (csv, jsonl).",
  interchange: "Standard interchange formats for Bible software.",
  readers: "Verse-number-free reader's versions.",
  legacy: "Formats for older software (vpl).",
  sword: "Everything needed to build the SWORD module.",
  packaged: "Final, user-facing packaged products.",
  utility: "Helper scripts like numbering files.",
};

function getScriptByKey(key) {
  return SCRIPTS.find((s) => s.key === key);
}

// --- The Main Execution Logic ---
async function run() {
  const args = process.argv.slice(2);
  let tasksToRun = new Set();

  // Mode 1: Non-Interactive (if arguments are provided)
  if (args.length > 0) {
    console.log("Running in non-interactive mode...");
    if (args.includes("--all")) {
      SCRIPTS.forEach((script) => tasksToRun.add(script.key));
    } else {
      for (const arg of args) {
        const script = getScriptByKey(arg);
        if (script) {
          tasksToRun.add(script.key);
        } else if (GROUPS[arg]) {
          SCRIPTS.forEach((s) => {
            if (s.groups.includes(arg)) tasksToRun.add(s.key);
          });
        } else {
          console.error(
            `\n❌ ERROR: Unknown format or group key '${arg}'. Use 'node scripts/build.js' for interactive mode.`
          );
          process.exit(1);
        }
      }
    }
  }
  // Mode 2: Interactive (default)
  else {
    const choices = [
      { title: ">>> Build ALL Formats <<<", value: "all" },
      { title: "----------------- FORMATS -----------------", disabled: true },
      ...SCRIPTS.map((s) => ({
        title: `[Format] ${s.key.padEnd(18)} - ${s.title}`,
        value: s.key,
      })),
      { title: "------------------ GROUPS ------------------", disabled: true },
      ...Object.keys(GROUPS).map((g) => ({
        title: `[Group]  ${g.padEnd(18)} - ${GROUPS[g]}`,
        value: g,
      })),
    ];

    const response = await prompts({
      type: "multiselect",
      name: "selected",
      message:
        "Select formats or groups to build (Space to select, Enter to confirm)",
      choices,
      hint: "- Use arrows, space to select, enter to submit",
    });

    if (!response.selected || response.selected.length === 0) {
      console.log("No selection made. Exiting.");
      return;
    }

    if (response.selected.includes("all")) {
      SCRIPTS.forEach((script) => tasksToRun.add(script.key));
    } else {
      for (const selection of response.selected) {
        if (getScriptByKey(selection)) {
          tasksToRun.add(selection);
        } else if (GROUPS[selection]) {
          SCRIPTS.forEach((s) => {
            if (s.groups.includes(selection)) tasksToRun.add(s.key);
          });
        }
      }
    }
  }

  // Dependency Resolution (applies to both modes)
  let addedDependency;
  do {
    addedDependency = false;
    for (const taskKey of tasksToRun) {
      const script = getScriptByKey(taskKey);
      if (script.dependsOn) {
        for (const depKey of script.dependsOn) {
          if (!tasksToRun.has(depKey)) {
            tasksToRun.add(depKey);
            addedDependency = true;
            console.log(
              `  -> Dependency Added: '${taskKey}' requires '${depKey}'.`
            );
          }
        }
      }
    }
  } while (addedDependency);

  const finalScriptList = SCRIPTS.filter((script) =>
    tasksToRun.has(script.key)
  );

  if (finalScriptList.length === 0) {
    console.log("No scripts to run based on selection. Exiting.");
    return;
  }

  console.log("\n============================================");
  console.log("🚀  STARTING BUILD PROCESS  🚀");
  console.log("============================================");

  const startTime = Date.now();

  for (let i = 0; i < finalScriptList.length; i++) {
    const script = finalScriptList[i];
    const scriptPath = path.join(__dirname, script.file);
    const scriptNumber = i + 1;
    const totalScripts = finalScriptList.length;

    console.log(
      `\n----------------------------------------------------------------------`
    );
    console.log(`[${scriptNumber}/${totalScripts}] Running: ${script.title}`);
    console.log(
      `----------------------------------------------------------------------`
    );

    try {
      execSync(`node "${scriptPath}"`, { stdio: "inherit" });
      console.log(`✅  Successfully completed: ${script.file}`);
    } catch (error) {
      console.error(`\n❌  ERROR: Script '${script.file}' failed to execute.`);
      console.error("Build process halted.");
      process.exit(1);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log("\n============================================");
  console.log(`🎉  BUILD PROCESS COMPLETED SUCCESSFULLY! 🎉`);
  console.log(
    `Total scripts run: ${finalScriptList.length}. Total time: ${duration} seconds.`
  );
  console.log("============================================");
}

run();
