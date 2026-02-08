-- Check user 'def' and their enrollments
SELECT u.id, u.name, u.email, u.role,
       e."courseId", e.status, e."progressPercentage", e."enrolledAt",
       c.title as "courseTitle"
FROM "User" u
LEFT JOIN "Enrollment" e ON u.id = e."userId"  
LEFT JOIN "Course" c ON e."courseId" = c.id
WHERE u.name = 'def' OR u.email LIKE '%def%';
