const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/jugadores', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const sorted = data.sort((a, b) => b.puntaje - a.puntaje);
    res.json(sorted);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.post('/guardar', (req, res) => {
  try {
    const { nombre, puntaje, nivel } = req.body;
    if (!nombre || !puntaje) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    let players = [];
    if (fs.existsSync(DATA_FILE)) {
      players = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }

    players.push({
      nombre,
      puntaje,
      nivel,
      fecha: new Date().toISOString()
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
