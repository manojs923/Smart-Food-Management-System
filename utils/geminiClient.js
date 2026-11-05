import fetch from "node-fetch";

const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];
const MAX_RETRIES = 4;
const RETRYABLE_STATUSES = new Set([429, 500, 503]);
const RETRY_BASE_DELAY_MS = 500;

export class GeminiApiError extends Error {
  constructor(status, model) {
    super(`Gemini request failed with status ${status} using model ${model}`);
    this.name = "GeminiApiError";
    this.status = status;
    this.model = model;
  }
}

export async function generateGeminiContent(contents, options = {}) {
  const { fetchImpl = fetch, sleep = delay, random = Math.random } = options;
  const apiKey = process.env.GEMINI_API_KEY;
  const primaryModel = process.env.GEMINI_MODEL?.trim() || FALLBACK_MODELS[0];
  const models = [...new Set([primaryModel, ...FALLBACK_MODELS])];

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  let lastStatus;
  let lastModel = models[0];

  for (const model of models) {
    lastModel = model;

    for (let retry = 0; retry <= MAX_RETRIES; retry += 1) {
      let response;
      try {
        response = await fetchImpl(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "x-goog-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(contents),
          }
        );
      } catch {
        console.error(`[Gemini] Request failed with status network-error using model ${model}.`);
        throw new GeminiApiError(502, model);
      }

      if (response.ok) {
        try {
          return await response.json();
        } catch {
          console.error(`[Gemini] Request failed with status invalid-response using model ${model}.`);
          throw new GeminiApiError(502, model);
        }
      }

      lastStatus = response.status;
      console.error(`[Gemini] Request failed with status ${lastStatus} using model ${model}.`);
      await response.text();

      if (!RETRYABLE_STATUSES.has(lastStatus) || retry === MAX_RETRIES) {
        break;
      }

      const baseDelay = RETRY_BASE_DELAY_MS * 2 ** retry;
      const jitteredDelay = Math.floor(baseDelay * (0.5 + random()));
      await sleep(jitteredDelay);
    }
  }

  throw new GeminiApiError(lastStatus ?? 502, lastModel);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
