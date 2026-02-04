// recruitment-mobile/constants/filterData.js
// Create this file with all filter options

export const WORKPLACE_OPTIONS = [
  { label: 'Onsite', value: 'onsite' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Remote', value: 'remote' },
];

export const ARAB_COUNTRIES = [
  { label: 'Egypt', value: 'Egypt' },
  { label: 'Saudi Arabia', value: 'Saudi Arabia' },
  { label: 'United Arab Emirates', value: 'UAE' },
  { label: 'Kuwait', value: 'Kuwait' },
  { label: 'Qatar', value: 'Qatar' },
  { label: 'Bahrain', value: 'Bahrain' },
  { label: 'Oman', value: 'Oman' },
  { label: 'Jordan', value: 'Jordan' },
  { label: 'Lebanon', value: 'Lebanon' },
  { label: 'Iraq', value: 'Iraq' },
  { label: 'Syria', value: 'Syria' },
  { label: 'Yemen', value: 'Yemen' },
  { label: 'Palestine', value: 'Palestine' },
  { label: 'Morocco', value: 'Morocco' },
  { label: 'Algeria', value: 'Algeria' },
  { label: 'Tunisia', value: 'Tunisia' },
  { label: 'Libya', value: 'Libya' },
  { label: 'Sudan', value: 'Sudan' },
  { label: 'Somalia', value: 'Somalia' },
  { label: 'Mauritania', value: 'Mauritania' },
  { label: 'Djibouti', value: 'Djibouti' },
  { label: 'Comoros', value: 'Comoros' },
];

export const CITIES_BY_COUNTRY = {
  'Egypt': [
    { label: 'Cairo', value: 'Cairo' },
    { label: 'Alexandria', value: 'Alexandria' },
    { label: 'Giza', value: 'Giza' },
    { label: 'Sharm El-Sheikh', value: 'Sharm El-Sheikh' },
    { label: 'Hurghada', value: 'Hurghada' },
    { label: 'Luxor', value: 'Luxor' },
    { label: 'Aswan', value: 'Aswan' },
    { label: 'Port Said', value: 'Port Said' },
    { label: 'Suez', value: 'Suez' },
    { label: 'Mansoura', value: 'Mansoura' },
  ],
  'Saudi Arabia': [
    { label: 'Riyadh', value: 'Riyadh' },
    { label: 'Jeddah', value: 'Jeddah' },
    { label: 'Mecca', value: 'Mecca' },
    { label: 'Medina', value: 'Medina' },
    { label: 'Dammam', value: 'Dammam' },
    { label: 'Khobar', value: 'Khobar' },
    { label: 'Dhahran', value: 'Dhahran' },
    { label: 'Taif', value: 'Taif' },
    { label: 'Tabuk', value: 'Tabuk' },
    { label: 'Abha', value: 'Abha' },
  ],
  'UAE': [
    { label: 'Dubai', value: 'Dubai' },
    { label: 'Abu Dhabi', value: 'Abu Dhabi' },
    { label: 'Sharjah', value: 'Sharjah' },
    { label: 'Ajman', value: 'Ajman' },
    { label: 'Ras Al Khaimah', value: 'Ras Al Khaimah' },
    { label: 'Fujairah', value: 'Fujairah' },
    { label: 'Umm Al Quwain', value: 'Umm Al Quwain' },
    { label: 'Al Ain', value: 'Al Ain' },
  ],
  'Kuwait': [
    { label: 'Kuwait City', value: 'Kuwait City' },
    { label: 'Hawalli', value: 'Hawalli' },
    { label: 'Salmiya', value: 'Salmiya' },
    { label: 'Farwaniya', value: 'Farwaniya' },
    { label: 'Ahmadi', value: 'Ahmadi' },
  ],
  'Qatar': [
    { label: 'Doha', value: 'Doha' },
    { label: 'Al Wakrah', value: 'Al Wakrah' },
    { label: 'Al Rayyan', value: 'Al Rayyan' },
    { label: 'Umm Salal', value: 'Umm Salal' },
  ],
  'Jordan': [
    { label: 'Amman', value: 'Amman' },
    { label: 'Zarqa', value: 'Zarqa' },
    { label: 'Irbid', value: 'Irbid' },
    { label: 'Aqaba', value: 'Aqaba' },
    { label: 'Petra', value: 'Petra' },
  ],
  'Lebanon': [
    { label: 'Beirut', value: 'Beirut' },
    { label: 'Tripoli', value: 'Tripoli' },
    { label: 'Sidon', value: 'Sidon' },
    { label: 'Tyre', value: 'Tyre' },
  ],
};

export const CAREER_LEVELS = [
  { label: 'Junior', value: 'Junior' },
  { label: 'Mid-Senior', value: 'Mid-Senior' },
  { label: 'Senior', value: 'Senior' },
  { label: 'Team Leader/Supervisor', value: 'Team Leader' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Senior Manager', value: 'Senior Manager' },
  { label: 'Executive', value: 'Executive' },
];

export const JOB_CATEGORIES = [
  { label: 'Software Development', value: 'Software Development' },
  { label: 'Data Science', value: 'Data Science' },
  { label: 'Product Management', value: 'Product Management' },
  { label: 'Design', value: 'Design' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Customer Success', value: 'Customer Success' },
  { label: 'Human Resources', value: 'Human Resources' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Business Development', value: 'Business Development' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'DevOps', value: 'DevOps' },
  { label: 'Quality Assurance', value: 'Quality Assurance' },
  { label: 'IT Support', value: 'IT Support' },
  { label: 'Cybersecurity', value: 'Cybersecurity' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Education', value: 'Education' },
  { label: 'Consulting', value: 'Consulting' },
];

export const JOB_TYPES = [
  { label: 'Full-Time', value: 'Full-Time' },
  { label: 'Part-Time', value: 'Part-Time' },
  { label: 'Freelance', value: 'Freelance' },
];

export const DATE_POSTED_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'Last 2 Weeks', value: '2weeks' },
  { label: 'Last Month', value: 'month' },
  { label: 'More than a Month', value: 'all' },
];