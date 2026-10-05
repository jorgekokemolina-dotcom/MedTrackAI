import fs from 'fs';
import path from 'path';
import { generateSyntheticDataset } from '../lib/synthetic-generator';

/**
 * Script para generar 10.000 pacientes ficticios en data/synthetic_patients_10k.json
 */
function main() {
  console.log('Generando dataset sintético de 10.000 pacientes ficticios...');
  const dataset = generateSyntheticDataset(10000);

  const outDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'synthetic_patients_10k.json');
  fs.writeFileSync(outPath, JSON.stringify(dataset.patients.slice(0, 1000), null, 2));

  console.log(`✅ Dataset sintético generado con éxito en ${outPath}`);
  console.log(`Muestra: ${dataset.patients.length} pacientes ficticios generados.`);
}

main();
