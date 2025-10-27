import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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
const CAREER_PROMPT = `You are a career advisor AI specializing in technology careers. Based on the provided skills, analyze and suggest suitable job roles, skill gaps, and create a learning roadmap.

Given skills: {skills}

Please provide your response in the following JSON format:
{
    "careerMatches": [
        {
            "role": "job title",
            "matchPercentage": "85%",
            "averageSalary": "salary range",
            "marketDemand": "High/Medium/Low",
            "description": "Brief role description",
            "requiredSkills": ["skill1", "skill2"],
            "skillGaps": [
                {
                    "skill": "missing skill",
                    "priority": "High/Medium/Low",
                    "timeToAcquire": "estimated time",
                    "impact": "What this skill enables"
                }
            ],
            "learningRoadmap": [
                {
                    "phase": 1,
                    "focus": "What to learn in this phase",
                    "duration": "estimated time",
                    "resources": [
                        {
                            "type": "Course/Book/Tutorial",
                            "name": "resource name",
                            "platform": "where to find it",
                            "url": "link to resource",
                            "difficulty": "Beginner/Intermediate/Advanced"
                        }
                    ]
                }
            ]
        }
    ]
}

Ensure the suggestions are modern, relevant to current industry demands, and include practical learning resources.`;

// 🎯 1. Get career recommendations
export async function getCareerRecommendations(skills) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a backend API. Respond ONLY with valid JSON — no explanations, markdown, or text outside JSON.",
        },
        {
          role: "user",
          content: CAREER_PROMPT.replace("{skills}", skills.join(", ")),
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
export async function getSkillGapAnalysis(currentSkills, targetRole) {
  const prompt = `As a career development AI, analyze the skill gap for a ${targetRole} position.

Current skills: ${currentSkills.join(", ")}
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
                "prerequisiteSkills": ["skill1", "skill2"],
                "learningPath": {
                    "steps": ["step1", "step2"],
                    "resources": [
                        {
                            "type": "resource type",
                            "name": "resource name",
                            "url": "resource link",
                            "duration": "estimated time"
                        }
                    ]
                }
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
