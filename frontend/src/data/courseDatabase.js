// =============================================================================
// courseDatabase.js
// -----------------------------------------------------------------------------
// IMPORTANT NOTE ON DATA INTEGRITY (please read before adding more entries):
// Every `url` below is either:
//   1) A specific YouTube video/playlist that was verified to actually exist, or
//   2) An official channel's real handle (safe to link to — these never 404,
//      and honestly represent "this channel teaches this topic" rather than
//      claiming a specific unverified video ID).
// We deliberately do NOT invent random youtube.com/watch?v=xxxxxxxx IDs.
// See the bottom of this file for how to safely keep growing this list.
// =============================================================================

export const courseCategories = [
  {
    name: "Computer Science & IT",
    subCategories: [
      "Programming Fundamentals", "C Programming", "C++", "Java", "Python",
      "JavaScript", "TypeScript", "Data Structures", "Algorithms",
      "Competitive Programming", "Web Development", "HTML & CSS", "React",
      "Next.js", "Node.js", "Full Stack Development", "Databases", "SQL",
      "MongoDB", "Git & GitHub", "DevOps", "Docker", "Cloud Computing", "AWS",
      "Linux", "Operating Systems", "Computer Networks", "Software Engineering",
      "System Design", "Artificial Intelligence", "Machine Learning",
      "Deep Learning", "Generative AI", "NLP", "Computer Vision",
      "Data Science", "Data Analytics", "Cyber Security", "Ethical Hacking",
      "Blockchain", "Mobile App Development", "Android Development", "Flutter",
      "UI/UX", "Software Testing", "Career & Interview Preparation"
    ]
  },
  {
    name: "Engineering",
    subCategories: [
      "Electronics & Circuits", "Electronics & Communication",
      "Electrical Engineering", "Mechanical", "Civil", "Chemical Engineering",
      "Robotics", "Engineering Drawing", "Engineering Mathematics",
      "Thermodynamics", "Fluid Mechanics", "Strength of Materials",
      "Control Systems", "Signals & Systems", "Digital Electronics",
      "Analog Electronics", "Microprocessors", "Embedded Systems", "VLSI",
      "Power Systems", "Network Theory", "Structural Engineering", "Surveying"
    ]
  },
  {
    name: "Mathematics",
    subCategories: [
      "Basic Mathematics", "Algebra", "Geometry", "Trigonometry",
      "Coordinate Geometry", "Calculus", "Differential Equations",
      "Linear Algebra", "Probability", "Statistics", "Discrete Mathematics",
      "Engineering Mathematics", "Quantitative Aptitude"
    ]
  },
  {
    name: "Physics",
    subCategories: [
      "Mechanics", "Gravitation", "Thermodynamics", "Waves & Oscillations",
      "Optics", "Electromagnetism", "Current Electricity", "Magnetism",
      "Modern Physics", "Semiconductor Physics", "Engineering Physics"
    ]
  },
  {
    name: "Chemistry",
    subCategories: [
      "Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry",
      "Chemical Bonding", "Equilibrium", "Electrochemistry",
      "Engineering Chemistry"
    ]
  },
  {
    name: "Competitive Exams",
    subCategories: [
      "JEE", "NEET", "GATE", "UPSC", "SSC", "Banking", "CAT", "CUET",
      "UGC NET", "Aptitude", "Logical Reasoning", "Current Affairs"
    ]
  },
  {
    name: "School Education",
    subCategories: [
      "Class 9", "Class 10", "Class 11", "Class 12", "CBSE Mathematics",
      "CBSE Science", "CBSE Physics", "CBSE Chemistry", "CBSE Biology",
      "English Grammar"
    ]
  },
  {
    name: "Business & Management",
    subCategories: [
      "Business Fundamentals", "Entrepreneurship", "Digital Marketing",
      "Finance", "Accounting", "Business Analytics", "Project Management",
      "Startup Building"
    ]
  },
  {
    name: "Career & Employability",
    subCategories: [
      "Resume Building", "Interview Preparation", "Spoken English",
      "Public Speaking", "Soft Skills", "LinkedIn & Freelancing",
      "Job Preparation"
    ]
  },
  {
    name: "Design & Creative Skills",
    subCategories: [
      "Graphic Design", "Figma", "UI Design", "Video Editing",
      "After Effects", "Photography", "Content Creation"
    ]
  },
  {
    name: "AI & Future Skills",
    subCategories: [
      "Generative AI", "Prompt Engineering", "AI Agents", "LLMs & RAG",
      "AI for Students", "AI Tools"
    ]
  }
];

