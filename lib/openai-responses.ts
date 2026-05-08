type JsonObject = Record<string, unknown>;

type JsonSchemaFormat = {
  type: "json_schema";
  name: string;
  strict: true;
  schema: JsonObject;
};

type OpenAIResponsesBody = {
  model: string;
  input: unknown;
  text: {
    format: JsonSchemaFormat;
  };
  max_output_tokens?: number;
  temperature?: number;
};

export class OpenAIRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OpenAIRequestError";
    this.status = status;
  }
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractOutputText(value: unknown): string | null {
  if (!isJsonObject(value)) return null;

  if (typeof value.output_text === "string") {
    return value.output_text;
  }

  const output = value.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      if (!isJsonObject(item) || !Array.isArray(item.content)) continue;

      for (const contentItem of item.content) {
        if (
          isJsonObject(contentItem) &&
          contentItem.type === "output_text" &&
          typeof contentItem.text === "string"
        ) {
          return contentItem.text;
        }
      }
    }
  }

  return null;
}

function parseJsonText<T>(text: string): T {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(trimmed) as T;
}

export async function requestOpenAIJson<T>(body: OpenAIResponsesBody): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIRequestError("OPENAI_API_KEY is not configured.", 503);
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = "OpenAI request failed.";

    try {
      const errorBody = (await response.json()) as { error?: { message?: string } };
      message = errorBody.error?.message ?? message;
    } catch {
      // Keep the generic client-safe error.
    }

    throw new OpenAIRequestError(message, 502);
  }

  const responseBody = (await response.json()) as unknown;
  const outputText = extractOutputText(responseBody);

  if (!outputText) {
    throw new OpenAIRequestError("OpenAI did not return structured text.", 502);
  }

  try {
    return parseJsonText<T>(outputText);
  } catch {
    throw new OpenAIRequestError("OpenAI returned invalid JSON.", 502);
  }
}
