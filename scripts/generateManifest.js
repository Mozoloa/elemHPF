import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PARAMETERS } from '../src/config/ParameterDefinitions.js';

// Compute __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateManifest() {
    const manifest = {
        window: { width: 120, height: 180 },
        parameters: PARAMETERS.map(param => ({
            paramId: param.paramId,
            name: param.name,
            min: param.min,
            max: param.max,
            defaultValue: param.defaultValue,
            hue: param.hue,
            toggle: param.toggle,
            log: param.log,
            rerender: param.rerender
        }))
    };
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('Manifest generated successfully.');
}
