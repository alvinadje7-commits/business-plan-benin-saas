const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'SCSA_ADPME_IOBIF_MODELE FINANCIER_CATG. vf.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ Fichier introuvable : ${csvPath}`);
  console.error('👉 Assure-toi que le fichier CSV est bien à la racine du projet.');
  process.exit(1);
}

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/);

const parseNumber = (str) => {
  if (!str) return 0;
  const clean = str.replace(/\s/g, '').replace(/,/g, '.');
  return isNaN(Number(clean)) ? 0 : Number(clean);
};

const extractLine = (keyword) => {
  const line = lines.find(l => l.includes(keyword));
  if (!line) return null;
  const cols = line.split(';');
  let sum12 = 0;
  for (let i = 3; i <= 14; i++) {
    sum12 += parseNumber(cols[i]);
  }
  const totalCol = parseNumber(cols[15]);
  return { sum12, totalCol, cols };
};

console.log('📊 EXTRACTION DES DONNÉES (ANNÉE 1) - AVICULTURE\n');

const categories = [
  { key: 'CHARGES VARIABLES', label: 'Charges Variables' },
  { key: 'Achat de poussins', label: 'Achat de poussins' },
  { key: 'Consommation Aliments', label: 'Consommation Aliments' },
  { key: 'Produits phyto', label: 'Produits phyto' },
  { key: 'Coût emballages plateaux', label: 'Emballages plateaux' },
  { key: 'Coût emballages fientes', label: 'Emballages fientes' },
  { key: 'CHARGES DE EXTERNES', label: 'Charges Externes' },
  { key: 'CHARGES DE PERSONNEL', label: 'Charges de Personnel' },
  { key: 'IMPOTS ET TAXES', label: 'Impôts et Taxes' }
];

let result = {};

categories.forEach(cat => {
  const data = extractLine(cat.key);
  if (data) {
    console.log(`${cat.label.padEnd(25)} : ${data.sum12.toLocaleString('fr-FR').padEnd(15)} (TOTAL Excel: ${data.totalCol.toLocaleString('fr-FR')})`);
    result[cat.label] = data.totalCol;
  } else {
    console.log(`❌ ${cat.label.padEnd(25)} : Non trouvé`);
  }
});

const totalLine = lines.find(l => l.startsWith(';;;') && l.includes('8 818 822'));
if (totalLine) {
  const cols = totalLine.split(';');
  let sum12 = 0;
  for (let i = 3; i <= 14; i++) sum12 += parseNumber(cols[i]);
  const totalCol = parseNumber(cols[15]);
  console.log('─'.repeat(60));
  console.log(`TOTAL GÉNÉRAL`.padEnd(25) + ` : ${sum12.toLocaleString('fr-FR').padEnd(15)} (TOTAL Excel: ${totalCol.toLocaleString('fr-FR')})`);
  result['TOTAL GÉNÉRAL'] = totalCol;
}

console.log('\n✅ Données prêtes pour le test unitaire :');
console.log(JSON.stringify(result, null, 2));
