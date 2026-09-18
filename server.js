const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Obtener IP local
const networkInterfaces = os.networkInterfaces();
let localIP = 'localhost';

for (const interfaceName in networkInterfaces) {
  for (const net of networkInterfaces[interfaceName]) {
    if (net.family === 'IPv4' && !net.internal) {
      localIP = net.address;
    }
  }
}

// Servir imágenes
app.use('/img', express.static(path.join(__dirname, 'img')));

// Servir audios
app.use('/audios', express.static(path.join(__dirname, 'audios')));

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));

// SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`🐶 ¡Perro Salchicha Snake está listo!`);
  console.log(`💻 Local:   http://localhost:${PORT}`);
  console.log(`📱 Celular: http://${localIP}:${PORT}`);
  console.log(`==================================================`);
});
