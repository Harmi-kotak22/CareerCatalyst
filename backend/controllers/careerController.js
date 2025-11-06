import {
    getCareerRecommendations,
    getSkillGapAnalysis,
    generateLearningRoadmap,
    getLinkedInProfiles
} from '../utils/groqService.js';
import User from '../models/User.js';
import Fresher from '../models/Fresher.js';
import Student from '../models/Student.js';
import { fetchLinkedInProfiles } from '../utils/googleSearchService.js';
import { generateRoadmapPDF } from '../utils/pdfGenerator.js';


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
        const { skills } = req.query;  // Optional skills parameter

        // Construct search query using role and skills
        let searchQuery = role;
        if (skills) {
            // Add top 2-3 skills to refine search
            const topSkills = skills.split(',').slice(0, 3);
            searchQuery += ` ${topSkills.join(' ')}`;
        }

        const profiles = await fetchLinkedInProfiles(searchQuery);
        res.json({ profiles });
    } catch (error) {
        console.error('LinkedIn profiles error:', error);
        res.status(500).json({ message: 'Error fetching LinkedIn profiles' });
    }
};

// Download roadmap as PDF
export const downloadRoadmapPDF = async (req, res) => {
    try {
        const { targetRole } = req.params;
        const fresherProfile = await Fresher.findOne({ userId: req.user.id });
        
        if (!fresherProfile) {
            return res.status(404).json({ message: 'Fresher profile not found' });
        }

        // Get detailed skill gap analysis
        const analysis = await getSkillGapAnalysis(fresherProfile.skills, targetRole);
        
        // Get learning roadmap
        const missingSkills = analysis.analysis.missingSkills.map(skill => skill.skill);
        const roadmap = await generateLearningRoadmap(fresherProfile.skills, missingSkills);

        // Generate PDF
        const pdfBuffer = await generateRoadmapPDF(roadmap.roadmap, analysis.analysis);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=career-roadmap-${targetRole.toLowerCase().replace(/\s+/g, '-')}.pdf`);

        // Send the PDF
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Error generating roadmap PDF' });
    }
};

// Get fresher skill gap analysis with learning path
export const getFresherSkillGaps = async (req, res) => {
    try {
        const { targetRole } = req.params;
        const fresherProfile = await Fresher.findOne({ userId: req.user.id });
        
        if (!fresherProfile) {
            return res.status(404).json({ message: 'Fresher profile not found' });
        }

        // Get detailed skill gap analysis
        const analysis = await getSkillGapAnalysis(fresherProfile.skills, targetRole);
        
        // Generate learning roadmap for missing skills
        const missingSkills = analysis.analysis.missingSkills.map(skill => skill.skill);
        const roadmap = await generateLearningRoadmap(fresherProfile.skills, missingSkills);

        // Combine the analysis and roadmap
        const response = {
            skillGapAnalysis: analysis.analysis,
            learningRoadmap: roadmap.roadmap
        };

        res.json(response);
    } catch (error) {
        console.error('Fresher skill gap analysis error:', error);
        res.status(500).json({ message: 'Error analyzing skill gaps and generating roadmap' });
    }
};

// Save LinkedIn profile
export const saveLinkedInProfile = async (req, res) => {
    try {
        const { name, title, company, profileUrl, thumbnailUrl, role } = req.body;
        
        // Validate required fields
        if (!name || !title || !profileUrl || !role) {
            return res.status(400).json({ message: 'Missing required profile information' });
        }

        const fresherProfile = await Fresher.findOne({ userId: req.user.id });
        if (!fresherProfile) {
            return res.status(404).json({ message: 'Fresher profile not found' });
        }

        // Check if profile is already saved
        const isProfileSaved = fresherProfile.savedProfiles.some(
            profile => profile.profileUrl === profileUrl
        );

        if (isProfileSaved) {
            return res.status(400).json({ message: 'Profile already saved' });
        }

        // Add new profile to savedProfiles array
        fresherProfile.savedProfiles.push({
            name,
            title,
            company,
            profileUrl,
            thumbnailUrl,
            role,
            savedAt: new Date()
        });

        await fresherProfile.save();
        res.json({ message: 'Profile saved successfully', profile: fresherProfile.savedProfiles.slice(-1)[0] });
    } catch (error) {
        console.error('Save LinkedIn profile error:', error);
        res.status(500).json({ message: 'Error saving LinkedIn profile' });
    }
};

// Remove saved LinkedIn profile
export const removeSavedProfile = async (req, res) => {
    try {
        const { profileUrl } = req.params;
        
        const fresherProfile = await Fresher.findOne({ userId: req.user.id });
        if (!fresherProfile) {
            return res.status(404).json({ message: 'Fresher profile not found' });
        }

        // Remove profile from savedProfiles array
        fresherProfile.savedProfiles = fresherProfile.savedProfiles.filter(
            profile => profile.profileUrl !== profileUrl
        );

        await fresherProfile.save();
        res.json({ message: 'Profile removed successfully' });
    } catch (error) {
        console.error('Remove LinkedIn profile error:', error);
        res.status(500).json({ message: 'Error removing LinkedIn profile' });
    }
};

// Get saved LinkedIn profiles
export const getSavedProfiles = async (req, res) => {
    try {
        const fresherProfile = await Fresher.findOne({ userId: req.user.id });
        if (!fresherProfile) {
            return res.status(404).json({ message: 'Fresher profile not found' });
        }

        res.json({ savedProfiles: fresherProfile.savedProfiles });
    } catch (error) {
        console.error('Get saved profiles error:', error);
        res.status(500).json({ message: 'Error fetching saved profiles' });
    }
};

// Student Profile Management
export const getStudentProfile = async (req, res) => {
    try {
        const studentProfile = await Student.findOne({ userId: req.user.id });
        if (!studentProfile) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.json(studentProfile);
    } catch (error) {
        console.error('Get student profile error:', error);
        res.status(500).json({ message: 'Error retrieving student profile' });
    }
};

export const updateStudentProfile = async (req, res) => {
    try {
        const { skills, currentEducation, interests, academicPerformance } = req.body;

        if (!skills || !Array.isArray(skills)) {
            return res.status(400).json({ message: 'Skills array is required' });
        }

        const studentProfile = await Student.findOneAndUpdate(
            { userId: req.user.id },
            {
                skills,
                currentEducation,
                interests,
                academicPerformance
            },
            { new: true, upsert: true }
        );

        await User.findByIdAndUpdate(req.user.id, { isProfileComplete: true });

        res.json(studentProfile);
    } catch (error) {
        console.error('Update student profile error:', error);
        res.status(500).json({ message: 'Error updating student profile' });
    }
};

// Student Skill Gap Analysis and Roadmap
export const getStudentSkillGaps = async (req, res) => {
    try {
        const { targetRole } = req.params;
        const studentProfile = await Student.findOne({ userId: req.user.id });
        
        if (!studentProfile) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Get detailed skill gap analysis
        const analysis = await getSkillGapAnalysis(studentProfile.skills, targetRole, 'student');
        
        // Generate learning roadmap for missing skills
        const missingSkills = analysis.analysis.missingSkills.map(skill => skill.skill);
        const roadmap = await generateLearningRoadmap(studentProfile.skills, missingSkills, 'student');

        // Combine the analysis and roadmap with educational context
        const response = {
            skillGapAnalysis: analysis.analysis,
            learningRoadmap: roadmap.roadmap,
            educationalContext: {
                relevantCourses: await getRelevantCourses(targetRole),
                prerequisites: await getPrerequisiteSkills(targetRole),
                academicPathway: await getAcademicPathway(targetRole)
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Student skill gap analysis error:', error);
        res.status(500).json({ message: 'Error analyzing skill gaps and generating roadmap' });
    }
};

export const downloadStudentRoadmapPDF = async (req, res) => {
    try {
        const { targetRole } = req.params;
        const studentProfile = await Student.findOne({ userId: req.user.id });
        
        if (!studentProfile) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Get detailed skill gap analysis
        const analysis = await getSkillGapAnalysis(studentProfile.skills, targetRole, 'student');
        
        // Generate learning roadmap for missing skills
        const missingSkills = analysis.analysis.missingSkills.map(skill => skill.skill);
        const roadmap = await generateLearningRoadmap(studentProfile.skills, missingSkills, 'student');

        // Add educational context to the roadmap
        const educationalContext = {
            relevantCourses: await getRelevantCourses(targetRole),
            prerequisites: await getPrerequisiteSkills(targetRole),
            academicPathway: await getAcademicPathway(targetRole)
        };

        // Generate PDF with student-specific context
        const pdfBuffer = await generateRoadmapPDF({
            ...roadmap.roadmap,
            educationalContext
        }, analysis.analysis, 'student');

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=student-roadmap-${targetRole.toLowerCase().replace(/\s+/g, '-')}.pdf`);

        // Send the PDF
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Error generating roadmap PDF' });
    }
};

