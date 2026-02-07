const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    // Clear existing data and reset identity sequences
    // Using TRUNCATE ... RESTART IDENTITY CASCADE is cleaner for resetting auto-increment IDs
    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "QuizAttempt", "QuizOption", "QuizQuestion", "Quiz", "Review", "Progress", "Enrollment", "LessonAttachment", "Lesson", "Course", "Points", "User" RESTART IDENTITY CASCADE;`);
        console.log('✓ Cleared existing data and reset IDs');
    } catch (error) {
        console.warn('Warning: Could not truncate tables, falling back to deleteMany. IDs may not be reset.', error.message);
        // Fallback
        await prisma.quizAttempt.deleteMany();
        await prisma.quizOption.deleteMany();
        await prisma.quizQuestion.deleteMany();
        await prisma.quiz.deleteMany();
        await prisma.review.deleteMany();
        await prisma.progress.deleteMany();
        await prisma.enrollment.deleteMany();
        await prisma.lessonAttachment.deleteMany();
        await prisma.lesson.deleteMany();
        await prisma.course.deleteMany();
        await prisma.points.deleteMany();
        await prisma.user.deleteMany();
    }

    console.log('✓ Cleared existing data');

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@learnsphere.com',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    const instructor = await prisma.user.create({
        data: {
            name: 'John Instructor',
            email: 'instructor@learnsphere.com',
            password: hashedPassword,
            role: 'INSTRUCTOR'
        }
    });

    const learner1 = await prisma.user.create({
        data: {
            name: 'Alice Learner',
            email: 'alice@learnsphere.com',
            password: hashedPassword,
            role: 'LEARNER',
            points: {
                create: { totalPoints: 45, badge: 'Explorer' }
            }
        }
    });

    const learner2 = await prisma.user.create({
        data: {
            name: 'Bob Student',
            email: 'bob@learnsphere.com',
            password: hashedPassword,
            role: 'LEARNER',
            points: {
                create: { totalPoints: 15, badge: 'Newbie' }
            }
        }
    });

    // Valid user requested by actual user
    const specificLearner = await prisma.user.create({
        data: {
            name: 'Aishwarya',
            email: 'aishu22@gmail.com',
            password: hashedPassword,
            role: 'LEARNER',
            points: {
                create: { totalPoints: 120, badge: 'Master' }
            }
        }
    });

    console.log('✓ Created users');

    // Course 1: Technical Interview Preparation
    const course1 = await prisma.course.create({
        data: {
            title: 'Technical Interview Mastery',
            description: 'Master data structures, algorithms, and system design for technical interviews at top tech companies. This comprehensive course covers everything you need to crack coding interviews.',
            tags: ['interview', 'coding', 'algorithms', 'data-structures'],
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            viewCount: 1250,
            lessons: {
                create: [
                    {
                        title: 'Introduction to Technical Interviews',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=GJdiM-muYqc', // Replacing with CS Dojo: https://www.youtube.com/watch?v=GJdiM-muYqc
                        description: 'Learn what to expect in technical interviews and how to prepare effectively.',
                        order: 1,
                        duration: 15
                    },
                    {
                        title: 'Arrays and Strings - Core Concepts',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=WdGP-iXfaKk', // HackerRank (Gayle)
                        description: 'Master array manipulation and string algorithms commonly asked in interviews.',
                        order: 2,
                        duration: 25
                    },
                    {
                        title: 'Linked Lists Deep Dive',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=njTh_OwMljA', // HackerRank
                        description: 'Understand linked list operations, reversals, and cycle detection.',
                        order: 3,
                        duration: 20
                    },
                    {
                        title: 'Trees and Graphs Fundamentals',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=oSWTXtMglKE', // HackerRank (Trees)
                        description: 'Learn tree traversals, BST operations, and graph algorithms.',
                        order: 4,
                        duration: 30
                    },
                    {
                        title: 'Big-O Complexity Cheat Sheet',
                        type: 'DOCUMENT',
                        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                        description: 'Reference guide for time and space complexity analysis.',
                        order: 5,
                        duration: 10,
                        allowDownload: true
                    },
                    {
                        title: 'System Design Basics',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=UzLMhqg3_Wc', // System Design (Gaurav Sen) - usually open
                        description: 'Introduction to designing scalable systems for senior-level interviews.',
                        order: 6,
                        duration: 35
                    }
                ]
            },
            quizzes: {
                create: {
                    title: 'Data Structures Quiz',
                    rewards: { attempt1: 10, attempt2: 7, attempt3: 5, attempt4: 3 },
                    questions: {
                        create: [
                            {
                                questionText: 'What is the time complexity of searching in a balanced BST?',
                                order: 1,
                                options: {
                                    create: [
                                        { optionText: 'O(1)', isCorrect: false },
                                        { optionText: 'O(log n)', isCorrect: true },
                                        { optionText: 'O(n)', isCorrect: false },
                                        { optionText: 'O(n log n)', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'Which data structure uses LIFO principle?',
                                order: 2,
                                options: {
                                    create: [
                                        { optionText: 'Queue', isCorrect: false },
                                        { optionText: 'Stack', isCorrect: true },
                                        { optionText: 'Linked List', isCorrect: false },
                                        { optionText: 'Array', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'What is the space complexity of merge sort?',
                                order: 3,
                                options: {
                                    create: [
                                        { optionText: 'O(1)', isCorrect: false },
                                        { optionText: 'O(log n)', isCorrect: false },
                                        { optionText: 'O(n)', isCorrect: true },
                                        { optionText: 'O(n²)', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'Which traversal of BST gives sorted output?',
                                order: 4,
                                options: {
                                    create: [
                                        { optionText: 'Preorder', isCorrect: false },
                                        { optionText: 'Inorder', isCorrect: true },
                                        { optionText: 'Postorder', isCorrect: false },
                                        { optionText: 'Level order', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'What is the best case time complexity of Quick Sort?',
                                order: 5,
                                options: {
                                    create: [
                                        { optionText: 'O(n)', isCorrect: false },
                                        { optionText: 'O(n log n)', isCorrect: true },
                                        { optionText: 'O(n²)', isCorrect: false },
                                        { optionText: 'O(log n)', isCorrect: false }
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        }
    });

    // Course 2: Behavioral Interview Skills
    const course2 = await prisma.course.create({
        data: {
            title: 'Behavioral Interview Success',
            description: 'Learn the STAR method and master behavioral questions to showcase your soft skills effectively. Perfect for demonstrating leadership and teamwork abilities.',
            tags: ['interview', 'behavioral', 'soft-skills', 'STAR-method'],
            image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            viewCount: 890,
            lessons: {
                create: [
                    {
                        title: 'Understanding Behavioral Interviews',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=1mHjMNZZvFo', // Linda Raynier - Leadership (Known to work)
                        description: 'Learn why companies use behavioral interviews and what they evaluate.',
                        order: 1,
                        duration: 12
                    },
                    {
                        title: 'The STAR Method Explained',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=8iFdw4a7BHA', // CareerVidz
                        description: 'Master Situation, Task, Action, Result framework for structured answers.',
                        order: 2,
                        duration: 18
                    },
                    {
                        title: 'Common Behavioral Questions & Answers',
                        type: 'DOCUMENT',
                        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                        description: 'Comprehensive list of 50+ common behavioral interview questions with sample answers.',
                        order: 3,
                        duration: 20,
                        allowDownload: true
                    },
                    {
                        title: 'Leadership Questions Deep Dive',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=1mHjMNZZvFo', // Linda Raynier
                        description: 'How to answer questions about leading teams and projects.',
                        order: 4,
                        duration: 22
                    },
                    {
                        title: 'Handling Conflict Questions',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=0W6HkYj_hK4', // CareerVidz
                        description: 'Strategies for discussing workplace conflicts professionally.',
                        order: 5,
                        duration: 16
                    }
                ]
            },
            quizzes: {
                create: {
                    title: 'Behavioral Interview Quiz',
                    rewards: { attempt1: 10, attempt2: 7, attempt3: 5, attempt4: 3 },
                    questions: {
                        create: [
                            {
                                questionText: 'What does STAR stand for in the STAR method?',
                                order: 1,
                                options: {
                                    create: [
                                        { optionText: 'Skills, Training, Achievement, Results', isCorrect: false },
                                        { optionText: 'Situation, Task, Action, Result', isCorrect: true },
                                        { optionText: 'Strategy, Tactics, Analysis, Review', isCorrect: false },
                                        { optionText: 'Start, Think, Act, Reflect', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'Which is the MOST important part of the STAR response?',
                                order: 2,
                                options: {
                                    create: [
                                        { optionText: 'Situation', isCorrect: false },
                                        { optionText: 'Task', isCorrect: false },
                                        { optionText: 'Action', isCorrect: true },
                                        { optionText: 'Result', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'When asked about a failure, you should:',
                                order: 3,
                                options: {
                                    create: [
                                        { optionText: 'Avoid the question', isCorrect: false },
                                        { optionText: 'Blame others', isCorrect: false },
                                        { optionText: 'Share a real example and lessons learned', isCorrect: true },
                                        { optionText: 'Say you never fail', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'How long should a typical STAR response be?',
                                order: 4,
                                options: {
                                    create: [
                                        { optionText: '30 seconds', isCorrect: false },
                                        { optionText: '1-2 minutes', isCorrect: true },
                                        { optionText: '5-10 minutes', isCorrect: false },
                                        { optionText: 'As long as possible', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'What should you avoid in behavioral interviews?',
                                order: 5,
                                options: {
                                    create: [
                                        { optionText: 'Using specific examples', isCorrect: false },
                                        { optionText: 'Using "we" instead of "I"', isCorrect: true },
                                        { optionText: 'Mentioning metrics', isCorrect: false },
                                        { optionText: 'Showing enthusiasm', isCorrect: false }
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        }
    });

    // Course 3: Resume & Portfolio Building
    const resumeCourse = await prisma.course.create({
        data: {
            title: 'Resume & Portfolio Mastery',
            description: 'Craft a winning resume and build a portfolio that stands out. Includes templates, ATS optimization tips, and project showcase strategies.',
            image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'PAID',
            price: 49.99,
            tags: ['resume', 'portfolio', 'career-growth', 'personal-branding'],
            lessons: {
                create: [
                    {
                        title: 'Resume Fundamentals',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=Tt08KmFfIYQ', // Jeff Su
                        description: 'Essential elements every technical resume must have.',
                        order: 1,
                        duration: 15
                    },
                    {
                        title: 'ATS Optimization Guide',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=Nu6r0s3Yc1s', // Jeff Su (ATS)
                        description: 'How to beat Applicant Tracking Systems and get your resume seen by humans.',
                        order: 2,
                        duration: 20
                    },
                    {
                        title: 'Resume Templates',
                        type: 'DOCUMENT',
                        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                        description: 'Professional resume templates in multiple formats.',
                        order: 3,
                        duration: 5,
                        allowDownload: true
                    },
                    {
                        title: 'Building Your Portfolio Website',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=pG4p55_D8fE', // Ali Abdaal (Portfolio)
                        description: 'Step-by-step guide to creating an impressive portfolio site.',
                        order: 4,
                        duration: 40
                    },
                    {
                        title: 'Showcasing Projects Effectively',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=B7oUSCW6iX0', // Exponent
                        description: 'How to present your projects to impress recruiters and hiring managers.',
                        order: 5,
                        duration: 25
                    },
                    {
                        title: 'Portfolio Examples Gallery',
                        type: 'IMAGE',
                        contentUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                        description: 'Collection of outstanding developer portfolio designs for inspiration.',
                        order: 6,
                        duration: 10
                    }
                ]
            },
            quizzes: {
                create: {
                    title: 'Resume & Portfolio Quiz',
                    rewards: { attempt1: 10, attempt2: 7, attempt3: 5, attempt4: 3 },
                    questions: {
                        create: [
                            {
                                questionText: 'What does ATS stand for?',
                                order: 1,
                                options: {
                                    create: [
                                        { optionText: 'Advanced Tracking Software', isCorrect: false },
                                        { optionText: 'Applicant Tracking System', isCorrect: true },
                                        { optionText: 'Automated Testing System', isCorrect: false },
                                        { optionText: 'Application Training Service', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'What is the ideal length for a junior developer resume?',
                                order: 2,
                                options: {
                                    create: [
                                        { optionText: '1 page', isCorrect: true },
                                        { optionText: '2-3 pages', isCorrect: false },
                                        { optionText: '4+ pages', isCorrect: false },
                                        { optionText: 'Half page', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'Which should NOT be included on a resume?',
                                order: 3,
                                options: {
                                    create: [
                                        { optionText: 'GitHub profile link', isCorrect: false },
                                        { optionText: 'Photo (in most countries)', isCorrect: true },
                                        { optionText: 'Technical skills', isCorrect: false },
                                        { optionText: 'Education', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'What makes a portfolio project stand out?',
                                order: 4,
                                options: {
                                    create: [
                                        { optionText: 'Lots of text', isCorrect: false },
                                        { optionText: 'Live demo + source code + documentation', isCorrect: true },
                                        { optionText: 'Just a GitHub link', isCorrect: false },
                                        { optionText: 'Complex animations', isCorrect: false }
                                    ]
                                }
                            },
                            {
                                questionText: 'Resume bullet points should start with:',
                                order: 5,
                                options: {
                                    create: [
                                        { optionText: 'Responsible for...', isCorrect: false },
                                        { optionText: 'Action verbs (Built, Developed, Led)', isCorrect: true },
                                        { optionText: 'I did...', isCorrect: false },
                                        { optionText: 'My duties included...', isCorrect: false }
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        }
    });

    console.log('✓ Created courses with lessons and quizzes');

    // Create enrollments for learners
    await prisma.enrollment.create({
        data: {
            userId: learner1.id,
            courseId: course1.id,
            status: 'ACTIVE',
            progressPercentage: 50
        }
    });

    await prisma.enrollment.create({
        data: {
            userId: learner1.id,
            courseId: course2.id,
            status: 'COMPLETED',
            progressPercentage: 100,
            completedAt: new Date()
        }
    });

    await prisma.enrollment.create({
        data: {
            userId: learner2.id,
            courseId: course1.id,
            status: 'ACTIVE',
            progressPercentage: 16
        }
    });

    console.log('✓ Created enrollments');

    // Create some reviews
    await prisma.review.create({
        data: {
            userId: learner1.id,
            courseId: course1.id,
            rating: 5,
            comment: 'Excellent course! The data structures explanations were crystal clear and the practice problems were very helpful.'
        }
    });

    await prisma.review.create({
        data: {
            userId: learner1.id,
            courseId: course2.id,
            rating: 4,
            comment: 'Great content on behavioral interviews. The STAR method section was particularly useful.'
        }
    });

    await prisma.review.create({
        data: {
            userId: learner2.id,
            courseId: course1.id,
            rating: 5,
            comment: 'Very comprehensive! Helped me prepare for my Google interview.'
        }
    });

    console.log('✓ Created reviews');

    console.log('');
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📧 Test Accounts:');
    console.log('   Admin:      admin@learnsphere.com / password123');
    console.log('   Instructor: instructor@learnsphere.com / password123');
    console.log('   Learner 1:  alice@learnsphere.com / password123');
    console.log('   Learner 2:  bob@learnsphere.com / password123');
    console.log('   User:       aishu22@gmail.com / password123');
    console.log('');
    console.log('📚 Courses created: 3');
    console.log('   - Technical Interview Mastery (6 lessons)');
    console.log('   - Behavioral Interview Success (5 lessons)');
    console.log('   - Resume & Portfolio Mastery (6 lessons)');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
