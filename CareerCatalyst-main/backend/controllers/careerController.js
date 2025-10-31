import {
    getCareerRecommendations,
    getSkillGapAnalysis,
    generateLearningRoadmap,
    getLinkedInProfiles
} from '../utils/groqService.js';
import User from '../models/User.js';
import Fresher from '../models/Fresher.js';

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
        res.json({ analysis });
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

// Get or create fresher profile
export const getFresherProfile = async (req, res) => {
    try {
        const fresherProfile = await Fresher.findOne({ userId: req.user.id });
        res.json(fresherProfile);
    } catch (error) {
        console.error('Get fresher profile error:', error);
        res.status(500).json({ message: 'Error retrieving fresher profile' });
    }
};

// Create or update fresher profile
export const updateFresherProfile = async (req, res) => {
    try {
        const { skills, interestedRoles, salaryPreferences, workMode } = req.body;

        if (!skills || !interestedRoles || !salaryPreferences || !workMode) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Update or create fresher profile
        const fresherProfile = await Fresher.findOneAndUpdate(
            { userId: req.user.id },
            {
                skills,
                interestedRoles,
                salaryPreferences,
                workMode
            },
            { new: true, upsert: true }
        );

        // Update user's profile completion status
        await User.findByIdAndUpdate(req.user.id, { isProfileComplete: true });

        res.json(fresherProfile);
    } catch (error) {
        console.error('Update fresher profile error:', error);
        res.status(500).json({ message: 'Error updating fresher profile' });
    }
};

// Get career recommendations for fresher
export const getFresherRecommendations = async (req, res) => {
    try {
        const fresherProfile = await Fresher.findOne({ userId: req.user.id });
        if (!fresherProfile) {
            return res.status(404).json({ message: 'Fresher profile not found' });
        }

        const recommendations = await getCareerRecommendations(
            fresherProfile.skills,
            fresherProfile.interestedRoles,
            fresherProfile.salaryPreferences,
            fresherProfile.workMode
        );
        res.json(recommendations);
    } catch (error) {
        console.error('Fresher recommendations error:', error);
        res.status(500).json({ message: 'Error generating recommendations' });
    }
};

// Get LinkedIn profiles for a specific role
export const getProfilesForRole = async (req, res) => {
    try {
        const { role } = req.params;
        const profiles = await getLinkedInProfiles(role);
        res.json({ profiles });
    } catch (error) {
        console.error('LinkedIn profiles error:', error);
        res.status(500).json({ message: 'Error fetching LinkedIn profiles' });
    }
};