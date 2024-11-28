  const cargaFormulario = document.getElementById('carga-formulario');
  const comicArchivo = document.getElementById('comic-archivo');
  const listaArchivos = document.getElementById('lista-archivos');
  const modal = document.getElementById('modal');
  const abrirModal = document.getElementById('abrir-modal');
  const cerrarModal = document.getElementById('cerrar-modal');
  const comicTitulo = document.getElementById('comic-titulo');
  const comicCategoria = document.getElementById('comic-categoria');

  // Base URL del backend
  const BASE_URL = 'http://localhost:3000';

  // Mostrar modal
  abrirModal.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Cerrar modal
  cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Cerrar modal al hacer clic fuera del contenido
  window.addEventListener('click', event => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Configuración global de PDFjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  // Función para obtener y mostrar archivos
  const obtenerArchivos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/archivos`);
      const data = await response.json();
      listaArchivos.innerHTML = '';

      data.archivos.forEach(file => {
        const card = document.createElement('div');
        card.className = 'card';

        const filename = `${BASE_URL}/uploads/${file.filename}`;
        const { titulo, categoria } = file;

        // Crear un contenedor para renderizar el PDF
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';
        canvasContainer.id = `canvas-container-${file}`; // ID único para cada contenedor
        
        // Información del cómic
        const info = document.createElement('div');
        info.innerHTML = `
          <h3>${titulo}</h3>
          <p>Categoría: ${categoria}</p>
        `;
        card.appendChild(info);
        card.appendChild(canvasContainer); // Línea nueva para agregar contenedor al card

        // Botones para ver, descargar y eliminar
        const links = document.createElement('div');
        links.innerHTML = `
          <a href="${filename}" target="_blank">Ver</a>
          <a href="${BASE_URL}/descarga/${file.filename}" download>Descarga</a>
              <button onclick="eliminarArchivo('${file.filename}')">Eliminar</button>
          </div>
        `;
        links.style.marginTop = '10px';
        card.appendChild(links);

        listaArchivos.appendChild(card);

        // Renderizar la primera página del PDF después de que el contenedor exista en el DOM
        setTimeout(() => {
          renderizarPDF(filename, canvasContainer.id);
        }, 0);

      });
    } catch (error) {
      console.error('Error al obtener archivos:', error);
    }
  };

  // Renderizar PDF en un canvas
  async function renderizarPDF(url, contenedorID) {
    try {
      // Contenedor donde se renderizarán las páginas
      const container = document.getElementById(contenedorID);
      if (!container) {
        throw new Error(`Contenedor con ID "${contenedorID}" no encontrado.`);
      }

      container.innerHTML = ''; // Limpiar contenedor previo

      // Cargar el documento PDF
      const pdf = await pdfjsLib.getDocument(url).promise;

      // Obtener la primera página específica
      const pagina = await pdf.getPage(1);

      // Calcular escala para ajustar al ancho del contenedor
      const escala = container.clientWidth / pagina.view[3];

      // Configurar el viewport
      const viewport = pagina.getViewport({ scale: escala });

      // Crear canvas para la página
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Configurar dimensiones del canvas
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Renderizar la página
      await pagina.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Agregar página al contenedor
      container.appendChild(canvas);

    } catch (error) {
      console.error('Error al renderizar PDF:', error);
    }
  }

  // Función para subir archivos
  cargaFormulario.addEventListener('submit', async event => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('comic', comicArchivo.files[0]);
    formData.append('titulo', comicTitulo.value);
    formData.append('categoria', comicCategoria.value);

    try {
      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Comic subido de manera exitosa');
        obtenerArchivos();
        cargaFormulario.reset();
      } else {
        alert('Error al subir el comic');
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

  // Expone función "Eliminar" globalmente
  window.eliminarArchivo = eliminarArchivo;

  // Obtiene archivos en la página cargada
  obtenerArchivos();