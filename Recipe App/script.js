// API Key and DOM elements
const apiKey = '';
const searchInput = document.getElementById('search');           
const recipeGrid = document.getElementById('recipe-grid');       
const modal = document.getElementById('recipe-modal');           
const closeModal = document.getElementById('close-modal');       
const favoritesGrid = document.getElementById('favorites-grid'); 
const favoriteBtn = document.getElementById('favorite-btn');     

// Retrieve favorite 
let favoriteRecipes = JSON.parse(localStorage.getItem('favorites')) || [];  
displayFavorites();

// Max favorites
const MAX_FAVORITES = 10;

// Search input
searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 2) {
        performSearch(searchInput.value);
    }
});

// Fetch recipes 
async function performSearch(query) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
        const data = await response.json();
        console.log('Recipe search results:', data.results); 
        displayRecipes(data.results); 
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

// Display recipes
function displayRecipes(recipes) {
    recipeGrid.innerHTML = recipes.map(recipe => {
        if (recipe.image) {
            return `
                <div class="recipe-card" onclick="fetchRecipeDetails(${recipe.id})">
                    <h2>${recipe.title}</h2>
                    <img src="${recipe.image}" alt="${recipe.title}">
                </div>
            `;
        } else {
            return '';
        }
    }).join('');
}

// Fetch details 
async function fetchRecipeDetails(recipeId) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=true`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const recipe = await response.json();
        console.log('Fetched recipe details:', recipe); // Log to inspect the response
        showRecipeModal(recipe); 
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}

// Display details 
function showRecipeModal(recipe) {
    document.getElementById('recipe-title').innerText = recipe.title || 'No title available';
    document.getElementById('recipe-image').src = recipe.image || 'default-image-url.jpg'; 

    const prepTimeText = recipe.readyInMinutes ? `Preparation time: ${recipe.readyInMinutes} mins` : 'Preparation time: N/A';
    document.getElementById('recipe-prep-time').innerText = prepTimeText;

    document.getElementById('recipe-ingredients').innerHTML = recipe.extendedIngredients
        ? recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')
        : '<li>No ingredients available</li>';

    const nutrients = recipe.nutrition?.nutrients || [];
    const calories = nutrients.find(n => n.name.toLowerCase() === 'calories')?.amount || 'N/A';
    const protein = nutrients.find(n => n.name.toLowerCase() === 'protein')?.amount || 'N/A';
    const fat = nutrients.find(n => n.name.toLowerCase() === 'fat')?.amount || 'N/A';

    // Check if all nutritional values are 'N/A' and display appropriate message
    if (calories === 'N/A' && protein === 'N/A' && fat === 'N/A') {
        document.getElementById('recipe-nutrition').innerHTML = '<p>Nutritional information not available for this recipe.</p>';
    } else {
        document.getElementById('recipe-nutrition').innerHTML = `
            <p>Calories: ${calories} kcal</p>
            <p>Protein: ${protein} g</p>
            <p>Fat: ${fat} g</p>
        `;
    }

    document.getElementById('recipe-instructions').innerHTML = recipe.instructions || 'No instructions available';

    favoriteBtn.onclick = () => addToFavorites(recipe);

    modal.style.display = 'flex';
}

// Add a recipe to the favorites list
function addToFavorites(recipe) {
    if (favoriteRecipes.length >= MAX_FAVORITES) {
        alert('Maximum number of favorites reached. Please remove a favorite before adding a new one.');
        return;
    }
    if (!favoriteRecipes.some(fav => fav.id === recipe.id)) {
        favoriteRecipes.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favoriteRecipes));
        displayFavorites(); 
    }
}

// Remove a recipe from the favorites
function removeFromFavorites(recipeId) {
    favoriteRecipes = favoriteRecipes.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem('favorites', JSON.stringify(favoriteRecipes));
    displayFavorites();
}

// Display all favorite recipes
function displayFavorites() {
    favoritesGrid.innerHTML = favoriteRecipes.map(recipe => {
        const prepTime = recipe.readyInMinutes ? `${recipe.readyInMinutes} mins` : '';
        return `
            <div class="favorite-card">
                <h2>${recipe.title}</h2>
                <img src="${recipe.image}" alt="${recipe.title}">
                ${prepTime ? `<p>Preparation time: ${prepTime}</p>` : ''}
                <button onclick="removeFromFavorites(${recipe.id})">Remove</button>
            </div>
        `;
    }).join('');
}

// Close modal when close button is clicked
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal if user clicks outside of it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
