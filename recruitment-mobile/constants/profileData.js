// recruitment-mobile/constants/profileData.js
// Profile form data constants

export const TECHNICAL_SKILLS = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Swift", 
  "Kotlin", "Rust", "Scala", "R", "MATLAB", "SQL", "HTML", "CSS",
  
  // Frontend
  "React", "React Native", "Vue.js", "Angular", "Next.js", "Svelte", "jQuery", "Bootstrap", 
  "Tailwind CSS", "Material-UI", "Redux", "MobX", "Webpack", "Vite",
  
  // Backend
  "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Laravel", 
  "Ruby on Rails", "Nest.js", "GraphQL", "REST API", "Microservices",
  
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Oracle", "SQL Server", 
  "DynamoDB", "Cassandra", "Firebase", "Supabase",
  
  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions", 
  "GitLab CI", "Terraform", "Ansible", "Linux", "Nginx", "Apache",
  
  // Mobile
  "iOS Development", "Android Development", "Flutter", "React Native", "Xamarin", "Ionic",
  
  // Data & AI
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy", 
  "Data Analysis", "Data Visualization", "Power BI", "Tableau", "Big Data", "Hadoop", "Spark",
  
  // Other
  "Git", "Agile", "Scrum", "Testing", "Unit Testing", "Jest", "Selenium", "Cypress", 
  "Security", "Blockchain", "Figma", "Adobe XD", "Photoshop"
];

export const SOFT_SKILLS = [
  "Communication", "Teamwork", "Leadership", "Problem Solving", "Critical Thinking",
  "Time Management", "Adaptability", "Creativity", "Work Ethic", "Attention to Detail",
  "Collaboration", "Emotional Intelligence", "Conflict Resolution", "Decision Making",
  "Presentation Skills", "Negotiation", "Customer Service", "Project Management",
  "Strategic Thinking", "Innovation", "Mentoring", "Active Listening", "Empathy",
  "Self-Motivation", "Flexibility", "Organization", "Analytical Skills", "Research",
  "Multitasking", "Interpersonal Skills"
];

export const DEGREE_TYPES = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree (BA)",
  "Bachelor's Degree (BS)",
  "Bachelor's Degree (BEng)",
  "Master's Degree (MA)",
  "Master's Degree (MS)",
  "Master's Degree (MBA)",
  "Master's Degree (MEng)",
  "Doctorate (PhD)",
  "Professional Degree",
  "Certificate",
  "Diploma"
];

export const EDUCATION_SPECIALIZATIONS = [
  // Engineering
  "Computer Science", "Software Engineering", "Computer Engineering", "Electrical Engineering",
  "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Aerospace Engineering",
  "Industrial Engineering", "Biomedical Engineering", "Environmental Engineering",
  
  // Business
  "Business Administration", "Finance", "Accounting", "Marketing", "Management",
  "Economics", "International Business", "Entrepreneurship", "Human Resources",
  
  // Sciences
  "Mathematics", "Physics", "Chemistry", "Biology", "Statistics", "Data Science",
  "Information Technology", "Cybersecurity",
  
  // Arts & Humanities
  "English", "Psychology", "Sociology", "Political Science", "History", "Philosophy",
  "Communications", "Journalism", "Graphic Design", "Fine Arts",
  
  // Health
  "Medicine", "Nursing", "Pharmacy", "Public Health", "Dentistry", "Physical Therapy",
  
  // Other
  "Architecture", "Law", "Education", "Social Work", "Hospitality Management"
];

