import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Optional: Use icons for polish

export default function SearchBar({ value, onChange }) {

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // "Submit" the search by removing focus from the input
            e.target.blur();
        }
        if (e.key === 'Escape') {
            // Clear the search on Escape
            onChange('');
        }
    };

    return (
        <div className="search-container">
            <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search tasks or descriptions..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="search-input"
                />
                {value && (
                    <button className="clear-search" onClick={() => onChange('')}>
                        ❌
                    </button>
                )}
            </div>
        </div>
    );
}