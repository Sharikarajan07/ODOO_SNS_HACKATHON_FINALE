const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🎓 Adding more sample courses...');

    // Get an admin user to be the creator
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!admin) {
        console.error('❌ No admin user found. Please run seed first.');
        return;
    }

    // Course 1: Full Stack Web Development
    const course1 = await prisma.course.create({
        data: {
            title: 'Full Stack Web Development',
            description: 'Learn to build modern web applications from scratch. Master HTML, CSS, JavaScript, React, Node.js, and MongoDB in this comprehensive full-stack development course.',
            tags: ['web-development', 'react', 'node', 'javascript', 'mongodb'],
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            responsibleId: admin.id,
            viewCount: 850,
            lessons: {
                create: [
                    {
                        title: 'Introduction to Web Development',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Overview of web technologies and the development roadmap. Learn about frontend, backend, and full-stack development.',
                        order: 1,
                        duration: 30
                    },
                    {
                        title: 'HTML & CSS Fundamentals',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Master HTML5 and CSS3 fundamentals. Build responsive layouts and beautiful designs.',
                        order: 2,
                        duration: 45
                    },
                    {
                        title: 'JavaScript Essentials',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Learn JavaScript programming from basics to advanced concepts including ES6+ features.',
                        order: 3,
                        duration: 60
                    }
                ]
            }
        }
    });

    // Course 2: Python Programming
    const course2 = await prisma.course.create({
        data: {
            title: 'Python Programming Masterclass',
            description: 'Complete Python programming course from beginner to advanced. Learn Python basics, OOP, web scraping, data analysis, and machine learning fundamentals.',
            tags: ['python', 'programming', 'data-science', 'automation'],
            image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            responsibleId: admin.id,
            viewCount: 1200,
            lessons: {
                create: [
                    {
                        title: 'Python Basics and Setup',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Set up Python environment and learn basic syntax, variables, and data types.',
                        order: 1,
                        duration: 35
                    },
                    {
                        title: 'Control Flow and Functions',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Master if-else statements, loops, and creating reusable functions.',
                        order: 2,
                        duration: 40
                    },
                    {
                        title: 'Object-Oriented Programming',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Learn OOP concepts: classes, objects, inheritance, and polymorphism.',
                        order: 3,
                        duration: 50
                    }
                ]
            }
        }
    });

    // Course 3: Mobile App Development
    const course3 = await prisma.course.create({
        data: {
            title: 'Mobile App Development with React Native',
            description: 'Build iOS and Android apps using React Native. Learn to create cross-platform mobile applications with a single codebase.',
            tags: ['mobile', 'react-native', 'ios', 'android', 'app-development'],
            image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            responsibleId: admin.id,
            viewCount: 720,
            lessons: {
                create: [
                    {
                        title: 'React Native Fundamentals',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Introduction to React Native and setting up development environment for iOS and Android.',
                        order: 1,
                        duration: 40
                    },
                    {
                        title: 'Building UI Components',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Create beautiful and responsive UI components using React Native built-in components.',
                        order: 2,
                        duration: 45
                    }
                ]
            }
        }
    });

    // Course 4: Cloud Computing with AWS
    const course4 = await prisma.course.create({
        data: {
            title: 'AWS Cloud Computing Essentials',
            description: 'Master Amazon Web Services fundamentals. Learn EC2, S3, Lambda, and deploy scalable cloud applications.',
            tags: ['aws', 'cloud', 'devops', 'infrastructure'],
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            responsibleId: admin.id,
            viewCount: 950,
            lessons: {
                create: [
                    {
                        title: 'Introduction to AWS',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Overview of AWS services and cloud computing concepts. Create your AWS account and explore the console.',
                        order: 1,
                        duration: 30
                    },
                    {
                        title: 'EC2 and Virtual Servers',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Launch and manage EC2 instances. Learn about instance types, security groups, and key pairs.',
                        order: 2,
                        duration: 50
                    },
                    {
                        title: 'S3 Storage Service',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Store and retrieve data using Amazon S3. Learn about buckets, objects, and access control.',
                        order: 3,
                        duration: 40
                    }
                ]
            }
        }
    });

    // Course 5: Digital Marketing
    const course5 = await prisma.course.create({
        data: {
            title: 'Digital Marketing Mastery',
            description: 'Complete digital marketing course covering SEO, social media marketing, content marketing, email marketing, and paid advertising strategies.',
            tags: ['marketing', 'seo', 'social-media', 'content-marketing'],
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            responsibleId: admin.id,
            viewCount: 680,
            lessons: {
                create: [
                    {
                        title: 'Digital Marketing Fundamentals',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Introduction to digital marketing channels and strategies. Learn the marketing funnel.',
                        order: 1,
                        duration: 35
                    },
                    {
                        title: 'SEO Basics',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Master search engine optimization techniques to rank higher on Google.',
                        order: 2,
                        duration: 45
                    }
                ]
            }
        }
    });

    // Course 6: UI/UX Design
    const course6 = await prisma.course.create({
        data: {
            title: 'UI/UX Design Fundamentals',
            description: 'Learn user interface and user experience design principles. Master Figma, create wireframes, prototypes, and build stunning designs.',
            tags: ['design', 'ui', 'ux', 'figma', 'prototyping'],
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            responsibleId: admin.id,
            viewCount: 920,
            lessons: {
                create: [
                    {
                        title: 'Introduction to UI/UX',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Understanding the difference between UI and UX. Learn design thinking process.',
                        order: 1,
                        duration: 30
                    },
                    {
                        title: 'Design Principles',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Master color theory, typography, layout, and visual hierarchy.',
                        order: 2,
                        duration: 40
                    },
                    {
                        title: 'Figma Mastery',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Learn Figma from scratch. Create professional designs and prototypes.',
                        order: 3,
                        duration: 55
                    }
                ]
            }
        }
    });

    // Course 7: Cybersecurity Basics
    const course7 = await prisma.course.create({
        data: {
            title: 'Cybersecurity Fundamentals',
            description: 'Learn essential cybersecurity concepts, network security, ethical hacking basics, and how to protect systems from cyber threats.',
            tags: ['cybersecurity', 'security', 'ethical-hacking', 'networking'],
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
            published: true,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            responsibleId: admin.id,
            viewCount: 1100,
            lessons: {
                create: [
                    {
                        title: 'Introduction to Cybersecurity',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Overview of cybersecurity landscape, common threats, and security principles.',
                        order: 1,
                        duration: 35
                    },
                    {
                        title: 'Network Security',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Learn about firewalls, VPNs, and securing network infrastructure.',
                        order: 2,
                        duration: 45
                    }
                ]
            }
        }
    });

    // Course 8: Data Science with R
    const course8 = await prisma.course.create({
        data: {
            title: 'Data Science with R Programming',
            description: 'Comprehensive data science course using R. Learn data manipulation, visualization, statistical analysis, and machine learning.',
            tags: ['data-science', 'r-programming', 'statistics', 'machine-learning'],
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
            published: false,
            visibility: 'PUBLIC',
            accessRule: 'FREE',
            responsibleId: admin.id,
            viewCount: 0,
            lessons: {
                create: [
                    {
                        title: 'R Programming Basics',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Introduction to R programming language, RStudio, and basic syntax.',
                        order: 1,
                        duration: 40
                    },
                    {
                        title: 'Data Visualization with ggplot2',
                        type: 'VIDEO',
                        contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        description: 'Create stunning visualizations using ggplot2 package.',
                        order: 2,
                        duration: 50
                    }
                ]
            }
        }
    });

    console.log('✅ Successfully added 8 new courses!');
    console.log(`
📚 New Courses Added:
1. ${course1.title}
2. ${course2.title}
3. ${course3.title}
4. ${course4.title}
5. ${course5.title}
6. ${course6.title}
7. ${course7.title}
8. ${course8.title} (Draft)
    `);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
