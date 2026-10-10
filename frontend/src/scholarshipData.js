const scholarshipData = [
  {
    id: 1,
    name: "Post-Matric Scholarship Scheme for ST Students",
    provider: "Government of India — Maharashtra Tribal Development Department",
    level: "All Levels",
    portalType: "State",
    state: "Maharashtra",
    category: "ST",

    // Official MahaDBT scheme information
    incomeLimit: 250000,
    minimumIncome: null,

    // Exact eligible course names must be verified against scheme rules.
    eligibleCourses: [],

    courseCriteria:
      "For eligible post-matric studies. The course must satisfy the official scheme requirements.",

    description:
      "Financial assistance for eligible Scheduled Tribe students pursuing post-matric education.",

    eligibility:
      "For eligible ST students. The official Maharashtra scheme information lists annual family income up to ₹2,50,000. Other course, admission, document and scheme conditions apply.",

    deadline: "Check the official portal",
    link: "https://mahadbt.maharashtra.gov.in/",
  },

  {
    id: 2,
    name: "Pre-Matric Scholarship Opportunities for ST Students",
    provider: "Government Scholarship Programmes",
    level: "School",
    portalType: "National",
    state: "All",
    category: "ST",

    // Requirements vary by scheme and class.
    incomeLimit: null,
    minimumIncome: null,
    eligibleCourses: [],

    courseCriteria:
      "Check the eligible classes and educational requirements for the specific scheme.",

    description:
      "Explore school-level scholarship opportunities for eligible Scheduled Tribe students.",

    eligibility:
      "Eligibility, income limits, eligible classes and required documents depend on the specific scheme. Verify the current official guidelines.",

    deadline: "Check the official portal",
    link: "https://scholarships.gov.in/",
  },

  {
    id: 3,
    name: "MahaDBT Tuition Fee and Exam Fee Freeship for ST Students",
    provider: "Maharashtra Tribal Development Department",
    level: "All Levels",
    portalType: "State",
    state: "Maharashtra",
    category: "ST",

    // This scheme uses an income threshold above ₹2,50,000.
    incomeLimit: null,
    minimumIncome: 250000,
    eligibleCourses: [],

    courseCriteria:
      "The course and institution must meet the applicable official scheme requirements.",

    description:
      "Explore tuition fee and examination fee assistance for eligible ST students in Maharashtra.",

    eligibility:
      "The official scheme information describes this freeship for eligible ST students whose family annual income is above ₹2,50,000. Confirm the exact threshold interpretation and all other conditions on MahaDBT.",

    deadline: "Check the official portal",
    link: "https://mahadbt.maharashtra.gov.in/",
  },

  {
    id: 4,
    name: "National Scholarship Portal Opportunities",
    provider: "Government of India",
    level: "All Levels",
    portalType: "National",
    state: "All",
    category: "All",

    // This is a portal listing, not one individual scheme.
    incomeLimit: null,
    minimumIncome: null,
    eligibleCourses: [],

    courseCriteria:
      "Course requirements depend on the individual scholarship listed on the portal.",

    description:
      "Discover central and participating scholarship schemes through the National Scholarship Portal.",

    eligibility:
      "Every scholarship has its own eligibility rules, income limits, education requirements and deadlines. Check the individual scheme before applying.",

    deadline: "Check the official portal",
    link: "https://scholarships.gov.in/",
  },
];

export default scholarshipData;