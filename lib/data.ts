import type { User, Course, QuizAttempt, Badge } from "./types"

export const DEMO_BADGES: Badge[] = [
  { id: "b1", name: "First Steps", description: "Complete your first lesson", icon: "footprints", earnedAt: "2025-12-01" },
  { id: "b2", name: "Quiz Whiz", description: "Score 100% on a quiz", icon: "brain", earnedAt: "2025-12-05" },
  { id: "b3", name: "Course Champion", description: "Complete an entire course", icon: "trophy", earnedAt: "2025-12-10" },
  { id: "b4", name: "Knowledge Seeker", description: "Enroll in 3 courses", icon: "book-open", earnedAt: "2025-12-15" },
  { id: "b5", name: "Top Scorer", description: "Earn 500 points", icon: "star", earnedAt: "" },
]

export const DEMO_USERS: User[] = [
  { id: "u1", name: "Sarah Chen", email: "admin@learnsphere.com", role: "admin", points: 0, badges: [], createdAt: "2025-01-01" },
  { id: "u2", name: "Dr. James Wilson", email: "instructor@learnsphere.com", role: "instructor", points: 0, badges: [], createdAt: "2025-01-05" },
  { id: "u3", name: "Alex Rivera", email: "learner@learnsphere.com", role: "learner", points: 320, badges: [DEMO_BADGES[0], DEMO_BADGES[1], DEMO_BADGES[3]], createdAt: "2025-02-01" },
  { id: "u4", name: "Maya Patel", email: "maya@learnsphere.com", role: "learner", points: 150, badges: [DEMO_BADGES[0]], createdAt: "2025-03-01" },
  { id: "u5", name: "Prof. Emily Brooks", email: "emily@learnsphere.com", role: "instructor", points: 0, badges: [], createdAt: "2025-01-10" },
]

