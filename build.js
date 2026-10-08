const fs = require('fs');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) { console.error('Faltan SUPABASE_URL o SUPABASE_ANON_KEY'); process.exit(1); }
fs.mkdirSync('dist', { recursive: true });
const html = fs.readFileSync('index.template.html', 'utf8')
  .replace('__SUPABASE_URL__', url)
  .replace('__SUPABASE_KEY__', key);
fs.writeFileSync('dist/index.html', html);
console.log('Build listo');