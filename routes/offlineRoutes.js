import express from 'express';
import OfflineResource from '../models/OfflineResource.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all offline resources for the user
router.get('/', requireAuth, async (req, res) => {
    try {
        const resources = await OfflineResource.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ data: resources });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offline resources' });
    }
});

// Add a resource to offline list
router.post('/add', requireAuth, async (req, res) => {
    try {
        const { resourceId, type, title, size, thumbnailUrl, metadata } = req.body;

        // Check if already exists
        const existing = await OfflineResource.findOne({ userId: req.user._id, resourceId });
        if (existing) {
            return res.status(400).json({ message: 'Resource already downloaded' });
        }

        const resource = await OfflineResource.create({
            userId: req.user._id,
            resourceId,
            type,
            title,
            size,
            thumbnailUrl,
            metadata,
            status: 'completed', // Assuming client handles download and just syncs metadata
            progress: 100
        });

        res.status(201).json({ data: resource });
    } catch (error) {
        res.status(500).json({ message: 'Error adding offline resource' });
    }
});

// Remove a resource
router.delete('/remove/:id', requireAuth, async (req, res) => {
    try {
        await OfflineResource.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: 'Resource removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing resource' });
    }
});

// Clear all downloads
router.delete('/clear', requireAuth, async (req, res) => {
    try {
        await OfflineResource.deleteMany({ userId: req.user._id });
        res.json({ message: 'All downloads cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing downloads' });
    }
});

export default router;
