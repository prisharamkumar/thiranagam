export const MAX_MENTOR_QUESTION_CHARS = 2000;
export const MAX_MENTOR_HISTORY_MESSAGES = 12;
export const MAX_MENTOR_HISTORY_CHARS = 2000;

export interface MentorHistoryEntry {
  role: 'user' | 'mentor';
  text: string;
}

export function normalizeMentorQuestion(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const question = value.trim();
  return question.length > 0 && question.length <= MAX_MENTOR_QUESTION_CHARS
    ? question
    : null;
}

export function normalizeMentorHistory(value: unknown): MentorHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is { role: 'user' | 'mentor'; text: string } =>
        Boolean(
          entry &&
          typeof entry === 'object' &&
          ((entry as { role?: unknown }).role === 'user' ||
            (entry as { role?: unknown }).role === 'mentor') &&
          typeof (entry as { text?: unknown }).text === 'string'
        )
    )
    .slice(-MAX_MENTOR_HISTORY_MESSAGES)
    .map((entry) => ({
      role: entry.role,
      text: entry.text.trim().slice(0, MAX_MENTOR_HISTORY_CHARS),
    }))
    .filter((entry) => entry.text.length > 0);
}
