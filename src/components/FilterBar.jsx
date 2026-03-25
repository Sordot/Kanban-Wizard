import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { issueIcons, envIcons, priorityColors } from '../utils/helpers';

// Notice we now accept the 'filters' object and a 'setFilters' function
export default function FilterBar({ filters, setFilters, uniqueAssignees }) {

    // Helper to update a single property in our filter object
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearAllFilters = () => {
        setFilters({ text: '', priority: '', issueType: '', effort: '', environment: '', assignee: '' });
    };

    const hasActiveFilters = filters.text || filters.priority || filters.issueType || filters.effort || filters.environment || filters.assignee;

    return (
        <div className="filter-container">

            {/* The Original Text Search */}
            <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Filter for tasks..."
                    value={filters.text}
                    onChange={(e) => handleFilterChange('text', e.target.value)}
                    className="search-input"
                />
            </div>

            {/* 👇 The Dynamic Assignee (Wizards) Dropdown */}
            <select
                className="filter-dropdown"
                value={filters.assignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
            >
                <option value="">All Assignees</option>
                {/* Map over the unique assignees to generate the options */}
                {uniqueAssignees.map(assignee => (
                    <option key={assignee} value={assignee}>
                        🧙‍♂️ {assignee}
                    </option>
                ))}
            </select>

            {/* Advanced "Scrying" Selectors */}
            <select
                className="filter-dropdown"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                style={{ color: priorityColors[filters.priority] || 'var(--text-primary)' }}
            >
                {/* 3. Explicitly setting inherit on the default option so it doesn't grab the select's color it is reset */}
                <option value="" style={{ color: 'var(--text-primary)' }}>All Priorities</option>
                <option value="High" style={{ color: priorityColors.High }}>High Priority</option>
                <option value="Medium" style={{ color: priorityColors.Medium }}>Medium Priority</option>
                <option value="Low" style={{ color: priorityColors.Low }}>Low Priority</option>
            </select>

            <select
                className="filter-dropdown"
                value={filters.issueType}
                onChange={(e) => handleFilterChange('issueType', e.target.value)}
            >
                <option value="">All Types</option>
                {Object.entries(issueIcons).map(([label, icon]) => (
                    <option key={label} value={label}>
                        {icon} {label}
                    </option>
                ))}
            </select>

            <select
                className="filter-dropdown"
                value={filters.environment}
                onChange={(e) => handleFilterChange('environment', e.target.value)}
            >
                <option value="">All Envs</option>
                {Object.entries(envIcons).map(([label, icon]) => (
                    <option key={label} value={label}>
                        {icon} {label}
                    </option>
                ))}
            </select>

            <button
                className={`clear-filters-btn ${hasActiveFilters ? 'visible' : ''}`}
                onClick={clearAllFilters}
                aria-label="Clear all filters"
            >
                ❌
            </button>
        </div>
    );
}