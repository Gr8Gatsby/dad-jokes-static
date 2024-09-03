const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const favBtn = document.getElementById('favBtn');
const shareBtn = document.getElementById('shareBtn');
const favMenuIcon = document.getElementById('favMenuIcon');
const infoIcon = document.getElementById('infoIcon');
const explanationContainer = document.getElementById('explanationContainer');
const favoritesDropdown = document.getElementById('favoritesDropdown');
const favoritesList = document.getElementById('favorites-list');
const headlineElement = document.getElementById('headline');
const punchlineElement = document.getElementById('punchline');
const explanationElement = document.getElementById('explanation');
const jokeNumberElement = document.getElementById('jokeNumber');

let jokeCache = [];
let currentIndex = 0;
let favorites = loadFavorites(); // Load favorites from localStorage

// Load jokes from a JSON file
async function loadJokes() {
    try {
        const response = await fetch('jokes.json');
        const data = await response.json();
        jokeCache = data;
        displayJoke(jokeCache[currentIndex]);
        updateButtons();
    } catch (error) {
        console.error("Error loading jokes:", error);
        headlineElement.textContent = "Oops! Couldn't load jokes.";
        punchlineElement.textContent = "";
        explanationElement.textContent = "Please check the console for more details.";
    }
}

// Load favorites from localStorage
function loadFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Toggle favorites dropdown visibility
favMenuIcon.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the click from propagating to the document
    favoritesDropdown.classList.toggle('visible');
});

// Close favorites dropdown if clicking outside of it
document.addEventListener('click', (event) => {
    if (!favoritesDropdown.contains(event.target) && !favMenuIcon.contains(event.target)) {
        favoritesDropdown.classList.remove('visible');
    }
});

// Toggle explanation visibility
infoIcon.addEventListener('click', () => {
    explanationContainer.classList.toggle('expanded');
    if (explanationContainer.classList.contains('expanded')) {
        explanationContainer.style.display = 'block';
    } else {
        explanationContainer.style.display = 'none';
    }
});

// Display the joke and explanation
function displayJoke(jokeObj) {
    headlineElement.textContent = jokeObj.headline;
    punchlineElement.textContent = jokeObj.punchline;
    explanationElement.textContent = jokeObj.why_it_is_funny;
    jokeNumberElement.textContent = `Joke ${currentIndex + 1} of ${jokeCache.length}`;
    updateFavoriteStatus(jokeObj);
    explanationContainer.style.display = 'none'; // Reset explanation visibility
    explanationContainer.classList.remove('expanded'); // Ensure it's closed initially
}

// Update Favorite Status Icon
function updateFavoriteStatus(jokeObj) {
    const isFavorited = favorites.some(fav => fav.headline === jokeObj.headline && fav.punchline === jokeObj.punchline);
    if (isFavorited) {
        favBtn.classList.add('favorited');
        favBtn.textContent = '★'; // Solid star when favorited
    } else {
        favBtn.classList.remove('favorited');
        favBtn.textContent = '☆'; // Outline star when not favorited
    }
}

// Add or remove joke from favorites
favBtn.addEventListener('click', () => {
    const currentJoke = jokeCache[currentIndex];
    const isFavorited = favorites.some(fav => fav.headline === currentJoke.headline && fav.punchline === currentJoke.punchline);
    if (isFavorited) {
        favorites = favorites.filter(fav => fav.headline !== currentJoke.headline || fav.punchline !== currentJoke.punchline);
    } else {
        favorites.push(currentJoke);
    }
    updateFavoriteStatus(currentJoke);
    renderFavorites();
    saveFavorites(); // Save favorites to localStorage
});

// Render the favorites list
function renderFavorites() {
    favoritesList.innerHTML = '';
    favorites.forEach((fav, index) => {
        const li = document.createElement('li');
        li.textContent = truncateText(`${fav.headline} ${fav.punchline}`, 50);
        li.addEventListener('click', () => {
            currentIndex = jokeCache.findIndex(joke => joke.headline === fav.headline && joke.punchline === fav.punchline);
            displayJoke(fav);
            favoritesDropdown.classList.remove('visible'); // Close the dropdown after selecting a favorite
        });
        favoritesList.appendChild(li);
    });
}

// Truncate text to a specified length and add ellipses
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength - 3) + '...';
    }
    return text;
}

// Update buttons state
function updateButtons() {
    nextBtn.disabled = currentIndex >= jokeCache.length - 1;
    prevBtn.disabled = currentIndex <= 0;
}

// Event listeners for next and previous buttons
nextBtn.addEventListener('click', () => {
    if (currentIndex < jokeCache.length - 1) {
        currentIndex++;
        displayJoke(jokeCache[currentIndex]);
        updateButtons();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        displayJoke(jokeCache[currentIndex]);
        updateButtons();
    }
});

// Function to get query parameters
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let match;
    while (match = regex.exec(queryString)) {
        params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
    }
    return params;
}

// Function to load a specific joke by index
function loadJokeByIndex(index) {
    if (index >= 0 && index < jokeCache.length) {
        currentIndex = index;
        displayJoke(jokeCache[currentIndex]);
        updateButtons();
    } else {
        console.error('Invalid joke index:', index);
    }
}

// Check if the Web Share API is supported
if (navigator.share) {
    shareBtn.style.display = 'inline'; // Show the share button

    shareBtn.addEventListener('click', () => {
        const currentJoke = jokeCache[currentIndex];
        const shareUrl = `${window.location.origin}${window.location.pathname}?joke=${currentIndex}`;
        navigator.share({
            title: 'A funny dad joke for you!',
            text: `${currentJoke.headline} \n${currentJoke.punchline} \n\n${shareUrl}`
        }).catch((error) => console.error('Error sharing:', error));
    });
}

// Prevent touch events from causing scrolling
document.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

// Prevent double-tap to zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Initial load
loadJokes().then(() => {
    console.log('Jokes loaded:', jokeCache);
    const queryParams = getQueryParams();
    console.log('Query parameters:', queryParams);
    if (queryParams.joke) {
        const jokeIndex = parseInt(queryParams.joke, 10);
        console.log('Joke index:', jokeIndex);
        if (!isNaN(jokeIndex)) {
            loadJokeByIndex(jokeIndex);
        }
    }
    renderFavorites(); // Render favorites on initial load
});