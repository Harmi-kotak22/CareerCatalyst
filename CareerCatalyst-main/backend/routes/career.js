import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
    getCareerSuggestions,
    getSkillGaps,
    getRoadmap,
    getFresherProfile,
    updateFresherProfile,
    getFresherRecommendations,
    getProfilesForRole
} from '../controllers/careerController.js';

const router = express.Router();

// Get career recommendations
router.get('/recommendations', verifyToken, getCareerSuggestions);

// Get skill gap analysis for a specific role
router.get('/skill-gaps/:targetRole', verifyToken, getSkillGaps);

// Get learning roadmap
router.post('/roadmap', verifyToken, getRoadmap);

// Fresher-specific routes
router.get('/fresher-profile', verifyToken, getFresherProfile);
router.post('/fresher-profile', verifyToken, updateFresherProfile);
router.get('/fresher-recommendations', verifyToken, getFresherRecommendations);
router.get('/linkedin-profiles/:role', verifyToken, getProfilesForRole);

export default router;