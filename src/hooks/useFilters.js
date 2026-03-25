import { useState, useMemo } from "react";

export const useFilters = (columns) => {

    const [filters, setFilters] = useState({
        text: '',
        priority: '',
        issueType: '',
        effort: '',
        environment: '',
        assignee: ''
    });

    // Check if any filters are active (i.e. if they arent empty strings)
    const hasActiveFilters = filters.text.trim() !== '' || filters.priority !== '' ||
        filters.issueType !== '' || filters.effort !== '' ||
        filters.environment !== '' || filters.assignee !== '';

    // DYNAMICALLY EXTRACT UNIQUE ASSIGNEES
    // This looks at all tasks and builds an alphabetical list of anyone assigned to a task
    const uniqueAssignees = useMemo(() => {
        const assignees = new Set();
        columns.forEach(col => {
            col.tasks.forEach(task => {
                if (task.assignee && task.assignee.trim() !== "") {
                    assignees.add(task.assignee.trim());
                }
            });
        });
        return Array.from(assignees).sort(); // Sort alphabetically for a clean dropdown
    }, [columns]);


    //Filter the columns based on user input and current filter dropdown states
    const filteredColumns = useMemo(() => {
        if (!hasActiveFilters) {
            return columns.map(col => ({
                ...col,
                tasks: col.tasks.map(task => ({ ...task, searchStatus: 'none' }))
            }));
        }

        const lowerSearch = filters.text.toLowerCase();

        return columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task => {
                const matchesText = !filters.text.trim() ||
                    (task.text && task.text.toLowerCase().includes(lowerSearch)) ||
                    (task.description && task.description.toLowerCase().includes(lowerSearch));

                const matchesPriority = !filters.priority || task.priority === filters.priority;
                const matchesIssueType = !filters.issueType || task.issueType === filters.issueType;
                const matchesEffort = !filters.effort || task.effort === filters.effort;
                const matchesEnvironment = !filters.environment || task.environment === filters.environment;

                // 3. Add the Assignee match check
                const matchesAssignee = !filters.assignee || task.assignee === filters.assignee;

                // 4. Require the assignee to match 
                const isMatch = matchesText && matchesPriority && matchesIssueType && matchesEffort && matchesEnvironment && matchesAssignee;

                return {
                    ...task,
                    searchStatus: isMatch ? 'matched' : 'obscured'
                };
            })
        }));
    }, [columns, filters, hasActiveFilters]);

    return {
        filters,
        setFilters,
        uniqueAssignees,
        filteredColumns
    }

}