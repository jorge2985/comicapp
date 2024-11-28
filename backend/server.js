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
  const fs = require('fs');

  const { titulo, categoria } = req.body;

  if (!req.file) {
    return res.status(400).send('No se subió el archivo.');
  }

  const newFile = {
    filename: req.file.filename,
    titulo,
    categoria,
  };

  // Leer el archivo metadata.json
  const metadataPath = path.join(__dirname, 'metadata.json');
  fs.readFile(metadataPath, (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el archivo de metadata.');
    }

    let metadata = [];
    if (data.length) {
      metadata = JSON.parse(data);
    }

    // Agregar el nuevo archivo al array de metadatos
    metadata.push(newFile);

    // Guardar los metadatos actualizados en metadata.json
    fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), err => {
      if (err) {
        return res.status(500).send('Error al guardar los metadatos.');
      }

      res.status(200).json({
        message: 'Archivo subido con éxito',
        file: newFile,
      });
    });
  });
});

// Obtener lista de archivos
app.get('/archivos', (req, res) => {
  const fs = require('fs');
  const metadataPath = path.join(__dirname, 'metadata.json');

  fs.readFile(metadataPath, (err, archivos) => {
    if (err) {
      return res.status(500).send('Error al leer los archivos.');
    }

    const metadata = archivos.length ? JSON.parse(archivos) : [];
    res.status(200).json({ archivos: metadata });
  });
});

// Descargar un archivo
app.get('/descarga/:filename', (req, res) => {
  const fs = require('fs');
  const rutaArchivo = path.join(UPLOADS_FOLDER, req.params.filename);
  const metadataPath = path.join(__dirname, 'metadata.json');

  // Eliminar el archivo físico
  res.unlink(rutaArchivo, err => {
    if (err) {
      res.status(500).send('Error al descargar el archivo.');
    }

    // Actualizar metadata.json
    fs.readFile(metadataPath, (err, data) => {
      if (err) {
        return res.status(500).send('Error al leer el archivo de metadata.');
      }

      let metadata = data.length ? JSON.parse(data) : [];
      metadata = metadata.filter(file => file.filename !== req.params.filename);

      fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), err => {
        if (err) {
          return res.status(500).send('Error al actualizar los metadatos.');
        }

        res.status(200).send('Archivo eliminado de manera exitosa.');
      });
    });
  });
});

// Eliminar un archivo
app.delete('/eliminar/:filename', (req, res) => {
  const fs = require('fs');
  const rutaArchivo = path.join(UPLOADS_FOLDER, req.params.filename);
  const metadataPath = path.join(__dirname, 'metadata.json');   // Ruta del archivo metadata.json
  const { filename } = req.params

  // Elimina el archivo físico
  fs.unlink(rutaArchivo, err => {
    if (err) {
      return res.status(500).send('Error al eliminar el archivo.');
    }

    // Eliminar la entrada correspondiente en metadata.json
    fs.readFile(metadataPath, 'utf-8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Error al leer el archivo de metadatos.' });
      }

      let metadata = JSON.parse(data);
      // Filtra los archivos que no coinciden con el filename
      metadata = metadata.filter(file => file.filename !== filename);

      // Guarda el archivo actualizado
      fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error al actualizar los metadatos.' });
        }
        res.status(200).send('Archivo eliminado de manera exitosa.');
      });
    });
  });
});

  // Iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
