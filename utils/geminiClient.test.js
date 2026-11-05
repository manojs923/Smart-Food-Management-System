import assert from "node:assert/strict";
import { test } from "node:test";
import { generateGeminiContent } from "./geminiClient.js";

async function withGeminiEnvironment(callback) {
  const previousApiKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.GEMINI_MODEL;
  process.env.GEMINI_API_KEY = "test-key";
  delete process.env.GEMINI_MODEL;

  try {
    await callback();
  } finally {
    if (previousApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousApiKey;
    if (previousModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = previousModel;
  }
}

function response(status, body = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => "",
  };
}

test("retries retryable statuses with exponential backoff then returns the response", async () => {
  await withGeminiEnvironment(async () => {
    const delays = [];
    let requestCount = 0;
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      const result = await generateGeminiContent({}, {
        fetchImpl: async () => {
          requestCount += 1;
          return requestCount < 4 ? response([503, 429, 500][requestCount - 1]) : response(200, { ok: true });
        },
        sleep: async (milliseconds) => delays.push(milliseconds),
        random: () => 0.5,
      });

      assert.deepEqual(result, { ok: true });
      assert.equal(requestCount, 4);
      assert.deepEqual(delays, [500, 1000, 2000]);
    } finally {
      console.error = originalConsoleError;
    }
  });
});

test("falls back to the next model after four retries are exhausted", async () => {
  await withGeminiEnvironment(async () => {
    const requestedModels = [];
    const delays = [];
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      const result = await generateGeminiContent({}, {
        fetchImpl: async (url) => {
          requestedModels.push(url.split("/models/")[1].split(":")[0]);
          return requestedModels.length <= 5 ? response(503) : response(200, { model: "fallback" });
        },
        sleep: async (milliseconds) => delays.push(milliseconds),
        random: () => 0.5,
      });

      assert.deepEqual(result, { model: "fallback" });
      assert.deepEqual(requestedModels, [
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
      ]);
      assert.equal(delays.length, 4);
    } finally {
      console.error = originalConsoleError;
    }
  });
});

test("does not retry non-retryable statuses before falling back", async () => {
  await withGeminiEnvironment(async () => {
    const requestedModels = [];
    let sleepCount = 0;
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      await generateGeminiContent({}, {
        fetchImpl: async (url) => {
          requestedModels.push(url.split("/models/")[1].split(":")[0]);
          return requestedModels.length === 1 ? response(400) : response(200, { ok: true });
        },
        sleep: async () => {
          sleepCount += 1;
        },
      });

      assert.deepEqual(requestedModels, ["gemini-3.5-flash-lite", "gemini-3.8-flash"]);
      assert.equal(sleepCount, 0);
    } finally {
      console.error = originalConsoleError;
    }
  });
});
