import fs from "node:fs";
import path from "node:path";
import { PresentationFile } from "@oai/artifact-tool";

const data = fs.readFileSync("output/output.pptx");
const presentation = await PresentationFile.importPptx(data);
const dir = "scratch/pptx-parity-previews";
fs.mkdirSync(dir, { recursive: true });

for (let i = 0; i < presentation.slides.count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const png = await slide.export({ format: "png", width: 1920, height: 1080 });
  fs.writeFileSync(
    path.join(dir, `slide-${String(i + 1).padStart(2, "0")}.png`),
    Buffer.from(await png.arrayBuffer()),
  );
}

console.log(JSON.stringify({ slides: presentation.slides.count, parityPreviews: path.resolve(dir) }, null, 2));
