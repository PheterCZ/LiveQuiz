import type { QuestionDto } from "../types/QuestionDto";
import AnswerForm from "./AnswerForm";

type QuestionCardProps = {
    question: QuestionDto;
    isAnswerFormOpen: boolean;
    answerText: string;
    answerIsCorrect: boolean;
    onDeleteQuestion: (questionId: string) => void;
    onOpenAnswerForm: (questionId: string) => void;
    onAnswerTextChange: (value: string) => void;
    onAnswerIsCorrectChange: (value: boolean) => void;
    onAddAnswer: (questionId: string) => void;
};

export default function QuestionCard({
    question,
    isAnswerFormOpen,
    answerText,
    answerIsCorrect,
    onDeleteQuestion,
    onOpenAnswerForm,
    onAnswerTextChange,
    onAnswerIsCorrectChange,
    onAddAnswer
}: QuestionCardProps) {
    return (
        <article
            key={question.id}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
            <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-800">
                    {question.text}
                </h3>

                <button
                    type="button"
                    onClick={() => onDeleteQuestion(question.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                    Delete
                </button>
            </div>

            {question.answers.length > 0 ? (
                <ul className="mt-3 space-y-2">
                    {question.answers.map((answer) => (
                        <li
                            key={answer.id ?? `${question.id}-${answer.text}`}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                                answer.isCorrect
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-gray-200 bg-white text-gray-600"
                            }`}
                        >
                            <span>{answer.text}</span>

                            {answer.isCorrect && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                    Correct
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 text-sm text-gray-500">
                    No answers added yet.
                </p>
            )}

            <div className="mt-4">
                {isAnswerFormOpen ? (
                    <AnswerForm
                        answerText={answerText}
                        answerIsCorrect={answerIsCorrect}
                        onAnswerTextChange={onAnswerTextChange}
                        onAnswerIsCorrectChange={onAnswerIsCorrectChange}
                        onSubmit={(event) => {
                            event.preventDefault();
                            onAddAnswer(question.id);
                        }}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => onOpenAnswerForm(question.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        + Add Answer
                    </button>
                )}
            </div>
        </article>
    );
}
