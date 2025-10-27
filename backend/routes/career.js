import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
    getCareerSuggestions,
    getSkillGaps,
    getRoadmap
} from '../controllers/careerController.js';

const router = express.Router();

// Get career recommendations
router.get('/recommendations', verifyToken, getCareerSuggestions);

// Get skill gap analysis for a specific role
router.get('/skill-gaps/:targetRole', verifyToken, getSkillGaps);

// Get learning roadmap
router.post('/roadmap', verifyToken, getRoadmap);

export default router;