import React from 'react';
import '../styles/RecipeModel.css'; 

const RecipeModal = ({ recipe, onClose }) => {
  if (!recipe) return null; 

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{recipe._source.title}</h2>

        {recipe._source.desc && recipe._source.desc !="" && (
          <p><strong>Description:</strong> {recipe._source.desc}</p>
        )}
        {recipe._source.directions && (
          <div className="directions-container">
            <strong>Directions:</strong>
            <div className="directions-list">
              {recipe._source.directions.map((step, index) => (
                <div key={index} className="direction-step">
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe._source.ingredients && (
          <div>
            <strong>Ingredients:</strong>
            <div className="ingredients-grid">
              {recipe._source.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  {ingredient}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="nutrition-info">
          {(
            <span className="nutrition-badge">Calories: {recipe._source.calories}</span>
          )}
          {(
            <span className="nutrition-badge">Fat: {recipe._source.fat}</span>
          )}
          {(
            <span className="nutrition-badge">Sodium: {recipe._source.sodium}</span>
          )}
          {(
            <span className="nutrition-badge">Protein: {recipe._source.protein}</span>
          )}
          {(
            <span className="nutrition-badge">Rating: {recipe._source.rating}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
