
import { GoogleGenAI } from '@google/genai';

const MODEL_NAME = 'gemini-3.6-flash';
const GENERATION_TIMEOUT_MS = 90000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    retryOptions: {
      attempts: 4,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      httpStatusCodes: [429, 500, 502, 503, 504],
    },
  },
});

class GeminiError extends Error {
  constructor(message, status = 502, expose = true) {
    super(message);
    this.status = status;
    this.expose = expose;
    this.name = 'GeminiError';
  }
}

/**
 * Build the prompt for generating quiz questions.
 */
function buildPrompt({
  topic,
  difficulty,
  questionCount,
  additionalInstructions,
}) {
  const extra = additionalInstructions?.trim()
    ? `\nAdditional guidance from the user: ${additionalInstructions.trim()}`
    : '';

  return `You are an expert quiz generator.

Generate exactly ${questionCount} multiple-choice questions about:
"${topic}"

Difficulty level: ${difficulty}.

Requirements:
- Each question must have exactly 4 options.
- Each question must have exactly one correct answer.
- Include a concise explanation of the correct answer.
- All options must be plausible and distinct.
${extra}

Return ONLY valid JSON. Do not use Markdown or code fences.

Use exactly this JSON structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctIndex": 0,
      "explanation": "Explanation text"
    }
  ]
}

Rules:
- correctIndex must be a zero-based index from 0 to 3.
- Generate exactly ${questionCount} questions.
- Do not include text outside the JSON object.`;
}

/**
 * Validate and clean generated quiz questions.
 */
function validateQuizResponse(parsed, expectedCount) {
  if (!parsed || typeof parsed !== 'object') {
    throw new GeminiError(
      'AI returned an invalid response. Please try again.'
    );
  }

  const questions = parsed.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new GeminiError(
      'AI returned no questions. Please try again.'
    );
  }

  if (questions.length !== expectedCount) {
    throw new GeminiError(
      `AI generated ${questions.length} questions instead of ${expectedCount}. Please try again.`
    );
  }

  return questions.map((q, index) => {
    if (
      !q ||
      typeof q.question !== 'string' ||
      !q.question.trim()
    ) {
      throw new GeminiError(
        `Question ${index + 1} is missing its text.`
      );
    }

    if (
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      q.options.some(
        (option) =>
          typeof option !== 'string' ||
          !option.trim()
      )
    ) {
      throw new GeminiError(
        `Question ${index + 1} must have exactly 4 valid options.`
      );
    }

    if (
      !Number.isInteger(q.correctIndex) ||
      q.correctIndex < 0 ||
      q.correctIndex > 3
    ) {
      throw new GeminiError(
        `Question ${index + 1} has an invalid correct answer index.`
      );
    }

    if (
      typeof q.explanation !== 'string' ||
      !q.explanation.trim()
    ) {
      throw new GeminiError(
        `Question ${index + 1} is missing its explanation.`
      );
    }

    return {
      questionId: `q_${index + 1}`,
      question: q.question.trim(),
      options: q.options.map((option) => option.trim()),
      correctIndex: q.correctIndex,
      explanation: q.explanation.trim(),
    };
  });
}

/**
 * Generate a quiz using Gemini.
 */
export async function generateQuizWithGemini(config) {
  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiError(
      'AI service is not configured. Set GEMINI_API_KEY in the backend .env file.',
      503
    );
  }

  const {
    topic,
    difficulty,
    questionCount,
    additionalInstructions,
  } = config;

  if (
    typeof topic !== 'string' ||
    !topic.trim() ||
    !Number.isInteger(questionCount) ||
    questionCount < 1
  ) {
    throw new GeminiError(
      'Invalid quiz configuration. Check the topic and question count.',
      400
    );
  }

  const prompt = buildPrompt({
    topic,
    difficulty,
    questionCount,
    additionalInstructions,
  });

  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new GeminiError(
          'The AI service took too long to respond. Please try again.',
          504
        )
      );
    }, GENERATION_TIMEOUT_MS);
  });

  try {
    console.log(
      `[Gemini] Generating ${questionCount} question(s) with ${MODEL_NAME}...`
    );

    const generation = ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: 'low',
        },
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const response = await Promise.race([
      generation,
      timeout,
    ]);

    const rawText = response?.text || '';

    if (!rawText.trim()) {
      throw new GeminiError(
        'The AI service returned an empty response. Please try again.'
      );
    }

    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      console.error(
        '[Gemini JSON Parse Debug]',
        error.message
      );

      throw new GeminiError(
        'The AI returned an invalid JSON response. Please try again.'
      );
    }

    const questions = validateQuizResponse(
      parsed,
      questionCount
    );

    console.log(
      `[Gemini] Successfully generated ${questions.length} question(s).`
    );

    return questions;
  } catch (error) {
    console.error('[Gemini API Debug]', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      name: error?.name,
      details: error?.errorDetails,
    });

    if (error instanceof GeminiError) {
      throw error;
    }

    const message = String(error?.message || '');
    const normalized = message.toLowerCase();
    const status = error?.status ?? error?.statusCode;

    if (
      status === 429 ||
      normalized.includes('resource_exhausted') ||
      normalized.includes('quota') ||
      normalized.includes('rate limit')
    ) {
      throw new GeminiError(
        'Gemini API quota or rate limit reached. Please try again later or check your API quota.',
        429
      );
    }

    if (
      status === 401 ||
      status === 403 ||
      normalized.includes('api key') ||
      normalized.includes('permission_denied') ||
      normalized.includes('unauthorized')
    ) {
      throw new GeminiError(
        'Gemini rejected the API key or access permissions. Check your API key and model access.',
        503
      );
    }

    if (
      status === 404 ||
      normalized.includes('not_found') ||
      normalized.includes('not found') ||
      normalized.includes('no longer available')
    ) {
      throw new GeminiError(
        `Gemini model "${MODEL_NAME}" was not found or is unavailable. Check the model name and API availability.`,
        502
      );
    }

    if (
      status === 503 ||
      status === 500 ||
      status === 502 ||
      status === 504 ||
      normalized.includes('unavailable') ||
      normalized.includes('high demand')
    ) {
      throw new GeminiError(
        'Gemini is temporarily busy or unavailable. Please wait a little and try again.',
        503
      );
    }

    throw new GeminiError(
      'The Gemini API request failed. Check the backend terminal for [Gemini API Debug] details.',
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
