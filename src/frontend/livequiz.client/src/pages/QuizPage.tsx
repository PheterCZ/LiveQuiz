import {
    useNavigate,
    useParams
} from "react-router-dom";
import AddQuestionForm from "../components/AddQuestionForm";
import QuestionList from "../components/QuestionList";
import useQuizSession from "../hooks/useQuizSession";

export default function QuizPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const getTabScopedStorageKey = (
        prefix: string,
        quizId: string
    ) => {
        const tabId =
            sessionStorage.getItem(
                "livequiz-tab-id"
            ) ??
            crypto.randomUUID();

        sessionStorage.setItem(
            "livequiz-tab-id",
            tabId
        );

        return `${prefix}-${quizId}-${tabId}`;
    };

    const isCreator =
        !!id &&
        sessionStorage.getItem(
            getTabScopedStorageKey(
                "quiz-host-creator",
                id
            )
        ) === "true";

    const {
        questions,
        currentQuestionOrder,
        isQuizStarted,

        playerName,
        isJoiningQuiz,
        handleJoinQuiz,

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

        score,
        leaderboard,

        handleSelectAnswer,

        handleCreateQuestion,
        handleCreateAnswer,
        handleDeleteQuestion,
        handleDeleteQuiz,
        handleStartQuiz,
        handleNextQuestion,
        isStartingQuiz,

        isQuizCompleted
    } = useQuizSession(
        navigate,
        isCreator
    );

    const currentQuestion =
        currentQuestionOrder !== null
            ? questions.find(
                  (question) =>
                      question.order ===
                      currentQuestionOrder
              ) ?? null
            : null;

    const visibleQuestionOrder =
        currentQuestion?.order ??
        currentQuestionOrder;

    const hasNextQuestion =
        visibleQuestionOrder !== null &&
        questions.some(
            (question) =>
                question.order >
                visibleQuestionOrder
        );

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
                            onClick={
                                handleStartQuiz
                            }
                            disabled={
                                isStartingQuiz
                            }
                            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                        >
                            {isStartingQuiz
                                ? "Starting..."
                                : "Start Quiz"}
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleDeleteQuiz
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                        >
                            Delete Quiz
                        </button>
                    </div>
                )}
            </div>

            {/* PLAYER - ENTER NAME */}

            {!isCreator &&
                !playerName && (
                    <div className="mx-auto max-w-md py-20">
                        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
                            <h2 className="mb-2 text-2xl font-bold text-gray-800">
                                Připojit se ke kvízu
                            </h2>

                            <p className="mb-6 text-gray-600">
                                Zadej přezdívku,
                                pod kterou
                                budeš v kvízu
                                vystupovat.
                            </p>

                            <form
                                onSubmit={(
                                    event
                                ) => {
                                    event.preventDefault();

                                    const form =
                                        event.currentTarget;

                                    const input =
                                        form.elements.namedItem(
                                            "playerName"
                                        ) as HTMLInputElement;

                                    handleJoinQuiz(
                                        input.value
                                    );
                                }}
                                className="space-y-4"
                            >
                                <input
                                    name="playerName"
                                    type="text"
                                    maxLength={
                                        20
                                    }
                                    autoFocus
                                    placeholder="Např. Petr"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />

                                <button
                                    type="submit"
                                    disabled={
                                        isJoiningQuiz
                                    }
                                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                                >
                                    {isJoiningQuiz
                                        ? "Připojování..."
                                        : "Připojit se"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            {/* HOST - WAITING */}

            {isCreator &&
                !isQuizStarted && (
                    <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                        <h2 className="mb-2 text-xl font-semibold text-gray-700">
                            Quiz is waiting
                            to start
                        </h2>

                        <p>
                            Přidej otázky
                            a odpovědi a
                            potom klikni
                            na{" "}
                            <span className="font-medium text-green-700">
                                Start Quiz
                            </span>
                            .
                        </p>
                    </div>
                )}

            {/* PLAYER - WAITING ROOM */}

            {!isCreator &&
                playerName &&
                !isQuizStarted &&
                !isQuizCompleted && (
                    <div className="mx-auto max-w-2xl py-20 text-center">
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-10">
                            <div className="mb-6 text-5xl">
                                ⏳
                            </div>

                            <h2 className="mb-3 text-3xl font-bold text-blue-800">
                                Čekárna
                            </h2>

                            <p className="text-lg text-blue-700">
                                Jsi připojený
                                ke kvízu
                                jako{" "}
                                <span className="font-bold">
                                    {playerName}
                                </span>
                                .
                            </p>

                            <p className="mt-2 text-blue-600">
                                Počkej, až host
                                spustí kvíz.
                            </p>

                            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                Připojeno
                            </div>
                        </div>
                    </div>
                )}

            {/* SCORE */}

            {isQuizStarted &&
                !isQuizCompleted &&
                !isCreator && (
                    <div className="mb-6 flex justify-end">
                        <div className="rounded-full bg-yellow-100 px-5 py-2 font-bold text-yellow-800 shadow">
                            ⭐ {score} bodů
                        </div>
                    </div>
                )}

            {/* FINAL LEADERBOARD */}

            {isQuizCompleted &&
                leaderboard.length > 0 && (
                    <div className="mx-auto max-w-2xl py-12">
                        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 shadow-lg">
                            <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">
                                🏆 Výsledky kvízu
                            </h2>

                            <p className="mb-8 text-center text-gray-600">
                                Kvíz je dokončen.
                            </p>

                            <div className="space-y-3">
                                {leaderboard.map(
                                    (
                                        player
                                    ) => (
                                        <div
                                            key={
                                                player.playerName
                                            }
                                            className={`flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow ${
                                                player.playerName ===
                                                playerName
                                                    ? "ring-2 ring-blue-500"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="w-8 text-xl font-bold">
                                                    {player.position ===
                                                    1
                                                        ? "🥇"
                                                        : player.position ===
                                                            2
                                                          ? "🥈"
                                                          : player.position ===
                                                              3
                                                            ? "🥉"
                                                            : `${player.position}.`}
                                                </span>

                                                <span className="font-semibold text-gray-800">
                                                    {
                                                        player.playerName
                                                    }
                                                </span>
                                            </div>

                                            <span className="font-bold text-blue-600">
                                                {
                                                    player.score
                                                }{" "}
                                                bodů
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/"
                                    )
                                }
                                className="mt-8 w-full rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700"
                            >
                                Zpět na
                                domovskou
                            </button>
                        </div>
                    </div>
                )}

            {/* ACTIVE QUIZ */}

            {isQuizStarted &&
                currentQuestion &&
                !isQuizCompleted && (
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
                        <p className="mb-2 text-sm font-semibold text-blue-600">
                            Question{" "}
                            {
                                visibleQuestionOrder
                            }
                        </p>

                        <h2 className="mb-6 text-2xl font-bold text-gray-800">
                            {
                                currentQuestion.text
                            }
                        </h2>

                        <div className="mb-6 grid gap-3">
                            {currentQuestion.answers.map(
                                (
                                    answer
                                ) => (
                                    <button
                                        key={
                                            answer.id
                                        }
                                        type="button"
                                        disabled={
                                            isCreator ||
                                            selectedAnswerId !==
                                                null
                                        }
                                        onClick={() =>
                                            handleSelectAnswer(
                                                answer.id
                                            )
                                        }
                                        className={`rounded-lg p-4 text-left shadow transition ${
                                            selectedAnswerId ===
                                            answer.id
                                                ? answerResult ===
                                                  true
                                                    ? "bg-green-600 text-white"
                                                    : "bg-red-600 text-white"
                                                : "bg-white text-gray-800 hover:bg-gray-100"
                                        } ${
                                            isCreator
                                                ? "cursor-not-allowed opacity-60"
                                                : ""
                                        }`}
                                    >
                                        {
                                            answer.text
                                        }
                                    </button>
                                )
                            )}
                        </div>

                        {answerResult !==
                            null && (
                            <div
                                className={`mb-4 rounded-lg px-4 py-3 font-medium ${
                                    answerResult
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                                {answerResult
                                    ? "Správně! +1 bod"
                                    : "Špatně! 0 bodů"}
                            </div>
                        )}

                        {isCreator &&
                        currentQuestionOrder !==
                            null &&
                        hasNextQuestion ? (
                            <button
                                type="button"
                                onClick={
                                    handleNextQuestion
                                }
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                            >
                                Next
                                Question
                            </button>
                        ) : null}
                    </div>
                )}

            {/* CREATOR QUESTION MANAGEMENT */}

            {isCreator && (
                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                    <QuestionList
                        questions={
                            questions
                        }
                        answerQuestionId={
                            answerQuestionId
                        }
                        answerText={
                            answerText
                        }
                        answerIsCorrect={
                            answerIsCorrect
                        }
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
                        questionText={
                            questionText
                        }
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

            {!isQuizCompleted && (
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                        className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition hover:bg-green-700"
                    >
                        Save Quiz
                    </button>
                </div>
            )}
        </div>
    );
}