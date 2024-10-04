import React, { useRef, useState, useEffect } from 'react'
import '../styles/multiselect.css'

const MultiSelectnSearch = ({ onchange, id, states_val, allOptions, onStateChange }) => {
  const [showOptions, setShowOptions] = useState(false)
  const [inputWidth, setInputWidth] = useState(0)
  const optionsRef = useRef(null)
  const inputRef = useRef(null)
  const [searchText,setSearchText] = useState("")
  

  const filteredOptions = allOptions.filter(option => !states_val.includes(option))

  const handleSearchChange = async(e) => {
    setSearchText(e.target.value)
    onchange(e.target.value)
  }

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)) {
        setShowOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  
  useEffect(() => {
    if (inputRef.current) {
      setInputWidth(inputRef.current.offsetWidth)
    }
  }, [inputRef, showOptions])

  const handleFocus = () => {
    setShowOptions(true)
  }

  return (
    <div className='position-relative'>
      <div className='states-container mt-2 mb-1'>
        {states_val.map((state, index) => (
          <div
            key={index}
            className='states-item'
            onClick={() => onStateChange("remove", state)}
          >
            {state} <span className='close-btn'>✕</span>
          </div>
        ))}
      </div>

      <div className='rounded pb-2'>
        <input
          id={id}
          ref={inputRef}
          type='text'
          value={searchText}
          className='form-control'
          placeholder={`Search ${id}...`}
          onChange={handleSearchChange}
          onFocus={handleFocus}
        />
      </div>

      {showOptions && filteredOptions.length !== 0 && (
        <div
          className='dropdown-options rounded mt-2 position-absolute overflow-auto'
          ref={optionsRef}
          style={{ width: `${inputWidth}px`, zIndex: 1, maxHeight: '200px' }}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className='dropdown-item'
              onClick={() => onStateChange("add", option)} 
            >
              {option}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default MultiSelectnSearch
