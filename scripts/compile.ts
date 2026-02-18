import { SubjectiveGeneral } from '../src/templates/SubjectiveGeneral';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log("  Compiling SubjectiveGeneral...");

    try {
        const template = await SubjectiveGeneral.compile();

        // Output directory
        const outDir = path.join(__dirname, '../dist/templates');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const outFile = path.join(outDir, `${template.id}.json`);
        fs.writeFileSync(outFile, JSON.stringify(template, null, 2));

        console.log(` Success! Wrote to ${outFile}`);
        console.log("---------------------------------------------------");
        console.log(JSON.stringify(template, null, 2));
        console.log("---------------------------------------------------");

    } catch (e) {
        console.error(" Compilation Failed:", e);
        process.exit(1);
    }
}

main();