export const UNIVERSITIES_BY_COUNTRY = {
  "Egypt": [
    "Cairo University", "American University in Cairo (AUC)", "Ain Shams University",
    "Alexandria University", "Helwan University", "Mansoura University", "Zagazig University",
    "Assiut University", "Tanta University", "Suez Canal University", "Benha University",
    "Minia University", "Fayoum University", "Beni-Suef University", "South Valley University",
    "German University in Cairo (GUC)", "British University in Egypt (BUE)",
    "Nile University", "Modern Sciences and Arts University (MSA)", "Misr University for Science and Technology",
    "Egyptian Russian University", "Arab Academy for Science, Technology and Maritime Transport"
  ],
  
  "UAE": [
    "United Arab Emirates University", "Khalifa University", "American University of Sharjah",
    "New York University Abu Dhabi", "University of Dubai", "Zayed University",
    "American University in Dubai", "Ajman University", "University of Sharjah",
    "Al Ain University", "Rochester Institute of Technology Dubai", "Heriot-Watt University Dubai"
  ],
  
  "Saudi Arabia": [
    "King Saud University", "King Abdulaziz University", "King Fahd University of Petroleum and Minerals",
    "King Abdullah University of Science and Technology", "Imam Abdulrahman Bin Faisal University",
    "Princess Nourah bint Abdulrahman University", "Umm Al-Qura University", "King Khalid University",
    "Taibah University", "Qassim University", "Jazan University", "Taif University"
  ],
  
  "Jordan": [
    "University of Jordan", "Jordan University of Science and Technology",
    "Yarmouk University", "Hashemite University", "Mu'tah University",
    "German Jordanian University", "Princess Sumaya University for Technology",
    "Al-Balqa Applied University", "Philadelphia University"
  ],
  
  "Lebanon": [
    "American University of Beirut", "Lebanese American University",
    "Saint Joseph University", "Lebanese University", "Notre Dame University",
    "Beirut Arab University", "Haigazian University"
  ],
  
  "Kuwait": [
    "Kuwait University", "Gulf University for Science and Technology",
    "American University of Kuwait", "American University of the Middle East",
    "Australian College of Kuwait", "Arab Open University - Kuwait"
  ],
  
  "Qatar": [
    "Qatar University", "Carnegie Mellon University in Qatar",
    "Northwestern University in Qatar", "Georgetown University in Qatar",
    "Texas A&M University at Qatar", "Weill Cornell Medicine - Qatar"
  ],
  
  "Bahrain": [
    "University of Bahrain", "Arabian Gulf University",
    "Ahlia University", "Applied Science University",
    "Royal University for Women", "Kingdom University"
  ],
  
  "Oman": [
    "Sultan Qaboos University", "German University of Technology in Oman",
    "Dhofar University", "Nizwa University", "Sohar University"
  ],
  
  "Iraq": [
    "University of Baghdad", "University of Basrah", "University of Mosul",
    "University of Kufa", "Al-Mustansiriya University", "University of Technology"
  ],
  
  "Palestine": [
    "Birzeit University", "An-Najah National University", "Islamic University of Gaza",
    "Bethlehem University", "Al-Quds University", "Hebron University"
  ],
  
  "Morocco": [
    "Mohammed V University", "Hassan II University", "Cadi Ayyad University",
    "Al Akhawayn University", "Ibn Tofail University"
  ],
  
  "Algeria": [
    "University of Algiers", "University of Constantine", "University of Oran",
    "University of Science and Technology Houari Boumediene"
  ],
  
  "Tunisia": [
    "University of Tunis", "University of Carthage", "University of Sfax",
    "University of Monastir"
  ],
  
  "Libya": [
    "University of Tripoli", "University of Benghazi", "Omar Al-Mukhtar University"
  ],
  
  "Sudan": [
    "University of Khartoum", "Sudan University of Science and Technology",
    "Ahfad University for Women", "Omdurman Islamic University"
  ],
  
  "Yemen": [
    "Sana'a University", "Aden University", "Taiz University", "Hadhramout University"
  ],
  
  "Syria": [
    "Damascus University", "Aleppo University", "Tishreen University", "University of Kalamoon"
  ],
  
  "Somalia": [
    "University of Somalia", "Mogadishu University", "Benadir University"
  ],
  
  "Mauritania": [
    "University of Nouakchott", "Chinguetti University of Modern Sciences"
  ],
  
  "Djibouti": [
    "University of Djibouti"
  ],
  
  "Comoros": [
    "University of Comoros"
  ]
};

export const CERTIFICATION_SPECIALIZATIONS = [
  "Software Development", "Data Science", "Cloud Computing", "Cybersecurity",
  "Project Management", "Business Analysis", "Digital Marketing", "UI/UX Design",
  "DevOps", "Machine Learning", "Artificial Intelligence", "Web Development",
  "Mobile Development", "Database Administration", "Network Administration",
  "Quality Assurance", "Agile & Scrum", "IT Support", "Blockchain", "IoT"
];

export const COURSE_SPECIALIZATIONS = [
  ...CERTIFICATION_SPECIALIZATIONS,
  "Programming Fundamentals", "Data Structures", "Algorithms", "System Design",
  "Operating Systems", "Computer Networks", "Software Architecture",
  "Frontend Development", "Backend Development", "Full Stack Development",
  "Game Development", "AR/VR Development", "API Development"
];