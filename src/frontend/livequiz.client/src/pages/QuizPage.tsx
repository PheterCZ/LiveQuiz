import { useNavigate } from "react-router-dom";
import AddQuestionForm from "../components/AddQuestionForm";
import QuestionList from "../components/QuestionList";
import useQuizSession from "../hooks/useQuizSession";

export default function QuizPage() {
    const navigate = useNavigate();

    const {
        questions,
        questionText,
        setQuestionText,
        answerText,
        answerIsCorrect,
        answerQuestionId,
        setAnswerQuestionId,
        setAnswerText,
        setAnswerIsCorrect,
        handleCreateQuestion,
        handleCreateAnswer,
        handleDeleteQuestion,
        handleDeleteQuiz,
        handleStartQuiz
    } = useQuizSession(navigate);

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                        Live Quiz
                    </p>

                    <h1 className="text-3xl font-bold text-gray-800">
                        Quiz overview
                    </h1>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleStartQuiz}
                        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
                    >
                        Start Quiz
                    </button>

                    <button
                        type="button"
                        onClick={handleDeleteQuiz}
                        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                    >
                        Delete Quiz
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <QuestionList
                    questions={questions}
                    answerQuestionId={answerQuestionId}
                    answerText={answerText}
                    answerIsCorrect={answerIsCorrect}
                    onDeleteQuestion={handleDeleteQuestion}
                    onOpenAnswerForm={setAnswerQuestionId}
                    onAnswerTextChange={setAnswerText}
                    onAnswerIsCorrectChange={setAnswerIsCorrect}
                    onAddAnswer={handleCreateAnswer}
                />

                <AddQuestionForm
                    questionText={questionText}
                    onQuestionTextChange={setQuestionText}
                    onSubmit={handleCreateQuestion}
                />
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition hover:bg-green-700"
                >
                    Save Quiz
                </button>
            </div>
        </div>
    );
}