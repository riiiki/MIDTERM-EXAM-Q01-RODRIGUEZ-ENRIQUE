# MIDTERM-EXAM-Q01-RODRIGUEZ-ENRIQUE
## Recipe Management System
Create a Recipe Management System.

Data Fields
id

name

category

prep_time

difficulty

Requirements
prep_time must be greater than 0.

Reject a POST request if preparation time is 0 or negative.

Display the preparation time with the word minutes.

Display all recipes.

Allow users to retrieve and delete a recipe by ID.

Required API
GET    /api/recipes
GET    /api/recipes/:id
POST   /api/recipes
DELETE /api/recipes/:id
