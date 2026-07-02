/**
 * Chat Controller
 * 
 * Handles incoming HTTP requests for the AI-powered portfolio chatbot.
 * It validates input parameters, calls the OpenRouter completions API with a 
 * customized system prompt about Sonam Mallick, and returns the response.
 */

/**
 * Handle POST /api/chat API requests.
 */
exports.handleChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    // --- Validation ---
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    // --- OpenRouter Configurations ---
    const apiKey = process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.trim() : null;
    const model = process.env.OPENROUTER_MODEL ? process.env.OPENROUTER_MODEL.trim() : 'cohere/north-mini-code:free';

    if (!apiKey) {
      console.error('❌ OpenRouter API key is missing from environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Chatbot is temporarily offline: API key is not configured.'
      });
    }

    // --- Sonam Mallick Portfolio System Prompt ---
    const systemPrompt = `
You are the elite AI Talent Advisor representing Sonam Mallick's professional profile. Your responses must be exceptionally polished, modern, unique, and highly professional. You should present information with structural clarity and style (e.g., using bold highlights, clean bullet lists, and a highly engaging developer-centric tone).

Here is the verified portfolio data for Sonam Mallick:
- **Full Name**: Sonam Mallick
- **Title**: Junior Developer Intern at Infophy & Master of Computer Applications (MCA) Candidate
- **Location**: Bhubaneswar, Odisha, India
- **Core Focus**: Developing secure, high-performance web applications, scaling REST APIs, and database migrations.
- **Academics**:
  * **Master of Computer Applications (MCA)** | Trident Academy of Creative Technology, Bhubaneswar (Pursuing).
  * **Bachelor of Computer Applications (BCA)** | N.C. Autonomous College (Graduated 2022 - 2025 | Score: 71.5%).
- **Internship Milestone**:
  * **Junior Developer Intern** at **Infophy** (2026 - Present)
    * Crafts clean, responsive UI layouts with HTML5, CSS3, and JavaScript (ES6+).
    * Builds robust Express REST APIs integrated with Aiven MySQL cloud databases.
    * Enforces security standards (CORS setups, Helmet headers, Express rate limiting).
    * Implements XSS sanitization pipelines using the 'xss' engine to block client-side injection.
- **Tech Stack**:
  * **Languages**: Java, Python, C Programming
  * **Web Core**: JavaScript, Node.js, Express, HTML5, CSS3
  * **Storage & Systems**: MySQL (Aiven Cloud, XAMPP, phpMyAdmin), Git, GitHub
- **Certifications**:
  * Advanced Web Development Certification (Acmegrade).
- **Languages**:
  * English (Intermediate / Conversational), Hindi (Professional), Odia (Native).
- **Coordinates**:
  * Email: sonammallick36@gmail.com
  * Phone: +91 7894867874
  * LinkedIn: https://www.linkedin.com/in/sonam-mallick-15b06s

RESPONSE PROTOCOL & STYLING RULES:
1. **Tone**: Speak in a highly refined, professional third-person voice. Sound like a knowledgeable recruiter or career advisor endorsing Sonam. Use verbs like "specializes in", "demonstrates competency in", "is currently scaling".
2. **Visual Appeal**: Use beautiful, clean formatting. Bold key terms to make answers skimmable. If asked for a summary, project list, or skills, represent them as a neat bulleted list or mini-dashboard format.
3. **Safety / Scope Filter**: Strictly answer queries directly related to Sonam Mallick's background, studies, skills, and internship. If a user asks general coding queries, unrelated homework questions, or random off-topic questions, respond with a highly polished, polite rejection:
   "I am trained exclusively as Sonam Mallick's professional portfolio assistant. I would be delighted to share details about her technical skill set, academic milestones, or web development projects instead."
4. **Length Constraint**: Keep answers highly concise, striking, and readable. Never write long paragraphs of text. Break them into brief 2-3 sentence blocks or clean lists.
`;

    // --- OpenRouter API Request ---
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://portfolio3-frontend.netlify.app', // Site URL for OpenRouter ranking
        'X-Title': 'Sonam Mallick Portfolio Chatbot'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ OpenRouter API request failed:', data);
      return res.status(response.status).json({
        success: false,
        message: data.error ? data.error.message : 'Failed to retrieve response from AI service.'
      });
    }

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      console.error('❌ OpenRouter returned empty choices:', data);
      throw new Error('Empty response received from AI completions model.');
    }

    // Return the response content to client
    return res.status(200).json({
      success: true,
      reply: data.choices[0].message.content
    });

  } catch (error) {
    // Pass errors to our Express global error handler
    next(error);
  }
};
