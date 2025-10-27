import { 
    suggestCareerRoles, 
    analyzeSkillGaps, 
    generateLearningRoadmap,
    getLearningTips 
} from '../utils/aiService.js';
import User from '../models/User.js';

export const getCareerRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.skills || user.skills.length === 0) {
            return res.status(400).json({ message: 'Please add skills to get recommendations' });
        }

        const recommendations = await suggestCareerRoles(user.skills);
        res.json(recommendations);
    } catch (error) {
        console.error('Career recommendations error:', error);
        res.status(500).json({ message: 'Error generating career recommendations' });
    }
};

export const getSkillGapAnalysis = async (req, res) => {
    try {
        const { targetRole } = req.params;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const analysis = await analyzeSkillGaps(user.skills, targetRole);
        res.json(analysis);
    } catch (error) {
        console.error('Skill gap analysis error:', error);
        res.status(500).json({ message: 'Error analyzing skill gaps' });
    }
};

export const getLearningPlan = async (req, res) => {
    try {
        const { skillGaps } = req.body;
        
        if (!skillGaps || !Array.isArray(skillGaps)) {
            return res.status(400).json({ message: 'Invalid skill gaps data' });
        }

        const roadmap = await generateLearningRoadmap(skillGaps);
        res.json(roadmap);
    } catch (error) {
        console.error('Learning plan error:', error);
        res.status(500).json({ message: 'Error generating learning plan' });
    }
};

export const getPersonalizedTips = async (req, res) => {
    try {
        const { skillGap, learningStyle } = req.body;
        
        if (!skillGap || !learningStyle) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const tips = await getLearningTips(skillGap, learningStyle);
        res.json(tips);
    } catch (error) {
        console.error('Learning tips error:', error);
        res.status(500).json({ message: 'Error generating learning tips' });
    }
};