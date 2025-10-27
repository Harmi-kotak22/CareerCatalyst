import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
    getCareerRecommendations,
    getSkillGapAnalysis,
    getLearningPlan,
    getPersonalizedTips
} from '../controllers/aiController.js';

const router = express.Router();

// Career recommendations based on user skills
router.get('/recommendations', verifyToken, getCareerRecommendations);

// Skill gap analysis for a specific role
router.get('/skill-gaps/:targetRole', verifyToken, getSkillGapAnalysis);

// Generate learning roadmap
router.post('/learning-plan', verifyToken, getLearningPlan);

// Get personalized learning tips
router.post('/learning-tips', verifyToken, getPersonalizedTips);

export default router;