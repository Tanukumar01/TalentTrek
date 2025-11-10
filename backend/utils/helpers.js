// Helper function to extract skills from text
function extractSkillsFromText(text) {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'TypeScript',
    'Angular', 'Vue.js', 'Express', 'Django', 'Flask', 'Spring Boot',
    'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Machine Learning',
    'Data Science', 'DevOps', 'CI/CD', 'Agile', 'Scrum', 'Project Management'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills;
}

// Helper function to calculate match score between user skills and job skills
function calculateMatchScore(userSkills, jobSkills) {
  if (!userSkills.length || !jobSkills.length) return 0;
  
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
  
  const matchingSkills = userSkillsLower.filter(skill => 
    jobSkillsLower.includes(skill)
  );
  
  return matchingSkills.length / Math.max(userSkills.length, jobSkills.length);
}

module.exports = {
  extractSkillsFromText,
  calculateMatchScore
};
