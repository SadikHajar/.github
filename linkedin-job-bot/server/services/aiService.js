const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function parseCV(cvText) {
  try {
    const prompt = `Parse the following CV and extract structured information in JSON format with these fields:
- name (string)
- email (string)
- phone (string)
- location (string)
- summary (string - brief professional summary)
- skills (array of strings)
- experience (array of objects with: title, company, duration, description)
- education (array of objects with: degree, institution, year)
- languages (array of strings)

CV Text:
${cvText}

Return ONLY valid JSON, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a CV parsing assistant. Extract structured data from CVs and return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('AI parsing error:', error);
    throw new Error('Failed to parse CV with AI: ' + error.message);
  }
}

async function generateCoverLetter(cvData, jobDescription, companyName, jobTitle) {
  try {
    const prompt = `Generate a professional cover letter for the following job application:

Job Title: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription}

Candidate Information:
Name: ${cvData.name}
Summary: ${cvData.summary}
Skills: ${cvData.skills.join(', ')}
Experience: ${cvData.experience.map(exp => `${exp.title} at ${exp.company}`).join(', ')}

Write a compelling, personalized cover letter (200-300 words) that highlights relevant experience and skills. Be professional and enthusiastic.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional cover letter writer. Create compelling, personalized cover letters.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Cover letter generation error:', error);
    throw new Error('Failed to generate cover letter: ' + error.message);
  }
}

async function answerQuestion(question, cvData) {
  try {
    const prompt = `Answer the following job application question based on the candidate's CV:

Question: ${question}

Candidate Information:
${JSON.stringify(cvData, null, 2)}

Provide a concise, professional answer (50-150 words) that highlights relevant experience and skills.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a job application assistant. Answer questions professionally based on the candidate\'s CV.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 200
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Question answering error:', error);
    return 'Please refer to my CV for relevant experience and qualifications.';
  }
}

module.exports = {
  parseCV,
  generateCoverLetter,
  answerQuestion
};
