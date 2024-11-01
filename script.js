// Datos de ejemplo de comics
const books = [
    {
        titulo: "Batman: El Regreso del Caballero Oscuro",
        autor: "Frank Miller",
        price: "$1987.99",
        cover: "caballero.jpg"
    },
    {
        titulo: "La Broma Asesina",
        autor: "Alan Moore",
        price: "$2400.99",
        cover: "broma.jpg"
    },
    {
        titulo: "Superman: Las Cuatro Estaciones",
        autor: "Jeph Loeb",
        price: "$3899",
        cover: "estaciones.jpg"
    },
    {
        titulo: "La Muerte de Superman",
        autor: "Dan Jurgens",
        price: "$5199",
        cover: "muerte_superman.jpg"
    },
    {
        titulo: "Muerte en La Familia",
        autor: "Miguel de Cervantes",
        price: "$4199",
        cover: "familia.jpg"
    }
];

// Función para mostrar los comics
function displayBooks(booksToShow) {
    const comicListaElementos = document.getElementById('booksList');
    comicListaElementos.innerHTML = '';

    booksToShow.forEach(comic => {
        const comicCard = document.createElement('div');
        comicCard.className = 'book-card';
        comicCard.innerHTML = `
            <div class="comic-cover">Portada de ${comic.titulo}</div>
            <h3 class="comic-titulo">${comic.titulo}</h3>
            <p class="comic-autor">${comic.autor}</p>
            <p class="comic-price">${comic.price}</p>
        `;
        comicListaElementos.appendChild(comicCard);
    });
}

// Función de búsqueda
function busquedaComics() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
    );
    displayBooks(filteredBooks);
}

// Mostrar todos los libros al cargar la página
window.onload = () => displayBooks(books);