-- Update all INSTRUCTOR users to ADMIN
UPDATE "User" SET role = 'ADMIN' WHERE role = 'INSTRUCTOR';
