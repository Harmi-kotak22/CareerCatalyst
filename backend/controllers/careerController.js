import {
    getCareerRecommendations,
    getSkillGapAnalysis,
    generateLearningRoadmap
} from '../utils/groqService.js';
import User from '../models/User.js';

// Get career recommendations based on user's skills
export const getCareerSuggestions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.skills || user.skills.length === 0) {
            return res.status(400).json({ message: 'Please add skills to get recommendations' });
        }

        const recommendations = await getCareerRecommendations(user.skills);
        res.json(recommendations);
    } catch (error) {
        console.error('Career recommendations error:', error);
        res.status(500).json({ message: 'Error generating career recommendations' });
    }
};

// Get detailed skill gap analysis
export const getSkillGaps = async (req, res) => {
    try {
        const { targetRole } = req.params;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const analysis = await getSkillGapAnalysis(user.skills, targetRole);
        res.json(analysis);
    } catch (error) {
        console.error('Skill gap analysis error:', error);
        res.status(500).json({ message: 'Error analyzing skill gaps' });
    }
};

// Generate personalized learning roadmap
export const getRoadmap = async (req, res) => {
    try {
        const { targetSkills } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!targetSkills || !Array.isArray(targetSkills)) {
            return res.status(400).json({ message: 'Target skills must be provided as an array' });
        }

        const roadmap = await generateLearningRoadmap(user.skills, targetSkills);
        res.json(roadmap);
    } catch (error) {
        console.error('Learning roadmap error:', error);
        res.status(500).json({ message: 'Error generating learning roadmap' });
    }
};