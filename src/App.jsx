import React, { useEffect, useState, useRef } from 'react';
import MultiSelectnSearch from './components/MultiSelectnSearch';
import RecipeCard from './components/RecipeCard'; // Import RecipeCard
import RecipeModal from './components/RecipeModal'; // Import RecipeModal
import './styles/App.css'; // Custom styles if needed
import axios from 'axios';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [states_val, setStatesVal] = useState([]);
  const [minMaxEnabled, setMinMaxEnabled] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]); // To hold suggestions for search
  const [searchQuery, setSearchQuery] = useState(''); // To track search input
  const [isFocused, setIsFocused] = useState(false); // Track if the search input is focused
  const [sortBy, setSortBy] = useState('_score'); // Added "relevance" as default
  const [sortOrder, setSortOrder] = useState('asc');
  const [allOptions, setAllOptions] = useState([]);
  const [filtredOptions, setFiltredOptions] = useState([]);
  const initialRange = { min: 0, max: 99999999 };
  const [fatRange, setFatRange] = useState(initialRange);
  const [sodiumRange, setSodiumRange] = useState(initialRange);
  const [caloriesRange, setCaloriesRange] = useState(initialRange);
  const [proteinRange, setProteinRange] = useState(initialRange);
  const [rating, setRating] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [recipies, setRecipies] = useState([])
  const [pagesCount, setPagesCount] = useState(0)
  const [pageNo, setPageNo] = useState(1)
  const searchRef = useRef(null); 
  const [selectedRecipe, setSelectedRecipe] = useState(null); 


  const handleCardClick = (recipe) => {
    setSelectedRecipe(recipe); 
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null); 
  };

  const handleTitleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchTitles(query);
  };

  const onIngStateChange = (action, state) => {
    if (action === 'remove') {
      setStatesVal((prevStates) => prevStates.filter((item) => item !== state));
    } else if (action === 'add') {
      setStatesVal([...states_val, state]);
    }
  };

  const IngTextChange = (state) => {
    const updatedOptions = allOptions.filter((option) =>
      option.toLowerCase().includes(state.toLowerCase())
    );
    setFiltredOptions(updatedOptions);
  };

  const handleMinMaxChange = () => {
    setMinMaxEnabled(!minMaxEnabled);
  };

  const handleRangeChange = (nutrient, value, type) => {
    const newRange = { ...nutrient };
    newRange[type] = Math.min(Math.max(value, 0), 99999999);
    if (newRange.min <= newRange.max) {
      switch (nutrient) {
        case fatRange:
          setFatRange(newRange);
          break;
        case sodiumRange:
          setSodiumRange(newRange);
          break;
        case caloriesRange:
          setCaloriesRange(newRange);
          break;
        case proteinRange:
          setProteinRange(newRange);
          break;
        default:
          break;
      }
    }
  };

  const logAllFilters = () => {
    if (!isResetting) {
      console.log('Rating:', rating);
      console.log('Fat Range:', fatRange);
      console.log('Sodium Range:', sodiumRange);
      console.log('Calories Range:', caloriesRange);
      console.log('Protein Range:', proteinRange);
      console.log('Sort By:', sortBy);
      console.log('Sort Order:', sortOrder);
      console.log('Ingredients:', states_val);
      console.log('Search Query:', searchQuery);
      console.log('minMaxEnabled : ', minMaxEnabled);
    }
  };

  const handleSearch = () => {
    setIsResetting(true);
    setRating(0);
    setMinMaxEnabled(false);
    setFatRange(initialRange);
    setSodiumRange(initialRange);
    setCaloriesRange(initialRange);
    setProteinRange(initialRange);
    setSortBy('_score');
    setSortOrder('asc');
    setStatesVal([]);
    // setSearchQuery('');
    // setSearchSuggestions([]);
    setTimeout(() => setIsResetting(false), 0);
    getRecipies(1)


  };

  const getAllIngrediants = () => {
    axios
      .get('http://localhost/get_all_ingredients')
      .then((res) => {
        setAllOptions([...res.data.ingredients]);
        setFiltredOptions([...res.data.ingredients]);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const fetchTitles = async (state) => {
    try {
      const res = await axios.get(`http://localhost/get_relevant_titles?value=${state}`);
      setSearchSuggestions(res.data.titles); // Assuming the API returns an array of suggestions
    } catch (e) {
      console.log(e);
    }
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsFocused(false);
    }
  };

  const getRecipies = async (pageNo) => {
    setIsLoading(true)
    try {
      const res = await axios.post(`http://localhost/get_recipes`, {
        "dish_name": searchQuery,
        "ingredients": states_val,
        "ranges_apply": minMaxEnabled,
        "min_rating": rating,
        "sodium_range": [sodiumRange['min'], sodiumRange['max']],
        "fat_range": [fatRange['min'], fatRange['max']],
        "calories_range": [caloriesRange['min'], caloriesRange['max']],
        "protein_range": [proteinRange['min'], proteinRange['max']],
        "page": pageNo,
        "sortby": sortBy,
        "order": sortOrder
      })
      setRecipies([...res.data.data.data])
      setPagesCount(res.data.data.total_pages)
      setPageNo(res.data.data.page)
      setIsLoading(false)
    } catch (e) {
      console.log(e)
    }
  }


  useEffect(() => {
    const frontLoad = async () => {
      getAllIngrediants();
      await getRecipies();
      setIsLoading(false);
    }
    frontLoad()

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isResetting && !isLoading) {
      getRecipies(1)
    }
  }, [rating, fatRange, sodiumRange, caloriesRange, proteinRange, sortBy, sortOrder, states_val, minMaxEnabled]);

  return (
    <div>
      {isLoading && (
        <div className="loader-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className={isLoading ? 'content blur' : 'content'}>
        <header className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
          <h2>Rapidious Recipie</h2>
          <div ref={searchRef} className="position-relative w-50 d-flex">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleTitleSearchChange}
              onFocus={() => setIsFocused(true)}
            />
            <button className="btn btn-secondary ms-2" onClick={handleSearch}>
              Search
            </button>

            {/* Suggestions Dropdown */}
            {isFocused && searchSuggestions.length > 0 && (
              <ul className="suggestions-dropdown position-absolute w-100 list-group mt-5" style={{ zIndex: 1050 }}>
                {searchSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="list-group-item"
                    onClick={() => {
                      setSearchQuery(suggestion); // Update the searchQuery state
                      setIsFocused(false); // Close the suggestions dropdown

                      // Fetch titles or perform any other action with the selected suggestion
                      fetchTitles(suggestion);

                      // Log the suggestion to ensure it is recorded
                      console.log('Selected Suggestion:', suggestion);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        <div className="container-fluid mt-4">
          <div className="row">

            <div className="col-md-3">

              <label htmlFor="rating-filter">Rating</label>
              <select
                className="form-control mb-3"
                id="rating-filter"
                value={rating}
                onChange={(e) => {
                  setRating(e.target.value);
                }}
              >
                <option value={0}>All Ratings</option>
                <option value={1}>1 star & up</option>
                <option value={2}>2 stars & up</option>
                <option value={3}>3 stars & up</option>
                <option value={4}>4 stars & up</option>
              </select>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={minMaxEnabled}
                  onChange={handleMinMaxChange}
                />
                <label className="form-check-label">Enable Min-Max Filter</label>
              </div>


              {[
                { name: 'Fat', range: fatRange, setRange: setFatRange },
                { name: 'Sodium', range: sodiumRange, setRange: setSodiumRange },
                { name: 'Calories', range: caloriesRange, setRange: setCaloriesRange },
                { name: 'Protein', range: proteinRange, setRange: setProteinRange },
              ].map((nutrient, index) => (
                <div key={index} className="mb-3">
                  <label htmlFor={`${nutrient.name.toLowerCase()}-min-slider`}>{nutrient.name}</label>
                  <div className="d-flex align-items-center">
                    <input
                      type="number"
                      className="form-control me-2"
                      disabled={!minMaxEnabled}
                      value={nutrient.range.min}
                      onChange={(e) => handleRangeChange(nutrient.range, +e.target.value, 'min')}
                      min={0}
                      max={99999999}
                    />
                    <input
                      type="number"
                      className="form-control"
                      disabled={!minMaxEnabled}
                      value={nutrient.range.max}
                      onChange={(e) => handleRangeChange(nutrient.range, +e.target.value, 'max')}
                      min={0}
                      max={99999999}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-6">
              <div className="content-section">
                {recipies.length > 0 ? (
                  recipies.map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} onClick={() => handleCardClick(recipe)} />
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    height :'inherit',
                    margin: 'auto',
                    padding: '20px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '10px',
                    border: '1px solid #f5c6cb'
                  }}>
                    No Matching Recipes Found for these Filters
                  </div>
                )}

                {pagesCount > 1 && <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pageNo === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => {
                          if (pageNo > 1) {
                            setPageNo(pageNo - 1);
                            getRecipies(pageNo - 1);
                          }
                        }}
                        aria-disabled={pageNo === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {pagesCount > 1 && (
                      <>
                        {/* Always show the first page */}
                        <li className={`page-item ${pageNo === 1 ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              setPageNo(1);
                              getRecipies(1);
                            }}
                            style = {{zIndex : "0"}}
                          >
                            1
                          </button>
                        </li>

                        {/* Show ellipsis if current page is far from the start */}
                        {pageNo > 3 && <li className="page-item disabled"><span className="page-link">...</span></li>}

                        {/* Display a range of pages around the current page */}
                        {Array.from({ length: 5 }, (_, i) => {
                          const page = pageNo - 2 + i;
                          if (page > 1 && page < pagesCount) {
                            return (
                              <li key={page} className={`page-item ${pageNo === page ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => {
                                    setPageNo(page);
                                    getRecipies(page);
                                  }}
                                  style = {{zIndex : "0"}}
                                >
                                  {page}
                                </button>
                              </li>
                            );
                          }
                          return null;
                        })}

                        {/* Show ellipsis if current page is far from the end */}
                        {pageNo < pagesCount - 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}

                        {/* Always show the last page */}
                        {pagesCount > 1 && (
                          <li className={`page-item ${pageNo === pagesCount ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => {
                                setPageNo(pagesCount);
                                getRecipies(pagesCount);
                              }}
                              style = {{zIndex : "0"}}
                            >
                              {pagesCount}
                            </button>
                          </li>
                        )}
                      </>
                    )}

                    <li className={`page-item ${pageNo === pagesCount ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => {
                          if (pageNo < pagesCount) {
                            setPageNo(pageNo + 1);
                            getRecipies(pageNo + 1);
                          }
                        }}
                        aria-disabled={pageNo === pagesCount}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>}
              </div>
            </div>

            <div className="col-md-3">
              <div className="mb-3">
                <label htmlFor="sort-filter">Sort by</label>
                <select
                  className="form-control"
                  id="sort-filter"
                  value={sortBy}
                  onChange={e => {
                    setSortBy(e.target.value);
                  }}
                >
                  <option value="_score">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="fat">Fat</option>
                  <option value="calories">Calories</option>
                  <option value="protein">Protein</option>
                  <option value="sodium">Sodium</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="mb-3">
                <label htmlFor="order-filter">Order</label>
                <select
                  className="form-control"
                  id="order-filter"
                  value={sortOrder}
                  onChange={e => {
                    setSortOrder(e.target.value);
                  }}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <MultiSelectnSearch
                onchange={IngTextChange}
                id="Ingredients"
                states_val={states_val}
                allOptions={filtredOptions}
                onStateChange={onIngStateChange}
              />
            </div>


          </div>
        </div>
      </div>
      {
        selectedRecipe && (
          <RecipeModal recipe={selectedRecipe} onClose={handleCloseModal} />
        )
      }
    </div >
  );
};

export default App;
