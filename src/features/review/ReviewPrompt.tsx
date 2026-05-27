import type { ReviewPromptState } from "./useReviewPrompt";

interface ReviewPromptProps {
  prompt: ReviewPromptState | null;
  onConfirm: (prompt: ReviewPromptState) => void;
  onDismiss: () => void;
}

export function ReviewPrompt({ prompt, onConfirm, onDismiss }: ReviewPromptProps) {
  if (!prompt) return null;

  return (
    <div className="review-prompt">
      <span>{prompt.label}</span>
      <div>
        <button type="button" onClick={() => onConfirm(prompt)}>
          现在补记
        </button>
        <button type="button" onClick={onDismiss}>
          稍后
        </button>
        <button type="button" onClick={onDismiss}>
          跳过
        </button>
      </div>
    </div>
  );
}