export const DEMO_COURSES: Course[] = [
  {
    id: "c1",
    title: "Introduction to Machine Learning",
    description: "Learn the fundamentals of machine learning, including supervised learning, unsupervised learning, and neural networks. This course is designed for beginners with basic programming knowledge.",
    thumbnail: "/placeholder-ml.jpg",
    instructorId: "u2",
    instructorName: "Dr. James Wilson",
    status: "published",
    visibility: "public",
    category: "Technology",
    lessons: [
      { id: "l1", courseId: "c1", title: "What is Machine Learning?", description: "An overview of ML concepts", type: "video", contentUrl: "https://example.com/video1", duration: 15, order: 1, attachments: [{ id: "a1", name: "Slides.pdf", url: "#", type: "pdf" }] },
      { id: "l2", courseId: "c1", title: "Supervised vs Unsupervised Learning", description: "Understanding the difference between learning paradigms", type: "video", contentUrl: "https://example.com/video2", duration: 20, order: 2, attachments: [] },
      { id: "l3", courseId: "c1", title: "Linear Regression Deep Dive", description: "Understanding the math behind regression models", type: "document", contentUrl: "https://example.com/doc1", duration: 25, order: 3, attachments: [{ id: "a2", name: "Dataset.csv", url: "#", type: "csv" }] },
      { id: "l4", courseId: "c1", title: "Neural Networks Basics", description: "Introduction to artificial neural networks", type: "video", contentUrl: "https://example.com/video3", duration: 30, order: 4, attachments: [] },
      { id: "l5", courseId: "c1", title: "Model Evaluation Techniques", description: "How to measure ML model performance", type: "document", contentUrl: "https://example.com/doc2", duration: 20, order: 5, attachments: [] },
    ],
    quizzes: [
      {
        id: "q1", courseId: "c1", title: "ML Fundamentals Quiz", description: "Test your knowledge of ML basics", maxAttempts: 3, passingScore: 70,
        questions: [
          { id: "qq1", quizId: "q1", text: "What type of learning uses labeled data?", options: [{ id: "o1", text: "Supervised Learning" }, { id: "o2", text: "Unsupervised Learning" }, { id: "o3", text: "Reinforcement Learning" }, { id: "o4", text: "Transfer Learning" }], correctOptionId: "o1", order: 1 },
          { id: "qq2", quizId: "q1", text: "Which algorithm is used for classification?", options: [{ id: "o5", text: "Linear Regression" }, { id: "o6", text: "K-Means" }, { id: "o7", text: "Decision Tree" }, { id: "o8", text: "PCA" }], correctOptionId: "o7", order: 2 },
          { id: "qq3", quizId: "q1", text: "What is overfitting?", options: [{ id: "o9", text: "Model is too simple" }, { id: "o10", text: "Model memorizes training data" }, { id: "o11", text: "Model is well-balanced" }, { id: "o12", text: "Model fails to train" }], correctOptionId: "o10", order: 3 },
          { id: "qq4", quizId: "q1", text: "What does a loss function measure?", options: [{ id: "o13", text: "Training speed" }, { id: "o14", text: "Model accuracy on test data" }, { id: "o15", text: "Difference between predicted and actual values" }, { id: "o16", text: "Number of parameters" }], correctOptionId: "o15", order: 4 },
          { id: "qq5", quizId: "q1", text: "Which is NOT a type of neural network?", options: [{ id: "o17", text: "CNN" }, { id: "o18", text: "RNN" }, { id: "o19", text: "GAN" }, { id: "o20", text: "SQL" }], correctOptionId: "o20", order: 5 },
        ],
      },
    ],
    enrollments: [
      { id: "e1", userId: "u3", courseId: "c1", status: "active", progress: 60, completedLessons: ["l1", "l2", "l3"], enrolledAt: "2025-06-01" },
      { id: "e2", userId: "u4", courseId: "c1", status: "active", progress: 20, completedLessons: ["l1"], enrolledAt: "2025-07-01" },
    ],
    reviews: [
      { id: "r1", userId: "u3", userName: "Alex Rivera", courseId: "c1", rating: 5, comment: "Excellent introduction to ML. Very clear explanations.", createdAt: "2025-08-01" },
    ],
    averageRating: 5,
    createdAt: "2025-03-01",
    updatedAt: "2025-06-15",
  },
  {
    id: "c2",
    title: "UX Design Principles",
    description: "Master the principles of user experience design. Learn to create intuitive, user-centered digital products through research, wireframing, and prototyping.",
    thumbnail: "/placeholder-ux.jpg",
    instructorId: "u5",
    instructorName: "Prof. Emily Brooks",
    status: "published",
    visibility: "public",
    category: "Design",
    lessons: [
      { id: "l6", courseId: "c2", title: "Introduction to UX Design", description: "What is UX and why it matters", type: "video", contentUrl: "https://example.com/video4", duration: 18, order: 1, attachments: [] },
      { id: "l7", courseId: "c2", title: "User Research Methods", description: "Techniques for understanding users", type: "document", contentUrl: "https://example.com/doc3", duration: 22, order: 2, attachments: [] },
      { id: "l8", courseId: "c2", title: "Wireframing Workshop", description: "Create effective wireframes", type: "video", contentUrl: "https://example.com/video5", duration: 35, order: 3, attachments: [{ id: "a3", name: "Template.fig", url: "#", type: "fig" }] },
      { id: "l9", courseId: "c2", title: "Usability Testing", description: "How to test your designs", type: "video", contentUrl: "https://example.com/video6", duration: 28, order: 4, attachments: [] },
    ],
    quizzes: [
      {
        id: "q2", courseId: "c2", title: "UX Design Quiz", description: "Test your UX knowledge", maxAttempts: 3, passingScore: 60,
        questions: [
          { id: "qq6", quizId: "q2", text: "What does UX stand for?", options: [{ id: "o21", text: "User Experience" }, { id: "o22", text: "User Extension" }, { id: "o23", text: "Unified Experience" }, { id: "o24", text: "Universal Exchange" }], correctOptionId: "o21", order: 1 },
          { id: "qq7", quizId: "q2", text: "Which is a user research method?", options: [{ id: "o25", text: "A/B Testing" }, { id: "o26", text: "Compiling" }, { id: "o27", text: "Deploying" }, { id: "o28", text: "Caching" }], correctOptionId: "o25", order: 2 },
          { id: "qq8", quizId: "q2", text: "What is a wireframe?", options: [{ id: "o29", text: "A type of code" }, { id: "o30", text: "A low-fidelity design layout" }, { id: "o31", text: "A database schema" }, { id: "o32", text: "A testing framework" }], correctOptionId: "o30", order: 3 },
        ],
      },
    ],
    enrollments: [
      { id: "e3", userId: "u3", courseId: "c2", status: "completed", progress: 100, completedLessons: ["l6", "l7", "l8", "l9"], enrolledAt: "2025-04-01", completedAt: "2025-05-15" },
    ],
    reviews: [
      { id: "r2", userId: "u3", userName: "Alex Rivera", courseId: "c2", rating: 4, comment: "Great course with practical examples. The wireframing section was especially useful.", createdAt: "2025-05-20" },
    ],
    averageRating: 4,
    createdAt: "2025-02-15",
    updatedAt: "2025-05-15",
  },
  {
    id: "c3",
    title: "Data Structures & Algorithms",
    description: "A comprehensive guide to essential data structures and algorithms. Prepare for technical interviews and build a strong CS foundation.",
    thumbnail: "/placeholder-dsa.jpg",
    instructorId: "u2",
    instructorName: "Dr. James Wilson",
    status: "published",
    visibility: "public",
    category: "Computer Science",
    lessons: [
      { id: "l10", courseId: "c3", title: "Arrays and Linked Lists", description: "Fundamental data structures", type: "video", contentUrl: "https://example.com/video7", duration: 25, order: 1, attachments: [] },
      { id: "l11", courseId: "c3", title: "Stacks and Queues", description: "LIFO and FIFO structures", type: "video", contentUrl: "https://example.com/video8", duration: 20, order: 2, attachments: [] },
      { id: "l12", courseId: "c3", title: "Trees and Graphs", description: "Non-linear data structures", type: "document", contentUrl: "https://example.com/doc4", duration: 30, order: 3, attachments: [] },
      { id: "l13", courseId: "c3", title: "Sorting Algorithms", description: "Various sorting techniques", type: "video", contentUrl: "https://example.com/video9", duration: 35, order: 4, attachments: [] },
      { id: "l14", courseId: "c3", title: "Dynamic Programming", description: "Solving complex problems efficiently", type: "video", contentUrl: "https://example.com/video10", duration: 40, order: 5, attachments: [] },
      { id: "l15", courseId: "c3", title: "Graph Algorithms", description: "BFS, DFS, Dijkstra and more", type: "document", contentUrl: "https://example.com/doc5", duration: 30, order: 6, attachments: [] },
    ],
    quizzes: [
      {
        id: "q3", courseId: "c3", title: "DSA Fundamentals Quiz", description: "Test your data structures knowledge", maxAttempts: 2, passingScore: 75,
        questions: [
          { id: "qq9", quizId: "q3", text: "What is the time complexity of binary search?", options: [{ id: "o33", text: "O(n)" }, { id: "o34", text: "O(log n)" }, { id: "o35", text: "O(n^2)" }, { id: "o36", text: "O(1)" }], correctOptionId: "o34", order: 1 },
          { id: "qq10", quizId: "q3", text: "Which data structure uses FIFO?", options: [{ id: "o37", text: "Stack" }, { id: "o38", text: "Queue" }, { id: "o39", text: "Tree" }, { id: "o40", text: "Graph" }], correctOptionId: "o38", order: 2 },
          { id: "qq11", quizId: "q3", text: "What is a balanced BST?", options: [{ id: "o41", text: "All leaves at same level" }, { id: "o42", text: "Height difference of subtrees <= 1" }, { id: "o43", text: "All nodes have 2 children" }, { id: "o44", text: "Root is always minimum" }], correctOptionId: "o42", order: 3 },
          { id: "qq12", quizId: "q3", text: "Which sorting algorithm is stable?", options: [{ id: "o45", text: "Quick Sort" }, { id: "o46", text: "Heap Sort" }, { id: "o47", text: "Merge Sort" }, { id: "o48", text: "Selection Sort" }], correctOptionId: "o47", order: 4 },
        ],
      },
    ],
    enrollments: [
      { id: "e4", userId: "u4", courseId: "c3", status: "active", progress: 33, completedLessons: ["l10", "l11"], enrolledAt: "2025-08-01" },
    ],
    reviews: [],
    averageRating: 0,
    createdAt: "2025-05-01",
    updatedAt: "2025-08-01",
  },
  {
    id: "c4",
    title: "Digital Marketing Masterclass",
    description: "Learn modern digital marketing strategies including SEO, social media marketing, email campaigns, and analytics. Perfect for entrepreneurs and marketing professionals.",
    thumbnail: "/placeholder-marketing.jpg",
    instructorId: "u5",
    instructorName: "Prof. Emily Brooks",
    status: "draft",
    visibility: "private",
    category: "Business",
    lessons: [
      { id: "l16", courseId: "c4", title: "Digital Marketing Overview", description: "Introduction to digital marketing channels", type: "video", contentUrl: "https://example.com/video11", duration: 15, order: 1, attachments: [] },
      { id: "l17", courseId: "c4", title: "SEO Fundamentals", description: "Search engine optimization basics", type: "document", contentUrl: "https://example.com/doc6", duration: 20, order: 2, attachments: [] },
    ],
    quizzes: [],
    enrollments: [],
    reviews: [],
    averageRating: 0,
    createdAt: "2025-09-01",
    updatedAt: "2025-09-15",
  },
]

export const DEMO_QUIZ_ATTEMPTS: QuizAttempt[] = [
  { id: "qa1", quizId: "q1", userId: "u3", courseId: "c1", answers: { qq1: "o1", qq2: "o7", qq3: "o10", qq4: "o14", qq5: "o20" }, score: 80, totalQuestions: 5, completedAt: "2025-07-15" },
  { id: "qa2", quizId: "q2", userId: "u3", courseId: "c2", answers: { qq6: "o21", qq7: "o25", qq8: "o30" }, score: 100, totalQuestions: 3, completedAt: "2025-05-10" },
]

export const CATEGORIES = ["Technology", "Design", "Computer Science", "Business", "Science", "Arts"]
