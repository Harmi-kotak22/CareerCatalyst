import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
    getCareerSuggestions,
    getSkillGaps,
    getRoadmap,
    getFresherProfile,
    updateFresherProfile,
    getFresherRecommendations,
    getProfilesForRole,
    getFresherSkillGaps,
    getSkillDevelopmentPath,
    downloadRoadmapPDF,
    saveLinkedInProfile,
    removeSavedProfile,
    getSavedProfiles,
    // Student-specific controllers
    getStudentProfile,
    updateStudentProfile,
    getStudentCareerRecommendations,
    getStudentSkillGaps,
    getStudentDevelopmentPath,
    downloadStudentRoadmapPDF,
    // Experienced-specific controllers
    getExperiencedProfile,
    updateExperiencedProfile,
    getExperiencedCareerRecommendations,
    getExperiencedSkillGaps,
    generateExperiencedRoadmapPDF
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

// New fresher-specific skill development routes
router.get('/fresher/skill-gaps/:targetRole', verifyToken, getFresherSkillGaps);
router.post('/fresher/skill-development', verifyToken, getSkillDevelopmentPath);
router.get('/fresher/roadmap-pdf/:targetRole', verifyToken, downloadRoadmapPDF);

// LinkedIn profile saving routes
router.post('/fresher/save-profile', verifyToken, saveLinkedInProfile);
router.delete('/fresher/remove-profile/:profileUrl', verifyToken, removeSavedProfile);
router.get('/fresher/saved-profiles', verifyToken, getSavedProfiles);

// Student-specific routes
router.get('/student-profile', verifyToken, getStudentProfile);
router.post('/student-profile', verifyToken, updateStudentProfile);
router.get('/student/recommendations', verifyToken, getStudentCareerRecommendations);
router.get('/student/skill-gaps/:targetRole', verifyToken, getStudentSkillGaps);
router.post('/student/skill-development', verifyToken, getStudentDevelopmentPath);
router.get('/student/roadmap-pdf/:targetRole', verifyToken, downloadStudentRoadmapPDF);

// Experienced-specific routes
router.get('/experienced-profile', verifyToken, getExperiencedProfile);
router.post('/experienced-profile', verifyToken, updateExperiencedProfile);
router.post('/experienced/recommendations', verifyToken, getExperiencedCareerRecommendations);
router.get('/experienced/skill-gaps/:role', verifyToken, getExperiencedSkillGaps);
router.get('/experienced/roadmap-pdf/:role', verifyToken, generateExperiencedRoadmapPDF);

export default router;