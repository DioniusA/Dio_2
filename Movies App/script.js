// API key and get DOM elements
const apiKey = '';
const searchInput = document.getElementById('search');
const movieGrid = document.getElementById('movie-grid');
const modal = document.getElementById('movie-modal');
const closeModal = document.getElementById('close-modal');
const watchlistGrid = document.getElementById('watchlist-grid');
const watchlistBtn = document.getElementById('watchlist-btn');

// Retrieve watchlist
let watchlistMovies = JSON.parse(localStorage.getItem('watchlist')) || [];
displayWatchlist();

// Search input 
searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 2) {
        searchMovies(searchInput.value);
    }
});

// Search movies 
async function searchMovies(query) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${apiKey}`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Display movie 
function displayMovies(movies) {
    movieGrid.innerHTML = movies.map(movie => {
        if (movie.poster_path) {
            return `
                <div class="movie-card" onclick="fetchMovieDetails(${movie.id})">
                    <h2>${movie.title}</h2>
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                    <p>Release Date: ${movie.release_date}</p>
                </div>
            `;
        } else {
            return '';
        }
    }).join('');
}

// Fetch movie 
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`);
        const movie = await response.json();
        showMovieModal(movie); 
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

// Display movie details 
function showMovieModal(movie) {
    document.getElementById('movie-title').innerText = movie.title || 'No title available';
    document.getElementById('movie-poster').src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'default-image-url.jpg';
    document.getElementById('movie-release-date').innerText = `Release Date: ${movie.release_date || 'N/A'}`;
    document.getElementById('movie-rating').innerText = `Rating: ${movie.vote_average || 'N/A'}`;
    document.getElementById('movie-synopsis').innerText = movie.overview || 'No synopsis available';
    document.getElementById('movie-cast').innerHTML = movie.credits.cast.slice(0, 5).map(member => `<li>${member.name} as ${member.character}</li>`).join('');
    watchlistBtn.onclick = () => addToWatchlist(movie);
    modal.style.display = 'flex';
}

// Add a movie 
function addToWatchlist(movie) {
    if (!watchlistMovies.some(watchlistMovie => watchlistMovie.id === movie.id)) {
        watchlistMovies.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlistMovies)); // Save to local storage
        displayWatchlist();
    } else {
        alert("This movie is already in your watchlist!");
    }
}

// Remove a movie 
function removeFromWatchlist(movieId) {
    watchlistMovies = watchlistMovies.filter(movie => movie.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlistMovies)); // Update local storage
    displayWatchlist(); 
}

// Display all watchlist movies 
function displayWatchlist() {
    watchlistGrid.innerHTML = watchlistMovies.map(movie => `
        <div class="watchlist-card">
            <h2>${movie.title}</h2>
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            <button onclick="removeFromWatchlist(${movie.id})">Remove</button>
        </div>
    `).join('');
}

// Close modal when 'X' button is clicked
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};


