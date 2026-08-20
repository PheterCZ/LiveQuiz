import type { QuestionDto } from "../types/QuestionDto";
import QuestionCard from "./QuestionCard";

type QuestionListProps = {
    questions: QuestionDto[];
    answerQuestionId: string | null;
    answerText: string;
    answerIsCorrect: boolean;
    onDeleteQuestion: (questionId: string) => void;
    onOpenAnswerForm: (questionId: string) => void;
    onAnswerTextChange: (value: string) => void;
    onAnswerIsCorrectChange: (value: boolean) => void;
    onAddAnswer: (questionId: string) => void;
};

export default function QuestionList({
    questions,
    answerQuestionId,
    answerText,
    answerIsCorrect,
    onDeleteQuestion,
    onOpenAnswerForm,
    onAnswerTextChange,
    onAnswerIsCorrectChange,
    onAddAnswer
}: QuestionListProps) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-800">
                    Questions
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {questions.length}
                </span>
            </div>

            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                        No questions yet. Add the first one to your quiz.
                    </div>
                ) : (
                    questions.map((question) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            isAnswerFormOpen={answerQuestionId === question.id}
                            answerText={answerText}
                            answerIsCorrect={answerIsCorrect}
                            onDeleteQuestion={onDeleteQuestion}
                            onOpenAnswerForm={onOpenAnswerForm}
                            onAnswerTextChange={onAnswerTextChange}
                            onAnswerIsCorrectChange={onAnswerIsCorrectChange}
                            onAddAnswer={onAddAnswer}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
