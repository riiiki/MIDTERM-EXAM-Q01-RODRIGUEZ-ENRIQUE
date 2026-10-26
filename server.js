const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const normalizeRecipeIds = (recipes) => {
  const normalized = recipes.map((recipe, index) => ({
    ...recipe,
    id: String(index + 1)
  }));

  return normalized;
};

const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const recipes = JSON.parse(data);
    const normalizedRecipes = normalizeRecipeIds(recipes);

    if (JSON.stringify(recipes) !== JSON.stringify(normalizedRecipes)) {
      writeData(normalizedRecipes);
    }

    return normalizedRecipes;
  } catch (error) {
    return [];
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

const getNextId = (recipes) => {
  if (!recipes.length) return 1;
  const ids = recipes
    .map(recipe => Number(recipe.id))
    .filter(id => Number.isInteger(id));

  return ids.length ? Math.max(...ids) + 1 : 1;
};

app.get('/api/recipes', (req, res) => {
  try {
    const recipes = readData();
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve recipes.' });
  }
});

app.get('/api/recipes/:id', (req, res) => {
  try {
    const recipes = readData();
    const recipe = recipes.find(r => r.id === req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }
    
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve recipe.' });
  }
});

app.post('/api/recipes', (req, res) => {
  try {
    const { name, category, prep_time, difficulty } = req.body;
    
    if (!name || !category || prep_time === undefined || !difficulty) {
      return res.status(400).json({ error: 'All fields (name, category, prep_time, difficulty) are required.' });
    }

    const numericPrepTime = Number(prep_time);
    if (isNaN(numericPrepTime) || numericPrepTime <= 0) {
      return res.status(400).json({ error: 'Preparation time must be a number greater than 0.' });
    }

    const recipes = readData();
    const newRecipe = {
      id: getNextId(recipes).toString(),
      name,
      category,
      prep_time: numericPrepTime,
      difficulty
    };

    recipes.push(newRecipe);
    writeData(recipes);

    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recipe.' });
  }
});

app.delete('/api/recipes/:id', (req, res) => {
  try {
    const recipes = readData();
    const index = recipes.findIndex(r => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    const deletedRecipe = recipes.splice(index, 1)[0];
    writeData(recipes);

    res.status(200).json({ message: 'Recipe successfully deleted.', deletedRecipe });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recipe.' });
  }
});

app.listen(PORT, () => {
  console.log(`Recipe API running on http://localhost:${PORT}`);
});