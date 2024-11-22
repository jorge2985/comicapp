const cargaFormulario = document.getElementById('carga-formulario');
const comicArchivo = document.getElementById('comic-archivo');
const listaArchivos = document.getElementById('lista-archivos');

// Base URL del backend
const BASE_URL = 'http://localhost:3000';

// Función para obtener y mostrar archivos
const obtenerArchivos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/archivos`);
    const data = await response.json();
    listaArchivos.innerHTML = '';

    data.archivos.forEach(file => {
      const card = document.createElement('div');
      card.className = 'card';

      const embed = document.createElement('embed');
      embed.src = `${BASE_URL}/uploads/${file}#toolbar=0&page=1`;
      embed.type = 'application/pdf';
      embed.width = '100%';
      embed.height = '300px';
      embed.style.borderRadius = '8px';
      embed.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      embed.style.pointerEvents = 'none';
      card.appendChild(embed);

      const links = document.createElement('div');
      links.innerHTML = `
        <a href="${BASE_URL}/descarga/${file}" target="_blank">Descargar</a>
            <button onclick="vistaPDF('${file}')">Ver</button>
            <button onclick="eliminarArchivo('${file}')">Eliminar</button>
        </div>
      `;
      links.style.marginTop = '10px';
      card.appendChild(links);

      listaArchivos.appendChild(card);
    });
  } catch (error) {
    console.error('Error al obtener archivos:', error);
  }
};

// Abrir el PDF completo en una nueva ventana
const vistaPDF = (filename) => {
    window.open(`${BASE_URL}/uploads/${filename}`, '_blank')
}

// Función para subir archivos
cargaFormulario.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData();
  formData.append('comic', comicArchivo.files[0]);

  try {
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      alert('Archivo subido de manera exitosa');
      obtenerArchivos();
      cargaFormulario.reset();
    } else {
      alert('Error al subir el archivo');
    }
  } catch (error) {
    console.error('Error al subir el archivo:', error);
  }
});

// Funcion para eliminar el archivo
const eliminarArchivo = async filename => {
  try {
    const response = await fetch(`${BASE_URL}/eliminar/${filename}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Archivo eliminado con éxito');
      obtenerArchivos();
    } else {
      alert('Error al eliminar el archivo');
    }
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
  }
};

// Fetch files on page load
obtenerArchivos();
