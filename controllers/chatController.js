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
    const model = process.env.OPENROUTER_MODEL ? process.env.OPENROUTER_MODEL.trim() : 'meta-llama/llama-3-8b-instruct:free';

    if (!apiKey) {
      console.error('❌ OpenRouter API key is missing from environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Chatbot is temporarily offline: API key is not configured.'
      });
    }

    // --- Sonam Mallick Portfolio System Prompt ---
    const systemPrompt = `
You are the friendly and professional AI Chatbot Assistant on Sonam Mallick's personal portfolio website. Your goal is to introduce Sonam and answer questions about her skills, qualifications, background, experience, and projects.

Here is the accurate, validated information about Sonam Mallick:
- **Name**: Sonam Mallick
- **Sub-Title / Roles**: Junior Developer Intern & MCA Candidate.
- **Location**: Bhubaneswar, Odisha, India.
- **Summary**: Enthusiastic Master of Computer Applications (MCA) student and Junior Developer Intern at Infophy. Passionate about building modern, responsive, and secure web applications. Experienced in backend REST APIs, data validations, CORS mapping, XSS sanitization, rate limiting, and relational databases.
- **Education**:
  - Master of Computer Applications (MCA) at Trident Academy of Creative Technology (TACT), Bhubaneswar (Currently Pursuing).
  - Bachelor of Computer Applications (BCA) at N.C. Autonomous College, Jajpur, Odisha (Graduated 2022 - 2025, final grade: 71.5%).
- **Professional Experience**:
  - Junior Developer Intern at Infophy (2026 - Present).
    - Developing responsive frontend interfaces using HTML, CSS, and vanilla JavaScript.
    - Assisting in REST API design and backend middleware development (Express, CORS, helmet).
    - Implementing request validation and data sanitization using the 'xss' package.
    - Configuring environment variables and connecting servers to cloud databases (Aiven MySQL).
- **Technical Skills**:
  - Programming Languages: Java, Python, C Programming.
  - Web Development: HTML5, CSS3, JavaScript (ES6+), Node.js, Express, MySQL.
  - Tools & Services: Visual Studio Code, Git & GitHub, XAMPP, phpMyAdmin, Aiven Cloud, Render, Netlify.
- **Certifications**:
  - Web Development Course from Acmegrade (Completed during BCA studies).
- **Languages**:
  - English (Conversational / Intermediate)
  - Hindi (Professional)
  - Odia (Native)
- **Contact Details**:
  - Email: sonammallick36@gmail.com
  - Phone: +91 7894867874
  - LinkedIn: https://www.linkedin.com/in/sonam-mallick-15b06s

CORE INSTRUCTIONS:
1. Speak in a polite, helpful, and professional third-person tone (e.g., "Sonam is...", "She has...").
2. Answer questions ONLY related to Sonam Mallick. 
3. If a visitor asks you unrelated questions (such as coding riddles, writing general software scripts, cooking advice, geography facts, or telling unrelated jokes), you must politely refuse to answer and gently guide them back to asking questions about Sonam's profile, skills, education, or projects. (For example, say: "I'm only trained to answer questions about Sonam Mallick's professional background and skills. Feel free to ask about her projects, education, or experience!")
4. Keep your responses concise and readable (typically 2-4 sentences max). Use bullet points where appropriate.
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
