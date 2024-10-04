import React from 'react';

const RecipeCard = ({ recipe, onClick }) => {
  return (
    <div 
      className="card mb-3 shadow-sm" 
      onClick={onClick} 
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body">
        <h5 className="card-title">{recipe._source.title}</h5>
        <p className="card-text">
          {recipe._source.desc && recipe._source.desc.length > 100 
            ? `${recipe._source.desc.substring(0, 100)}...` 
            : recipe._source.desc}
        </p>
        <div 
          className="d-inline-block px-2 py-1 text-white" 
          style={{ backgroundColor: '#ffc107', borderRadius: '5px' }}
        >
          ⭐ {recipe._source.rating}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
