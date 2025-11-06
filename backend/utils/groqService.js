import Groq from "groq-sdk";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(dirname(__dirname), '.env') });

// LinkedIn API Configuration
const LINKEDIN_API_KEY = process.env.LINKEDIN_API_KEY;

// ✅ Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🧠 Helper function to safely parse model output
function safeJSONParse(text) {
  if (!text) return null;

  // Remove markdown code fences like ```json ... ```
  const clean = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("❌ JSON parse failed. Raw response:\n", clean);
    throw err;
  }
}

// 🧩 Career recommendation prompt
const CAREER_PROMPT = `You are a career advisor AI specializing in technology careers with deep expertise in career transitions. Based on the provided profile, analyze and suggest suitable career transition paths.

Given profile:
- Current skills: {skills}
- Years of experience: {experience}
- Reason for switch: {reason}
- Work mode preference: {workMode}

Please provide your response in the following JSON format:
{
    "recommendations": [
        {
            "role": "job title",
            "compatibilityScore": "85",
            "averageSalary": "₹XX-YY LPA",
            "marketDemand": "High/Medium/Low with growth trend",
            "description": "Detailed role description including why it's suitable for career transition",
            "transitionTime": "Estimated time to make the switch",
            "keyBenefits": [
                "Benefit 1",
                "Benefit 2"
            ],
            "transitionDifficulty": "Easy/Moderate/Challenging",
            "remotePotential": "Percentage of remote opportunities",
            "growthPotential": {
                "shortTerm": "1-2 year outlook",
                "longTerm": "3-5 year outlook"
            },
            "skillTransferability": {
                "existingSkillsRelevance": "How current skills apply",
                "transferableSkills": ["skill1", "skill2"]
            },
            "industryTrends": {
                "currentDemand": "Analysis of current job market",
                "futurePerspective": "Where the role is heading"
            }
        }
    ]
}

Ensure the suggestions are modern, relevant to current industry demands, and include practical learning resources.`;

// 🎯 1. Get career recommendations
export async function getCareerRecommendations(params) {
  try {
    let prompt;
    if (typeof params === 'object' && params.type === 'experienced') {
      prompt = CAREER_PROMPT
        .replace("{skills}", params.skills.join(", "))
        .replace("{experience}", params.experience)
        .replace("{reason}", params.reasonForSwitch)
        .replace("{workMode}", params.workMode);
    } else {
      // Handle the original case for other user types
      prompt = CAREER_PROMPT.replace("{skills}", params.join(", "));
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a backend API. Respond ONLY with valid JSON — no explanations, markdown, or text outside JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile", // ✅ Use a valid Groq model
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content;
    console.log("🧩 Raw Groq response:\n", response);
    if (!response) throw new Error("No response from GROQ");

    return safeJSONParse(response);
  } catch (error) {
    console.error("GROQ API Error:", error);
    throw error;
  }
}

// 🎯 2. Skill gap analysis
export async function getSkillGapAnalysis(profile, targetRole) {
  // Ensure skills are in array format
  const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
  
  const prompt = `As a career development AI, analyze the skill gap for transitioning to a ${targetRole} position.

Current Profile:
- Skills: ${currentSkills.join(", ")}
- Years of Experience: ${profile.experienceYears || 'Not specified'}
- Current Work Mode: ${profile.workMode || 'Not specified'}
Target role: ${targetRole}

Provide a detailed skill gap analysis in this JSON format:
{
    "analysis": {
        "role": "${targetRole}",
        "currentSkillsAssessment": {
            "strengths": ["skill1", "skill2"],
            "relevance": "How current skills relate to the role"
        },
        "missingSkills": [
            {
                "skill": "name of skill",
                "priority": "High/Medium/Low",
                "timeToAcquire": "estimated time",
                "impact": "How this skill affects career transition",
                "prerequisiteSkills": ["skill1", "skill2"],
                "resources": [
                    {
                        "title": "resource name",
                        "type": "course/book/tutorial",
                        "url": "resource link",
                        "duration": "estimated time"
                    }
                ]
            }
        ],
        "transitionPlan": {
            "phases": [
                {
                    "name": "phase name",
                    "duration": "estimated duration",
                    "activities": ["activity1", "activity2"]
                }
            ]
        }
    }
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a backend API. Respond ONLY with valid JSON — no markdown, no explanations.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error("No response from GROQ");

    return safeJSONParse(response);
  } catch (error) {
    console.error("GROQ API Error:", error);
    throw error;
  }
}

// 🎯 3. Learning roadmap generation
export async function generateLearningRoadmap(currentSkills, targetSkills) {
  const prompt = `Create a personalized learning roadmap to acquire these target skills: ${targetSkills.join(
    ", "
  )}
Current skills: ${currentSkills.join(", ")}

Provide the roadmap in this JSON format:
{
    "roadmap": {
        "estimatedTotalDuration": "total time",
        "phases": [
            {
                "phase": 1,
                "title": "phase title",
                "duration": "estimated time",
                "focusAreas": ["area1", "area2"],
                "skills": [
                    {
                        "skill": "skill name",
                        "level": "target proficiency level",
                        "resources": [
                            {
                                "type": "resource type",
                                "name": "resource name",
                                "platform": "platform name",
                                "url": "resource link",
                                "duration": "estimated time",
                                "cost": "free/paid/subscription"
                            }
                        ],
                        "projects": [
                            {
                                "title": "project title",
                                "description": "what to build",
                                "skills": ["skills practiced"],
                                "difficulty": "level"
                            }
                        ]
                    }
                ],
                "milestones": ["milestone1", "milestone2"]
            }
        ]
    }
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a backend API. Respond ONLY with valid JSON — no markdown, no explanations.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error("No response from GROQ");

    return safeJSONParse(response);
  } catch (error) {
    console.error("GROQ API Error:", error);
    throw error;
  }
}

// 🎯 4. Get LinkedIn-style profiles for a role
export async function getLinkedInProfiles(role) {
  const prompt = `Generate a list of sample LinkedIn profiles for ${role} position. 
  
Provide the profiles in this JSON format:
{
    "profiles": [
        {
            "name": "Full Name",
            "title": "Current Job Title",
            "company": "Company Name",
            "experience": "Years of Experience",
            "skills": ["skill1", "skill2"],
            "education": "Highest Education",
            "certifications": ["cert1", "cert2"],
            "profileUrl": "https://linkedin.com/in/sample-profile"
        }
    ]
}

Create realistic but fictional profiles that showcase typical career paths and skill combinations for this role.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a backend API. Respond ONLY with valid JSON — no markdown, no explanations.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error("No response from GROQ");

    return safeJSONParse(response);
  } catch (error) {
    console.error("GROQ API Error:", error);
    throw error;
  }
}
