export const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];
export const EFFORT_LEVELS = ["Small", "Medium", "Large", "X-Large"];

export const priorityColors = {
        High: 'var(--priority-high)',
        Medium: 'var(--priority-medium)',
        Low: 'var(--priority-low)'
    };

export const getNextPriority = (currentPriority) => {
  const currentIndex = PRIORITY_LEVELS.indexOf(currentPriority || 'Medium');
  return PRIORITY_LEVELS[(currentIndex + 1) % PRIORITY_LEVELS.length];
};

export const getNextEffort = (currentEffort) => {
  const currentIndex = EFFORT_LEVELS.indexOf(currentEffort);
  if (currentIndex === -1 || currentIndex === EFFORT_LEVELS.length - 1) {
    return EFFORT_LEVELS[0];
  }
  return EFFORT_LEVELS[currentIndex + 1];
};

export const issueIcons = {
  "User Story": "📜",
  "Bug": "🦠",
  "Test": "🔮",
  "Spike": "⌛"
};

export const envIcons = {
  "Dev": "🧙‍♂️",
  "QA": "🕵",
  "Staging": "🏗️",
  "Production": "🏰"
};