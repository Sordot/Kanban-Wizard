import { useState } from 'react';
import { FaSearch, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { issueIcons, envIcons, priorityColors } from '../utils/helpers';
import CustomSelect from './CustomSelect';

// Notice we now accept the 'filters' object and a 'setFilters' function
export default function FilterBar({ filters, setFilters, uniqueAssignees, currentView, setCurrentView }) {

    // State to manage the mobile accordion toggle
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Helper to update a single property in our filter object
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearAllFilters = () => {
        setFilters({ text: '', priority: '', issueType: '', effort: '', environment: '', assignee: '' });
    };

    const hasActiveFilters = filters.text || filters.priority || filters.issueType || filters.effort || filters.environment || filters.assignee;

    // --- Format Options for Radix Select ---
    const assigneeOptions = [
        { value: "all", label: "All Assignees" }, // Radix Select requires non-empty string values
        ...uniqueAssignees.map(a => ({ value: a, label: `🧙‍♂️ ${a}` }))
    ];

    const priorityOptions = [
        { value: "all", label: "All Priorities", style: { color: 'var(--text-primary)' } },
        { value: "High", label: "High", style: { color: priorityColors.High } },
        { value: "Medium", label: "Medium", style: { color: priorityColors.Medium } },
        { value: "Low", label: "Low", style: { color: priorityColors.Low } },
    ];

    // Find the style of the currently active option
    const activePriorityStyle = priorityOptions.find(
        opt => opt.value === (filters.priority || "all")
    )?.style;

    const issueTypeOptions = [
        { value: "all", label: "All Types" },
        ...Object.entries(issueIcons).map(([label, icon]) => ({
            value: label,
            label: <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{icon} {label}</div>
        }))
    ];

    const envOptions = [
        { value: "all", label: "All Envs" },
        ...Object.entries(envIcons).map(([label, icon]) => ({
            value: label,
            label: <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{icon} {label}</div>
        }))
    ];

    // Helper to handle the "all" value which we use to represent an empty string in state
    const onSelectChange = (key, val) => handleFilterChange(key, val === "all" ? "" : val);

    return (
        <div className="filter-container">
            {/* Top row containing Switcher and the Mobile Toggle Button */}
            <div className="filter-top-row">
                <div className="view-switcher">
                    <button
                        className={`view-btn ${currentView === 'board' ? 'active' : ''}`}
                        onClick={() => setCurrentView('board')}
                    >
                        📋 Board
                    </button>
                    <button
                        className={`view-btn ${currentView === 'calendar' ? 'active' : ''}`}
                        onClick={() => setCurrentView('calendar')}
                    >
                        📅 Calendar
                    </button>
                </div>

                {/* Mobile Filter Toggle Button */}
                <button
                    className="mobile-filter-toggle"
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                >
                    <FaFilter />
                    {/* Shows a red dot if filters are active while collapsed */}
                    {hasActiveFilters && <span className="filter-badge"></span>}
                    {isMobileFiltersOpen ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {/* Filter Controls (Collapsible on Mobile) */}
            <div className={`filter-controls ${isMobileFiltersOpen ? 'open' : ''}`}>
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

                <CustomSelect
                    value={filters.assignee || "all"}
                    onValueChange={(val) => onSelectChange('assignee', val)}
                    options={assigneeOptions}
                    placeholder="All Assignees"
                    triggerClassName="filter-dropdown"
                />
                <CustomSelect
                    value={filters.priority || "all"}
                    onValueChange={(val) => onSelectChange('priority', val)}
                    options={priorityOptions}
                    placeholder="All Priorities"
                    triggerClassName="filter-dropdown"
                    triggerStyle={activePriorityStyle}
                />
                <CustomSelect
                    value={filters.issueType || "all"}
                    onValueChange={(val) => onSelectChange('issueType', val)}
                    options={issueTypeOptions}
                    placeholder="All Types"
                    triggerClassName="filter-dropdown"
                />
                <CustomSelect
                    value={filters.environment || "all"}
                    onValueChange={(val) => onSelectChange('environment', val)}
                    options={envOptions}
                    placeholder="All Envs"
                    triggerClassName="filter-dropdown"
                />
                {hasActiveFilters && (
                    <button
                        className="clear-filters-btn visible"
                        onClick={clearAllFilters}
                        aria-label="Clear all filters"
                    >
                        ❌
                    </button>
                )}
            </div>
        </div>
    );
}