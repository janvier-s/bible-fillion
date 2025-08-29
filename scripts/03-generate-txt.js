const fs = require("fs").promises;
const path = require("path");

const sourceDir = path.join(__dirname, "../source");
const distDir = path.join(__dirname, "../formats/txt");

async function generateTxt() {
  await fs.mkdir(distDir, { recursive: true });
  const files = await fs.readdir(sourceDir);

  for (const file of files) {
    if (path.extname(file) === ".json") {
      const filePath = path.join(sourceDir, file);
      const jsonData = JSON.parse(await fs.readFile(filePath, "utf-8"));

      let textContent = `Livre : ${jsonData.book}\n\n`;

      for (const chapter of jsonData.chapters) {
        textContent += `Chapitre ${chapter.chapter}\n`;
        for (const verse of chapter.verses) {
          textContent += `${verse.verse} ${verse.text}\n`;
        }
        textContent += "\n";
      }

      const outPath = path.join(distDir, `${jsonData.book}.txt`);
      await fs.writeFile(outPath, textContent);
      console.log(`Generated ${outPath}`);
    }
  }
}

generateTxt();