// Helper functions for student-specific context
async function getRelevantCourses(role) {
    // Mock implementation - replace with actual course database/API integration
    return [
        {
            name: `Introduction to ${role}`,
            provider: 'Coursera',
            duration: '8 weeks',
            level: 'Beginner'
        },
        {
            name: `${role} Fundamentals`,
            provider: 'edX',
            duration: '12 weeks',
            level: 'Intermediate'
        }
    ];
}

async function getPrerequisiteSkills(role) {
    // Mock implementation - replace with actual skill prerequisites logic
    return [
        {
            skill: 'Mathematics',
            level: 'Advanced',
            importance: 'High'
        },
        {
            skill: 'Computer Science Basics',
            level: 'Intermediate',
            importance: 'High'
        }
    ];
}

async function getAcademicPathway(role) {
    // Mock implementation - replace with actual academic pathway logic
    return {
        recommendations: [
            'Complete Bachelor\'s in Computer Science',
            'Take specialized courses in the field',
            'Gain practical experience through internships'
        ],
        certifications: [
            'AWS Certified Developer',
            'Google Cloud Professional Developer'
        ],
        timeline: '4-5 years'
    };
}

// Get development path for specific skills for freshers
export const getSkillDevelopmentPath = async (req, res) => {
    try {
        const { skills } = req.body;
        const fresherProfile = await Fresher.findOne({ userId: req.user.id });
        
        if (!fresherProfile) {
            return res.status(404).json({ message: 'Fresher profile not found' });
        }

        if (!skills || !Array.isArray(skills)) {
            return res.status(400).json({ message: 'Target skills must be provided as an array' });
        }

        // Generate detailed learning roadmap for the specified skills
        const roadmap = await generateLearningRoadmap(fresherProfile.skills, skills);

        // For each skill, get sample profiles of people who have mastered it
        const skillProfiles = await Promise.all(
            skills.map(async (skill) => {
                try {
                    const profiles = await getLinkedInProfiles(`${skill} expert`);
                    return {
                        skill,
                        expertProfiles: profiles.profiles.slice(0, 3) // Get top 3 profiles per skill
                    };
                } catch (error) {
                    console.error(`Error fetching profiles for skill ${skill}:`, error);
                    return {
                        skill,
                        expertProfiles: []
                    };
                }
            })
        );

        res.json({
            developmentPath: roadmap.roadmap,
            skillExperts: skillProfiles
        });
    } catch (error) {
        console.error('Skill development path error:', error);
        res.status(500).json({ message: 'Error generating skill development path' });
    }
};

