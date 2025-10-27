import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Career roles suggestion based on skills
export async function suggestCareerRoles(skills) {
    const prompt = `Given the following skills: ${skills.join(', ')},
    provide a JSON response with recommended career roles in this format:
    {
        "careerRoles": [
            {
                "title": "role title",
                "match": "percentage match",
                "description": "brief role description",
                "salary": "salary range",
                "demand": "market demand level"
            }
        ]
    }`;

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
}

// Analyze skill gaps for a specific role
export async function analyzeSkillGaps(currentSkills, targetRole) {
    const prompt = `Given these current skills: ${currentSkills.join(', ')}
    and target role: ${targetRole},
    provide a JSON response with skill gaps analysis in this format:
    {
        "skillGaps": [
            {
                "skill": "required skill name",
                "importance": "high/medium/low",
                "timeToLearn": "estimated time",
                "priority": "priority level 1-5"
            }
        ]
    }`;

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
}

// Generate learning roadmap
export async function generateLearningRoadmap(skillGaps) {
    const prompt = `For these skill gaps: ${JSON.stringify(skillGaps)},
    create a JSON learning roadmap in this format:
    {
        "roadmap": [
            {
                "phase": "phase number",
                "duration": "estimated duration",
                "skills": [
                    {
                        "skill": "skill name",
                        "resources": [
                            {
                                "type": "course/book/tutorial",
                                "title": "resource title",
                                "platform": "platform name",
                                "url": "resource url",
                                "duration": "estimated completion time"
                            }
                        ]
                    }
                ]
            }
        ]
    }`;

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
}

// Get personalized learning tips
export async function getLearningTips(skillGap, learningStyle) {
    const prompt = `For skill "${skillGap}" and learning style "${learningStyle}",
    provide personalized learning tips in JSON format:
    {
        "tips": [
            {
                "tip": "tip description",
                "rationale": "why this works",
                "practicalSteps": ["step 1", "step 2"]
            }
        ]
    }`;

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content);
}