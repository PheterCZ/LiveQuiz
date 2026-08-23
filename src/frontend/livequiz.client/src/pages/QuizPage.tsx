import { useNavigate, useLocation } from "react-router-dom";
import AddQuestionForm from "../components/AddQuestionForm";
import QuestionList from "../components/QuestionList";
import useQuizSession from "../hooks/useQuizSession";

export default function QuizPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const isCreator =
        new URLSearchParams(location.search).get("creator") === "true";

    const {
        questions,
        currentQuestionOrder,
        isQuizStarted,

        questionText,
        setQuestionText,

        answerText,
        answerIsCorrect,
        answerQuestionId,
        setAnswerQuestionId,
        setAnswerText,
        setAnswerIsCorrect,

        selectedAnswerId,
        answerResult,
        handleSelectAnswer,

        handleCreateQuestion,
        handleCreateAnswer,
        handleDeleteQuestion,
        handleDeleteQuiz,
        handleStartQuiz,
        handleNextQuestion
    } = useQuizSession(navigate);

    const currentQuestion =
        currentQuestionOrder !== null
            ? questions.find(
                  (question) =>
                      question.order === currentQuestionOrder
              ) ?? null
            : null;

    const visibleQuestionOrder =
        currentQuestion?.order ?? currentQuestionOrder;

    const hasNextQuestion =
        visibleQuestionOrder !== null &&
        questions.some(
            (question) =>
                question.order > visibleQuestionOrder
        );

    const isLastQuestion =
        visibleQuestionOrder !== null &&
        !questions.some(
            (question) =>
                question.order > visibleQuestionOrder
        );

    const isQuizFinished =
        isLastQuestion && answerResult !== null;

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                        Live Quiz
                    </p>

                    <h1 className="text-3xl font-bold text-gray-800">
                        Quiz overview
                    </h1>
                </div>

                {isCreator && (
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
                )}
            </div>

            {/* HOST - QUIZ NOT STARTED */}
            {isCreator && !isQuizStarted && (
                <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                    <h2 className="mb-2 text-xl font-semibold text-gray-700">
                        Quiz is waiting to start
                    </h2>

                    <p>
                        Přidej otázky a odpovědi a potom klikni na{" "}
                        <span className="font-medium text-green-700">
                            Start Quiz
                        </span>
                        .
                    </p>
                </div>
            )}

            {/* PLAYER - WAITING ROOM */}
            {!isCreator && !isQuizStarted && (
                <div className="mx-auto max-w-2xl py-20 text-center">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-10">
                        <div className="mb-6 text-5xl">
                            ⏳
                        </div>

                        <h2 className="mb-3 text-3xl font-bold text-blue-800">
                            Čekárna
                        </h2>

                        <p className="text-lg text-blue-700">
                            Jsi připojený ke kvízu.
                        </p>

                        <p className="mt-2 text-blue-600">
                            Počkej, až host spustí kvíz.
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                            Připojeno
                        </div>
                    </div>
                </div>
            )}

            {/* QUIZ FINISHED */}
            {isQuizFinished && (
                <div className="mx-auto max-w-3xl py-20 text-center">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-10">
                        <h2 className="mb-4 text-3xl font-bold text-emerald-800">
                            Máte hotovo
                        </h2>

                        <p className="mb-6 text-emerald-700">
                            Díky za účast — kvíz byl dokončen.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700"
                        >
                            Zpět na domovskou
                        </button>
                    </div>
                </div>
            )}

            {/* ACTIVE QUIZ */}
            {isQuizStarted &&
                currentQuestion &&
                !isQuizFinished && (
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
                        <p className="mb-2 text-sm font-semibold text-blue-600">
                            Question {visibleQuestionOrder}
                        </p>

                        <h2 className="mb-6 text-2xl font-bold text-gray-800">
                            {currentQuestion.text}
                        </h2>

                        <div className="mb-6 grid gap-3">
                            {currentQuestion.answers.map(
                                (answer) => (
                                    <button
                                        key={answer.id}
                                        type="button"
                                        onClick={() =>
                                            handleSelectAnswer(
                                                answer.id
                                            )
                                        }
                                        className={`rounded-lg p-4 text-left shadow transition ${
                                            selectedAnswerId ===
                                            answer.id
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-800 hover:bg-gray-100"
                                        }`}
                                    >
                                        {answer.text}
                                    </button>
                                )
                            )}
                        </div>

                        {currentQuestionOrder !== null &&
                        hasNextQuestion ? (
                            <button
                                type="button"
                                onClick={handleNextQuestion}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                            >
                                Next Question
                            </button>
                        ) : (
                            isLastQuestion &&
                            answerResult !== null && (
                                <div className="rounded-lg bg-emerald-50 px-4 py-3 font-medium text-emerald-800">
                                    Máte hotovo
                                </div>
                            )
                        )}
                    </div>
                )}

            {/* CREATOR QUESTION MANAGEMENT */}
            {isCreator && (
                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                    <QuestionList
                        questions={questions}
                        answerQuestionId={answerQuestionId}
                        answerText={answerText}
                        answerIsCorrect={answerIsCorrect}
                        onDeleteQuestion={
                            handleDeleteQuestion
                        }
                        onOpenAnswerForm={
                            setAnswerQuestionId
                        }
                        onAnswerTextChange={
                            setAnswerText
                        }
                        onAnswerIsCorrectChange={
                            setAnswerIsCorrect
                        }
                        onAddAnswer={
                            handleCreateAnswer
                        }
                    />

                    <AddQuestionForm
                        questionText={questionText}
                        onQuestionTextChange={
                            setQuestionText
                        }
                        onSubmit={
                            handleCreateQuestion
                        }
                    />
                </div>
            )}

            {/* HOME */}
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
