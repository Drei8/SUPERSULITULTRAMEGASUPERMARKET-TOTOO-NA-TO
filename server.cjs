// server.cjs
const express = require('express');
const fs      = require('fs');
const path    = require('path');
const cors    = require('cors');

const app = express();

/* ── middleware ──────────────────────────────────────────────────── */
app.use(cors());

/* allow large JSON / form bodies (base-64 images ≈ 2–5 MB) */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ── storage folders ─────────────────────────────────────────────── */
const usersDir    = path.join(__dirname, 'src', 'Users');
const wardrobeDir = path.join(__dirname, 'src', 'Wardrobe');

[usersDir, wardrobeDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/* ───────────────────────────  USERS  ────────────────────────────── */
/* POST /api/saveUserData  – unchanged */
app.post('/api/saveUserData', (req, res) => {
  const { userName, measurements, recommendations, photo } = req.body;
  const safe   = (userName || 'guest').replace(/[^a-z0-9_-]/gi, '_');
  const file   = `${safe}_${Date.now()}.json`;
  const out    = { userName, measurements, recommendations, photo };

  fs.writeFile(
    path.join(usersDir, file),
    JSON.stringify(out, null, 2),
    err => err
      ? res.status(500).json({ error: err.message })
      : res.json({ file })
  );
});

/* GET /api/getUsers  – unchanged */
app.get('/api/getUsers', (_req, res) => {
  const users = fs.readdirSync(usersDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try   { return JSON.parse(fs.readFileSync(path.join(usersDir, f), 'utf-8')); }
      catch { return null; }
    })
    .filter(Boolean);
  res.json(users);
});

/* ─────────────────────────  WARDROBE  ───────────────────────────── */
/* POST /api/saveWardrobeItem
   Body: { userName, userPhoto, outfitB64 }  (outfitB64 = PNG base-64)       */
app.post('/api/saveWardrobeItem', (req, res) => {
  const { userName, userPhoto, outfitB64 } = req.body;
  if (!outfitB64) return res.status(400).json({ error: 'Missing outfitB64' });

  const safe = (userName || 'guest').replace(/[^a-z0-9_-]/gi, '_');
  const ts   = Date.now();

  /* (optional) keep a .png copy for easy browsing */
  try {
    fs.writeFileSync(
      path.join(wardrobeDir, `${safe}_${ts}.png`),
      Buffer.from(outfitB64, 'base64')
    );
  } catch (e) {
    console.error('Wardrobe PNG save failed:', e.message);
  }

  const jsonFile = `${safe}_${ts}.json`;
  fs.writeFile(
    path.join(wardrobeDir, jsonFile),
    JSON.stringify({ userName, userPhoto, outfit: outfitB64 }, null, 2),
    err => err
      ? res.status(500).json({ error: err.message })
      : res.json({ file: jsonFile })
  );
});

/* GET /api/getWardrobeItems – list all saved outfits */
app.get('/api/getWardrobeItems', (_req, res) => {
  const items = fs.readdirSync(wardrobeDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try   { return JSON.parse(fs.readFileSync(path.join(wardrobeDir, f), 'utf-8')); }
      catch { return null; }
    })
    .filter(Boolean);
  res.json(items);
});

/* ──────────────────────────  SERVER  ───────────────────────────── */
const PORT = 5001;
app.listen(PORT, () =>
  console.log(
    `API ready at http://localhost:${PORT}\n` +
    '  • GET  /api/getUsers\n' +
    '  • POST /api/saveUserData\n' +
    '  • GET  /api/getWardrobeItems\n' +
    '  • POST /api/saveWardrobeItem'
  )
);