// Helper function to get educational resources for a skill
async function getEducationalResources(skill) {
    // This would typically connect to an educational resources API or database
    // Mock response for now
    return [
        {
            type: 'Course',
            name: `Introduction to ${skill}`,
            platform: 'Coursera',
            duration: '6 weeks',
            level: 'Beginner'
        },
        {
            type: 'Tutorial',
            name: `${skill} Fundamentals`,
            platform: 'YouTube',
            duration: '3 hours',
            level: 'Beginner'
        },
        {
            type: 'Practice',
            name: `${skill} Projects`,
            platform: 'GitHub',
            duration: 'Self-paced',
            level: 'Intermediate'
        }
    ];
}

// Get development path for specific skills for students
export const getStudentDevelopmentPath = async (req, res) => {
    try {
        const { skills } = req.body;
        const studentProfile = await Student.findOne({ userId: req.user.id });
        
        if (!studentProfile) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        if (!skills || !Array.isArray(skills)) {
            return res.status(400).json({ message: 'Target skills must be provided as an array' });
        }

        // Generate detailed learning roadmap for the specified skills
        const roadmap = await generateLearningRoadmap(studentProfile.skills, skills, 'student');

        // For each skill, get learning resources and opportunities
        const skillDevelopment = await Promise.all(
            skills.map(async (skill) => {
                try {
                    const profiles = await getLinkedInProfiles(`${skill} education expert`);
                    return {
                        skill,
                        expertProfiles: profiles.profiles.slice(0, 3),
                        educationalResources: await getEducationalResources(skill)
                    };
                } catch (error) {
                    console.error(`Error fetching development info for skill ${skill}:`, error);
                    return {
                        skill,
                        expertProfiles: [],
                        educationalResources: []
                    };
                }
            })
        );

        res.json({
            developmentPath: roadmap.roadmap,
            skillDevelopment,
            educationalContext: {
                relevantCourses: await getRelevantCourses(skills[0]), // Using first skill as main focus
                prerequisites: await getPrerequisiteSkills(skills[0]),
                academicPathway: await getAcademicPathway(skills[0])
            }
        });
    } catch (error) {
        console.error('Student skill development path error:', error);
        res.status(500).json({ message: 'Error generating skill development path' });
    }
};