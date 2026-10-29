const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'SCSA_ADPME_IOBIF_MODELE FINANCIER_CATG. vf.csv');
if (!fs.existsSync(csvPath)) {
  console.error('❌ CSV introuvable : ' + csvPath);
  process.exit(1);
}

const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/);

const parseNumber = (s) => {
  if (!s) return 0;
  const c = s.replace(/\s/g, '').replace(/,/g, '.');
  return isNaN(Number(c)) ? 0 : Number(c);
};

const extractMonthly = (keyword) => {
  const line = lines.find(l => l.includes(keyword));
  if (!line) return null;
  const cols = line.split(';');
  const monthly = [];
  for (let i = 3; i <= 14; i++) monthly.push(parseNumber(cols[i]));
  return monthly;
};

const cv  = extractMonthly('CHARGES VARIABLES');
const ce  = extractMonthly('CHARGES DE EXTERNES');
const sal = extractMonthly('CHARGES DE PERSONNEL');
const tax = extractMonthly('IMPOTS ET TAXES');

console.log('cvMonthly  =', JSON.stringify(cv));
console.log('ceMonthly  =', JSON.stringify(ce));
console.log('salairesMonthly =', JSON.stringify(sal));
console.log('taxesMonthly =', JSON.stringify(tax));

const sum = (a) => a ? a.reduce((s, v) => s + v, 0) : 0;
console.log('\nSommes de contrôle :');
console.log('CV  =', sum(cv));
console.log('CE  =', sum(ce));
console.log('SAL =', sum(sal));
console.log('TAX =', sum(tax));
console.log('TOTAL =', sum(cv) + sum(ce) + sum(sal) + sum(tax));