// -----------------------------------------------------------------------------
// Verified official channel handles used throughout this file. Linking to a
// channel's /playlists page is always a real, working URL (never fabricated).
// -----------------------------------------------------------------------------
const CH = {
  apnaCollege: "https://www.youtube.com/@ApnaCollegeOfficial",
  codeWithHarry: "https://www.youtube.com/@CodeWithHarry",
  freeCodeCamp: "https://www.youtube.com/@freecodecamp",
  gateSmashers: "https://www.youtube.com/@GateSmashers",
  jennysLectures: "https://www.youtube.com/@JennyslecturesCSIT",
  physicsWallah: "https://www.youtube.com/@PhysicsWallah",
  khanAcademy: "https://www.youtube.com/@khanacademy",
  mitOCW: "https://www.youtube.com/@mitocw",
  nptel: "https://www.youtube.com/@nptelhrd",
  takeUforward: "https://www.youtube.com/@takeUforward",
  loveBabbar: "https://www.youtube.com/@LoveBabbar",
  simplilearn: "https://www.youtube.com/@SimplilearnOfficial",
  stanfordOnline: "https://www.youtube.com/@stanfordonline",
};

import { generatedCourses } from "./generatedCourses";

const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
// Generic neutral placeholder thumbnail for channel-level (non-video-specific)
// entries, since there is no single verified video thumbnail to show.
// null = "no real thumbnail for this one" — Explore.jsx renders a guaranteed
// CSS gradient placeholder for these instead of trying (and risking failure
// on) any image URL at all.
const channelThumb = null;

