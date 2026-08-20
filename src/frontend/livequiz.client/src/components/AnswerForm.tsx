import type { FormEvent } from "react";

type AnswerFormProps = {
    answerText: string;
    answerIsCorrect: boolean;
    onAnswerTextChange: (value: string) => void;
    onAnswerIsCorrectChange: (value: boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AnswerForm({
    answerText,
    answerIsCorrect,
    onAnswerTextChange,
    onAnswerIsCorrectChange,
    onSubmit
}: AnswerFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-2">
            <div className="flex gap-2">
                <input
                    value={answerText}
                    onChange={(event) =>
                        onAnswerTextChange(event.target.value)
                    }
                    placeholder="Answer..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Add
                </button>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={answerIsCorrect}
                    onChange={(event) =>
                        onAnswerIsCorrectChange(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                />

                <span>Correct answer</span>
            </label>
        </form>
    );
}
