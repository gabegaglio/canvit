// Idea bank with different categories
export const IDEA_BANK = [
  "Meeting Notes",
  "Project Ideas",
  "Team Goals",
  "Personal Goals",
  "Research Topics",
  "To-Do List",
  "Learning Plan",
  "Feedback Notes",
  "Design Concepts",
  "Reading List",
  "Questions",
  "Inspiration",
  "Brainstorm",
  "Workflow Process",
  "Marketing Campaign",
  "Weekly Goals",
  "Product Roadmap",
  "Client Feedback",
  "Future Plans",
  "Partnership Ideas",
];

/**
 * Returns a random idea from the idea bank
 * @returns string A randomly selected idea
 */
export const getRandomIdea = (): string => {
  // Get a random index
  const randomIndex = Math.floor(Math.random() * IDEA_BANK.length);
  return IDEA_BANK[randomIndex];
};
