/**
 * Chat feature configuration.
 *
 * The model lives here — not in the UI and not in the Gemini adapter — so the
 * request and the badge shown to the user can never drift apart.
 */
export const CHAT_MODEL = "gemini-2.0-flash-exp"
export const CHAT_MODEL_LABEL = "Gemini 2.0 Flash"
export const CHAT_TEMPERATURE = 0.7
