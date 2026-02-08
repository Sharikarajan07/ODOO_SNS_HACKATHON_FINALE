const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only) - for Responsible dropdown
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            },
            orderBy: { name: 'asc' }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user profile
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Check if user is updating their own profile or is an admin
        if (req.user.id !== parseInt(id) && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            
            if (existingUser && existingUser.id !== parseInt(id)) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(email && { email })
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