// Maine top global courses curate kiye hain (MIT, NPTEL, Stanford, FreeCodeCamp)
// These are the hand-picked, individually-verified exact videos/playlists.
export const curatedCourses = [
  // ============================ EXISTING (UNCHANGED) =======================
  {
    id: "e1",
    title: "Basic Circuit Analysis (Full Course)",
    instructor: "NPTEL / IIT",
    thumbnail: "https://img.youtube.com/vi/31yIGAUSCwo/hqdefault.jpg",
    url: "https://youtube.com/watch?v=31yIGAUSCwo",
    category: "Engineering",
    subCategory: "Electronics & Circuits",
    level: "Beginner"
  },
  {
    id: "e2",
    title: "MIT 6.002 Circuits and Electronics",
    instructor: "MIT OpenCourseWare",
    thumbnail: "https://img.youtube.com/vi/w82aSjLuD_8/hqdefault.jpg",
    url: "https://youtube.com/watch?v=w82aSjLuD_8",
    category: "Engineering",
    subCategory: "Electronics & Circuits",
    level: "Advanced"
  },
  {
    id: "cs1",
    title: "Stanford CS229: Machine Learning",
    instructor: "Andrew Ng",
    thumbnail: "https://img.youtube.com/vi/jGwO_UgTS7I/hqdefault.jpg",
    url: "https://youtube.com/watch?v=jGwO_UgTS7I",
    category: "Computer Science",
    subCategory: "Artificial Intelligence",
    level: "Advanced"
  },
  {
    id: "cs2",
    title: "Generative AI for Beginners",
    instructor: "Google Cloud",
    thumbnail: "https://img.youtube.com/vi/G2fqAlgmoPo/hqdefault.jpg",
    url: "https://youtube.com/watch?v=G2fqAlgmoPo",
    category: "Computer Science",
    subCategory: "Artificial Intelligence",
    level: "Beginner"
  },
  {
    id: "cs3",
    title: "React JS - Full Course for Beginners",
    instructor: "FreeCodeCamp",
    thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
    url: "https://youtube.com/watch?v=bMknfKXIFA8",
    category: "Computer Science",
    subCategory: "Web Development",
    level: "Beginner"
  },
  {
    id: "s1",
    title: "Fundamentals of Physics",
    instructor: "Yale University",
    thumbnail: "https://img.youtube.com/vi/0jEUMqwovHM/hqdefault.jpg",
    url: "https://youtube.com/watch?v=0jEUMqwovHM",
    category: "Core Sciences",
    subCategory: "Physics",
    level: "Intermediate"
  },

  // ============================ INDIVIDUALLY VERIFIED =======================
  {
    id: "cs-python-001",
    title: "Learn Python - Full Course for Beginners [Tutorial]",
    instructor: "freeCodeCamp.org (Mike Dane)",
    thumbnail: thumb("rfscVS0vtbw"),
    url: "https://youtube.com/watch?v=rfscVS0vtbw",
    category: "Computer Science & IT",
    subCategory: "Python",
    level: "Beginner",
    language: "English",
    type: "Full Course",
    duration: "4h 26m",
    description: "Complete beginner introduction to core Python concepts with hands-on mini projects.",
    skills: ["Python", "Programming Basics"],
    tags: ["python", "beginner", "programming", "freecodecamp"],
    platform: "YouTube",
    isPlaylist: false,
    featured: true
  },
  {
    id: "cs-java-apnacollege-001",
    title: "Java + DSA Course for Placements (Full Playlist)",
    instructor: "Apna College",
    thumbnail: channelThumb,
    url: "https://youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop",
    category: "Computer Science & IT",
    subCategory: "Java",
    level: "Beginner",
    language: "Hinglish",
    type: "Playlist",
    duration: "100+ hours",
    description: "Java language fundamentals through Data Structures & Algorithms, taught in Hinglish for placement preparation.",
    skills: ["Java", "DSA", "Problem Solving"],
    tags: ["java", "dsa", "hinglish", "placement", "apna college"],
    platform: "YouTube",
    isPlaylist: true,
    featured: true
  },
  {
    id: "cs-java-apnacollege-002",
    title: "Introduction to Java Language | Complete Placement Course (Lecture 1)",
    instructor: "Apna College",
    thumbnail: thumb("yRpLlJmRo2w"),
    url: "https://youtube.com/watch?v=yRpLlJmRo2w",
    category: "Computer Science & IT",
    subCategory: "Java",
    level: "Beginner",
    language: "Hinglish",
    type: "Lecture",
    duration: "1h",
    description: "First lecture of the Apna College Java placement series, covering Java basics and setup.",
    skills: ["Java"],
    tags: ["java", "hinglish", "beginner"],
    platform: "YouTube",
    isPlaylist: false,
    featured: false
  },
  {
    id: "cs-java-apnacollege-003",
    title: "Variables in Java | Input Output | Complete Placement Course (Lecture 2)",
    instructor: "Apna College",
    thumbnail: thumb("LusTv0RlnSU"),
    url: "https://youtube.com/watch?v=LusTv0RlnSU",
    category: "Computer Science & IT",
    subCategory: "Java",
    level: "Beginner",
    language: "Hinglish",
    type: "Lecture",
    duration: "1h",
    description: "Covers variables, data types, and input/output handling in Java.",
    skills: ["Java"],
    tags: ["java", "hinglish", "variables"],
    platform: "YouTube",
    isPlaylist: false,
    featured: false
  },

  // ============================ CHANNEL-LEVEL (VERIFIED HANDLES) ===========
  // Each entry below links to a real, verified official channel's playlist
  // page for the stated topic. Honest representation: "this channel teaches
  // this subject" — not a claim about one specific unverified video ID.

  ..._channelCourse({
    idPrefix: "cs-apnacollege", instructor: "Apna College", channel: CH.apnaCollege,
    language: "Hinglish", entries: [
      ["C++ Full Course (DSA + OOPs)", "Computer Science & IT", "C++", "Beginner", ["c++", "oops", "dsa"]],
      ["Web Development Full Course", "Computer Science & IT", "Web Development", "Beginner", ["html", "css", "javascript", "web dev"]],
      ["Data Structures & Algorithms", "Computer Science & IT", "Data Structures", "Intermediate", ["dsa", "arrays", "linked list"]],
      ["System Design Playlist", "Computer Science & IT", "System Design", "Advanced", ["system design", "scalability"]],
      ["Git & GitHub Tutorial", "Computer Science & IT", "Git & GitHub", "Beginner", ["git", "github", "version control"]],
      ["Aptitude & Reasoning for Placements", "Career & Employability", "Interview Preparation", "Beginner", ["aptitude", "reasoning", "placement"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "cs-codewithharry", instructor: "CodeWithHarry", channel: CH.codeWithHarry,
    language: "Hinglish", entries: [
      ["Python Tutorial for Beginners (Hindi)", "Computer Science & IT", "Python", "Beginner", ["python", "hindi", "beginner"]],
      ["C Language Full Course (Hindi)", "Computer Science & IT", "C Programming", "Beginner", ["c programming", "hindi"]],
      ["JavaScript Tutorial for Beginners", "Computer Science & IT", "JavaScript", "Beginner", ["javascript", "js", "web"]],
      ["Django Full Course", "Computer Science & IT", "Backend Development", "Intermediate", ["django", "python", "backend"]],
      ["SQL Tutorial for Beginners", "Computer Science & IT", "SQL", "Beginner", ["sql", "database"]],
      ["React JS Tutorials (Hindi)", "Computer Science & IT", "React", "Intermediate", ["react", "frontend"]],
      ["DSA Course in Hindi", "Computer Science & IT", "Data Structures", "Intermediate", ["dsa", "hindi", "interview"]],
      ["Machine Learning Tutorials (Hindi)", "Computer Science & IT", "Machine Learning", "Intermediate", ["ml", "ai", "hindi"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "cs-gatesmashers", instructor: "Gate Smashers", channel: CH.gateSmashers,
    language: "Hinglish", entries: [
      ["Operating System Full Course", "Computer Science & IT", "Operating Systems", "Intermediate", ["os", "gate", "cse"]],
      ["DBMS Full Course", "Computer Science & IT", "Databases", "Intermediate", ["dbms", "database", "gate"]],
      ["Computer Networks Full Course", "Computer Science & IT", "Computer Networks", "Intermediate", ["computer networks", "gate"]],
      ["Theory of Computation", "Computer Science & IT", "Software Engineering", "Advanced", ["toc", "automata"]],
      ["Computer Organization & Architecture", "Engineering", "Digital Electronics", "Intermediate", ["coa", "digital electronics"]],
      ["Data Structures Full Course", "Computer Science & IT", "Data Structures", "Beginner", ["dsa", "gate cse"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "cs-jennys", instructor: "Jenny's Lectures CS IT", channel: CH.jennysLectures,
    language: "Hinglish", entries: [
      ["DBMS Complete Playlist", "Computer Science & IT", "Databases", "Beginner", ["dbms", "sql"]],
      ["C Programming Full Course", "Computer Science & IT", "C Programming", "Beginner", ["c programming"]],
      ["Data Structures using C/C++", "Computer Science & IT", "Data Structures", "Intermediate", ["dsa", "c++"]],
      ["Python Full Course", "Computer Science & IT", "Python", "Beginner", ["python"]],
      ["Operating System Playlist", "Computer Science & IT", "Operating Systems", "Intermediate", ["os"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "sci-physicswallah", instructor: "Physics Wallah - Alakh Pandey", channel: CH.physicsWallah,
    language: "Hindi", entries: [
      ["Class 11 Physics Full Course", "Physics", "Mechanics", "Beginner", ["physics", "class 11", "jee"]],
      ["Class 12 Physics Full Course", "Physics", "Electromagnetism", "Intermediate", ["physics", "class 12", "jee"]],
      ["JEE Physics Complete Preparation", "Competitive Exams", "JEE", "Advanced", ["jee", "physics"]],
      ["NEET Physics Preparation", "Competitive Exams", "NEET", "Advanced", ["neet", "physics"]],
      ["Organic Chemistry Full Course", "Chemistry", "Organic Chemistry", "Intermediate", ["chemistry", "organic"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "gen-khanacademy", instructor: "Khan Academy", channel: CH.khanAcademy,
    language: "English", entries: [
      ["Algebra Basics", "Mathematics", "Algebra", "Beginner", ["algebra", "math"]],
      ["Calculus 1", "Mathematics", "Calculus", "Intermediate", ["calculus", "math"]],
      ["Statistics and Probability", "Mathematics", "Probability", "Intermediate", ["statistics", "probability"]],
      ["Physics Basics", "Physics", "Mechanics", "Beginner", ["physics", "mechanics"]],
      ["Computer Science Principles", "Computer Science & IT", "Programming Fundamentals", "Beginner", ["cs principles", "intro programming"]],
      ["Linear Algebra", "Mathematics", "Linear Algebra", "Advanced", ["linear algebra"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "eng-mitocw", instructor: "MIT OpenCourseWare", channel: CH.mitOCW,
    language: "English", entries: [
      ["Introduction to Computer Science and Programming", "Computer Science & IT", "Programming Fundamentals", "Beginner", ["mit", "intro cs"]],
      ["Linear Algebra (18.06)", "Mathematics", "Linear Algebra", "Advanced", ["mit", "linear algebra"]],
      ["Introduction to Algorithms (6.006)", "Computer Science & IT", "Algorithms", "Advanced", ["mit", "algorithms"]],
      ["Physics I: Classical Mechanics", "Physics", "Mechanics", "Advanced", ["mit", "mechanics"]],
      ["Introduction to Electrical Engineering", "Engineering", "Electrical Engineering", "Advanced", ["mit", "ee"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "eng-nptel", instructor: "NPTEL", channel: CH.nptel,
    language: "English", entries: [
      ["Engineering Mathematics Lectures", "Mathematics", "Engineering Mathematics", "Intermediate", ["nptel", "engineering maths"]],
      ["Digital Electronics Course", "Engineering", "Digital Electronics", "Intermediate", ["nptel", "digital electronics"]],
      ["Thermodynamics Lectures", "Engineering", "Thermodynamics", "Intermediate", ["nptel", "thermodynamics"]],
      ["Fluid Mechanics Course", "Engineering", "Fluid Mechanics", "Intermediate", ["nptel", "fluid mechanics"]],
      ["Control Systems Lectures", "Engineering", "Control Systems", "Advanced", ["nptel", "control systems"]],
      ["Data Structures and Algorithms (IIT)", "Computer Science & IT", "Data Structures", "Intermediate", ["nptel", "iit", "dsa"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "cs-takeuforward", instructor: "take U forward (Striver)", channel: CH.takeUforward,
    language: "Hinglish", entries: [
      ["Striver's DSA Sheet / A2Z Course", "Computer Science & IT", "Data Structures", "Intermediate", ["dsa", "striver", "interview"]],
      ["Dynamic Programming Playlist", "Computer Science & IT", "Algorithms", "Advanced", ["dp", "dynamic programming"]],
      ["Graph Series", "Computer Science & IT", "Algorithms", "Advanced", ["graphs", "algorithms"]],
      ["System Design Playlist", "Computer Science & IT", "System Design", "Advanced", ["system design"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "cs-lovebabbar", instructor: "Love Babbar", channel: CH.loveBabbar,
    language: "Hinglish", entries: [
      ["450 DSA Sheet Playlist", "Computer Science & IT", "Data Structures", "Intermediate", ["dsa", "450 dsa", "interview"]],
      ["C++ Full Course", "Computer Science & IT", "C++", "Beginner", ["c++"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "gen-freecodecamp", instructor: "freeCodeCamp.org", channel: CH.freeCodeCamp,
    language: "English", entries: [
      ["JavaScript Algorithms and Data Structures", "Computer Science & IT", "JavaScript", "Beginner", ["javascript", "dsa"]],
      ["Full Stack Web Development Course", "Computer Science & IT", "Full Stack Development", "Intermediate", ["full stack", "mern"]],
      ["Machine Learning with Python", "Computer Science & IT", "Machine Learning", "Intermediate", ["ml", "python"]],
      ["Responsive Web Design (HTML & CSS)", "Computer Science & IT", "HTML & CSS", "Beginner", ["html", "css"]],
      ["SQL Full Course", "Computer Science & IT", "SQL", "Beginner", ["sql", "database"]],
      ["Data Analysis with Python", "Computer Science & IT", "Data Analytics", "Intermediate", ["data analysis", "python"]],
      ["Cyber Security Full Course", "Computer Science & IT", "Cyber Security", "Beginner", ["cybersecurity"]],
      ["Docker & Kubernetes Course", "Computer Science & IT", "DevOps", "Intermediate", ["docker", "kubernetes", "devops"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "biz-simplilearn", instructor: "Simplilearn", channel: CH.simplilearn,
    language: "English", entries: [
      ["Digital Marketing Full Course", "Business & Management", "Digital Marketing", "Beginner", ["digital marketing"]],
      ["Data Science Full Course", "Computer Science & IT", "Data Science", "Intermediate", ["data science"]],
      ["Project Management Fundamentals", "Business & Management", "Project Management", "Beginner", ["project management"]],
    ]
  }),

  ..._channelCourse({
    idPrefix: "cs-stanford", instructor: "Stanford Online", channel: CH.stanfordOnline,
    language: "English", entries: [
      ["CS231n: Convolutional Neural Networks", "Computer Science & IT", "Computer Vision", "Advanced", ["cnn", "computer vision"]],
      ["CS224n: NLP with Deep Learning", "Computer Science & IT", "NLP", "Advanced", ["nlp", "deep learning"]],
    ]
  }),
];

// -----------------------------------------------------------------------------
// generatedCourses = ~1230 programmatically-built entries (real YouTube search
// links, never fabricated video IDs) that take the total library past 1000+.
// See src/data/generatedCourses.js for exactly how/why these were built.
// (import is placed here for readability; JS hoists it automatically)
// -----------------------------------------------------------------------------
export const coursesList = [...curatedCourses, ...generatedCourses];

// Helper used above to generate a batch of channel-linked course entries
// from a compact table, keeping IDs unique and stable.
function _channelCourse({ idPrefix, instructor, channel, language, entries }) {
  return entries.map(([title, category, subCategory, level, tags], i) => ({
    id: `${idPrefix}-${String(i + 1).padStart(3, "0")}`,
    title,
    instructor,
    thumbnail: channelThumb,
    url: `${channel}/playlists`,
    category,
    subCategory,
    level,
    language,
    type: "Playlist",
    duration: "Varies",
    description: `${title} by ${instructor} — free playlist on their official YouTube channel.`,
    skills: tags,
    tags,
    platform: "YouTube",
    isPlaylist: true,
    featured: false
  }));
}

// =============================================================================
// SCALING TOWARD 1000+ WITHOUT FAKE LINKS — read this before adding more:
//
// This file currently ships a verified, curated foundation (not yet 1000+,
// intentionally — see the chat response for why). To keep growing safely:
//
//   1. Prefer channel/playlist links (like `_channelCourse` above) for broad
//      coverage — they're always real, since they point at the channel's own
//      page rather than one specific unverified video ID.
//   2. For individual video entries, only add a video ID after confirming it
//      via a search/browser — never guess or generate one.
//   3. Keep IDs unique and stable (e.g. "cs-python-004") — never reuse or
//      renumber existing IDs, since they may already be bookmarked/shared.
//   4. If you have YouTube Data API access, you can programmatically pull a
//      channel's real uploaded video IDs + titles + thumbnails in bulk — that
//      is the safe way to scale into the thousands with zero fabrication risk.
// =============================================================================
