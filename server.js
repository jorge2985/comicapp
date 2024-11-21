const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Habilita CORS para permitir el acceso desde el frontend
app.use(cors());

// Middleware para manejar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carpeta para almacenar los archivos subidos
const UPLOADS_FOLDER = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_FOLDER));

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Rutas de los archivos

// Subir un archivo
app.post('/upload', upload.single('comic'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió el archivo.');
  }
  res.status(200).json({
    message: 'Archivo subido con éxito',
    file: req.file,
  });
});

// Obtener lista de archivos
app.get('/archivos', (req, res) => {
  const fs = require('fs');
  fs.readdir(UPLOADS_FOLDER, (err, archivos) => {
    if (err) {
      return res.status(500).send('Error al leer los archivos.');
    }
    res.status(200).json({ archivos });
  });
});

// Descargar un archivo
app.get('/descarga/:filename', (req, res) => {
  const rutaArchivo = path.join(UPLOADS_FOLDER, req.params.filename);
  res.download(rutaArchivo, err => {
    if (err) {
      res.status(500).send('Error al descargar el archivo.');
    }
  });
});

// Eliminar un archivo
app.delete('/eliminar/:filename', (req, res) => {
  const fs = require('fs');
  const rutaArchivo = path.join(UPLOADS_FOLDER, req.params.filename);
  fs.unlink(rutaArchivo, err => {
    if (err) {
      return res.status(500).send('Error al eliminar el archivo.');
    }
    res.status(200).send('Archivo eliminado de manera exitosa.');
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
