# Codra AI proxy specification

The browser calls a Supabase Edge Function such as `ai-feedback`. The Edge Function owns the OpenAI credential and is the only component allowed to call OpenAI.

## Browser to Edge Function

```json
{
  "type": "es_feedback",
  "profile": {},
  "company": {},
  "input": {"documentType": "志望動機", "question": "...", "draft": "..."},
  "researchNote": {},
  "model": "gpt-4o-mini"
}
```

For interviews, `type` is `interview_feedback` and `input` contains `question` and `answer`.

## Edge Function to OpenAI

- Authenticate the Supabase user and apply per-user rate limits.
- Validate the request against a server-side schema.
- Mask or remove unnecessary personal identifiers before building the provider prompt.
- Use the server environment secret, for example `OPENAI_API_KEY`; never accept a key from the browser.
- Request structured JSON output matching the selected feedback schema.
- Apply a server timeout and return a normalized response only.

## Normalized responses

ES:

```json
{"improvedText":"...","goodPoints":["..."],"weakPoints":["..."],"addEpisodes":["..."],"companyConnection":["..."],"followUpQuestions":["..."],"warnings":[]}
```

Interview:

```json
{"betterAnswer":"...","strengths":["..."],"improvements":["..."],"followUpQuestions":["..."],"answerStructure":"...","warnings":[]}
```

## Errors and limits

Use a stable error shape: `{ "error": { "code": "RATE_LIMITED", "message": "...", "retryAfterSeconds": 30 } }`.

Recommended policies: 30-second provider timeout, 3 concurrent generations per user, daily generation quota, exponential backoff for transient provider errors, and `429` for rate limits. The browser should show a retry action and retain the existing draft.

## Privacy and logging

- Mask names, email addresses, phone numbers, student IDs and unnecessary company-person identifiers before provider calls when possible.
- Allowed logs: request type, user ID hash, model, latency, status, error code, token usage and algorithm/prompt version.
- Do not log raw drafts, answers, full prompts, API keys or provider response text by default.
- Obtain explicit consent before sending ES or interview content to the proxy.
- API keys cannot live in the browser because browser code, local storage, network requests and extensions are user-visible and cannot protect a provider secret.
