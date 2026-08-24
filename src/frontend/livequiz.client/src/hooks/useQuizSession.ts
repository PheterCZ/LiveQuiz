import {
    useEffect,
    useState,
    type FormEvent
} from "react";
import {
    useParams
} from "react-router-dom";
import { createAnswer } from "../api/answerApi";
import {
    deleteQuestion,
    getQuestions,
    createQuestion
} from "../api/questionApi";
import { deleteQuiz } from "../api/quizApi";
import type { QuestionDto } from "../types/QuestionDto";
import {
    connection,
    joinQuiz,
    joinHost,
    startSignalR,
    startQuiz,
    nextQuestion,
    submitAnswer
} from "../services/signalRService";

export type LeaderboardEntry = {
    position: number;
    playerName: string;
    score: number;
};

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

export default function useQuizSession(
    navigate: (to: string) => void,
    providedIsCreator = false
) {
    const { id } = useParams();

    const isCreator =
        providedIsCreator ||
        (!!id &&
            sessionStorage.getItem(
                getTabScopedStorageKey(
                    "quiz-host-creator",
                    id
                )
            ) === "true");

    const [questions, setQuestions] =
        useState<QuestionDto[]>([]);

    const [questionText, setQuestionText] =
        useState("");

    const [answerText, setAnswerText] =
        useState("");

    const [answerIsCorrect, setAnswerIsCorrect] =
        useState(false);

    const [answerQuestionId, setAnswerQuestionId] =
        useState<string | null>(null);

    const [currentQuestionOrder, setCurrentQuestionOrder] =
        useState<number | null>(null);

    const [selectedAnswerId, setSelectedAnswerId] =
        useState<string | null>(null);

    const [answerResult, setAnswerResult] =
        useState<boolean | null>(null);

    const [isQuizCompleted, setIsQuizCompleted] =
        useState(false);

    const [isStartingQuiz, setIsStartingQuiz] =
        useState(false);

    const [playerName, setPlayerName] =
        useState<string | null>(null);

    const [isJoiningQuiz, setIsJoiningQuiz] =
        useState(false);

    const [score, setScore] =
        useState(0);

    const [leaderboard, setLeaderboard] =
        useState<LeaderboardEntry[]>([]);

    const addQuestionToState = (
        question: QuestionDto
    ) => {
        setQuestions((current) => {
            const alreadyExists =
                current.some(
                    (currentQuestion) =>
                        currentQuestion.id ===
                        question.id
                );

            if (alreadyExists) {
                return current;
            }

            return [
                ...current,
                question
            ].sort(
                (a, b) =>
                    a.order - b.order
            );
        });
    };

    const handleJoinQuiz = async (
        name: string
    ) => {
        if (!id || isCreator) {
            return;
        }

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            return;
        }

        try {
            setIsJoiningQuiz(true);

            sessionStorage.setItem(
                getTabScopedStorageKey(
                    "quiz-player-name",
                    id
                ),
                trimmedName
            );

            await joinQuiz(
                id,
                trimmedName
            );

            setPlayerName(
                trimmedName
            );

            console.log(
                "Joined quiz as player:",
                id,
                trimmedName
            );
        } catch (error) {
            sessionStorage.removeItem(
                getTabScopedStorageKey(
                    "quiz-player-name",
                    id
                )
            );

            console.error(
                "Failed to join quiz:",
                error
            );
        } finally {
            setIsJoiningQuiz(false);
        }
    };

    const handleSelectAnswer = async (
        answerId: string
    ) => {
        if (isCreator) {
            return;
        }

        if (
            !id ||
            currentQuestionOrder === null
        ) {
            return;
        }

        const currentQuestion =
            questions.find(
                (question) =>
                    question.order ===
                    currentQuestionOrder
            );

        if (!currentQuestion) {
            return;
        }

        try {
            setSelectedAnswerId(
                answerId
            );

            setAnswerResult(null);

            await submitAnswer(
                id,
                currentQuestion.id,
                answerId
            );
        } catch (error) {
            setSelectedAnswerId(
                null
            );

            setAnswerResult(
                null
            );

            console.error(
                "Failed to submit answer:",
                error
            );
        }
    };

    useEffect(() => {
        if (!id) {
            return;
        }

        let isCancelled = false;
        let nextQuestionTimeout: number | undefined;

        const loadQuestions = async () => {
            try {
                const result =
                    await getQuestions(id);

                if (isCancelled) {
                    return;
                }

                setQuestions(
                    [...result].sort(
                        (a, b) =>
                            a.order - b.order
                    )
                );
            } catch (error) {
                if (!isCancelled) {
                    console.error(
                        "Failed to load questions:",
                        error
                    );
                }
            }
        };

        const readHostToken = () => {
            const storageKey =
                getTabScopedStorageKey(
                    "quiz-host-token",
                    id
                );

            return sessionStorage.getItem(
                storageKey
            );
        };

        const connectToQuiz = async () => {
            try {
                await startSignalR();

                if (isCancelled) {
                    return;
                }

                connection.off(
                    "UserJoined"
                );

                connection.on(
                    "UserJoined",
                    (
                        connectionId: string,
                        playerName: string
                    ) => {
                        console.log(
                            "User joined:",
                            connectionId,
                            playerName
                        );
                    }
                );

                connection.off(
                    "QuestionCreated"
                );

                connection.on(
                    "QuestionCreated",
                    (
                        question: QuestionDto
                    ) => {
                        console.log(
                            "Question created:",
                            question
                        );

                        addQuestionToState(
                            question
                        );
                    }
                );

                connection.off(
                    "QuestionChanged"
                );

                connection.on(
                    "QuestionChanged",
                    (order: number) => {
                        console.log(
                            "Question changed:",
                            order
                        );

                        if (
                            nextQuestionTimeout
                        ) {
                            window.clearTimeout(
                                nextQuestionTimeout
                            );
                        }

                        nextQuestionTimeout =
                            window.setTimeout(
                                () => {
                                    setCurrentQuestionOrder(
                                        order
                                    );

                                    setSelectedAnswerId(
                                        null
                                    );

                                    setAnswerResult(
                                        null
                                    );

                                    setIsQuizCompleted(
                                        false
                                    );
                                },
                                1500
                            );
                    }
                );

                connection.off(
                    "QuizStarted"
                );

                connection.on(
                    "QuizStarted",
                    (order: number) => {
                        console.log(
                            "QUIZ STARTED!",
                            order
                        );

                        setCurrentQuestionOrder(
                            order
                        );

                        setSelectedAnswerId(
                            null
                        );

                        setAnswerResult(
                            null
                        );

                        setIsQuizCompleted(
                            false
                        );

                        setScore(0);
                        setLeaderboard([]);
                    }
                );

                connection.off(
                    "AnswerSubmitted"
                );

                connection.on(
                    "AnswerSubmitted",
                    (
                        answerId: string,
                        isCorrect: boolean,
                        currentScore: number
                    ) => {
                        console.log(
                            "Answer submitted:",
                            answerId,
                            isCorrect,
                            currentScore
                        );

                        setSelectedAnswerId(
                            answerId
                        );

                        setAnswerResult(
                            isCorrect
                        );

                        setScore(
                            currentScore
                        );
                    }
                );

                connection.off(
                    "QuizFinished"
                );

                connection.on(
                    "QuizFinished",
                    (
                        result: LeaderboardEntry[]
                    ) => {
                        console.log(
                            "Quiz finished:",
                            result
                        );

                        setLeaderboard(
                            result
                        );

                        setIsQuizCompleted(
                            true
                        );
                    }
                );

                if (isCreator) {
                    const hostToken =
                        readHostToken();

                    if (!hostToken) {
                        if (!isCancelled) {
                            console.error(
                                "Host token could not be found."
                            );
                        }

                        return;
                    }

                    if (isCancelled) {
                        return;
                    }

                    await joinHost(
                        id,
                        hostToken
                    );

                    console.log(
                        "Joined quiz as host:",
                        id
                    );

                    return;
                }

                const savedPlayerName =
                    sessionStorage.getItem(
                        getTabScopedStorageKey(
                            "quiz-player-name",
                            id
                        )
                    );

                if (savedPlayerName) {
                    await joinQuiz(
                        id,
                        savedPlayerName
                    );

                    if (!isCancelled) {
                        setPlayerName(
                            savedPlayerName
                        );
                    }

                    console.log(
                        "Joined quiz as player:",
                        id,
                        savedPlayerName
                    );
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error(
                        "Failed to join quiz:",
                        error
                    );
                }
            }
        };

        loadQuestions();
        connectToQuiz();

        return () => {
            isCancelled = true;

            if (
                nextQuestionTimeout
            ) {
                window.clearTimeout(
                    nextQuestionTimeout
                );
            }

            connection.off(
                "UserJoined"
            );

            connection.off(
                "QuestionCreated"
            );

            connection.off(
                "QuestionChanged"
            );

            connection.off(
                "QuizStarted"
            );

            connection.off(
                "AnswerSubmitted"
            );

            connection.off(
                "QuizFinished"
            );
        };
    }, [id, isCreator]);

    const handleCreateQuestion = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (
            !id ||
            !questionText.trim()
        ) {
            return;
        }

        try {
            const result =
                await createQuestion({
                    quizId: id,
                    text: questionText
                });

            addQuestionToState(
                result
            );

            setQuestionText("");
        } catch (error) {
            console.error(
                "Failed to create question:",
                error
            );
        }
    };

    const handleCreateAnswer = async (
        questionId: string
    ) => {
        if (!answerText.trim()) {
            return;
        }

        try {
            const result =
                await createAnswer({
                    questionId,
                    text: answerText,
                    isCorrect:
                        answerIsCorrect
                });

            setQuestions((current) =>
                current.map(
                    (question) =>
                        question.id ===
                        questionId
                            ? {
                                  ...question,
                                  answers: [
                                      ...question.answers,
                                      result
                                  ]
                              }
                            : question
                )
            );

            setAnswerText("");
            setAnswerIsCorrect(false);
            setAnswerQuestionId(
                null
            );
        } catch (error) {
            console.error(
                "Failed to create answer:",
                error
            );
        }
    };

    const handleDeleteQuestion = async (
        questionId: string
    ) => {
        try {
            await deleteQuestion(
                questionId
            );

            setQuestions((current) =>
                current.filter(
                    (question) =>
                        question.id !==
                        questionId
                )
            );
        } catch (error) {
            console.error(
                "Failed to delete question:",
                error
            );
        }
    };

    const handleDeleteQuiz = async () => {
        if (!id) {
            return;
        }

        try {
            await deleteQuiz(id);

            sessionStorage.removeItem(
                getTabScopedStorageKey(
                    "quiz-host-token",
                    id
                )
            );

            sessionStorage.removeItem(
                getTabScopedStorageKey(
                    "quiz-player-name",
                    id
                )
            );

            navigate("/");
        } catch (error) {
            console.error(
                "Failed to delete quiz:",
                error
            );
        }
    };

    const handleStartQuiz = async () => {
        if (!id || isStartingQuiz) {
            return;
        }

        const hostToken =
            sessionStorage.getItem(
                getTabScopedStorageKey(
                    "quiz-host-token",
                    id
                )
            );

        if (!hostToken) {
            console.error(
                "Host token not found."
            );

            return;
        }

        try {
            setIsStartingQuiz(
                true
            );

            const result =
                await getQuestions(id);

            const loadedQuestions =
                [...result].sort(
                    (a, b) =>
                        a.order - b.order
                );

            setQuestions(
                loadedQuestions
            );

            if (
                loadedQuestions.length ===
                0
            ) {
                console.error(
                    "Cannot start quiz without questions."
                );

                return;
            }

            await startQuiz(
                id,
                hostToken
            );

            console.log(
                "Quiz started successfully"
            );
        } catch (error) {
            console.error(
                "Failed to start quiz:",
                error
            );
        } finally {
            setIsStartingQuiz(
                false
            );
        }
    };

    const handleNextQuestion =
        async () => {
            if (!id) {
                return;
            }

            const current =
                currentQuestionOrder;

            let nextOrder: number;

            if (current === null) {
                nextOrder =
                    questions.length > 0
                        ? questions[0].order
                        : 1;
            } else {
                const sortedOrders =
                    questions
                        .map(
                            (question) =>
                                question.order
                        )
                        .sort(
                            (a, b) =>
                                a - b
                        );

                const currentIndex =
                    sortedOrders.indexOf(
                        current
                    );

                if (
                    currentIndex >= 0 &&
                    currentIndex <
                        sortedOrders.length -
                            1
                ) {
                    nextOrder =
                        sortedOrders[
                            currentIndex + 1
                        ];
                } else {
                    return;
                }
            }

            try {
                await nextQuestion(
                    id,
                    nextOrder
                );
            } catch (error) {
                console.error(
                    "Failed to move to next question:",
                    error
                );
            }
        };

    const handleFinishQuiz = () => {
        setIsQuizCompleted(
            true
        );
    };

    const isQuizStarted =
        currentQuestionOrder !== null;

    return {
        questions,
        currentQuestionOrder,
        isQuizStarted,

        playerName,
        isJoiningQuiz,
        handleJoinQuiz,

        questionText,
        setQuestionText,

        answerText,
        setAnswerText,

        answerIsCorrect,
        setAnswerIsCorrect,

        answerQuestionId,
        setAnswerQuestionId,

        selectedAnswerId,
        answerResult,

        score,
        leaderboard,

        isQuizCompleted,
        isStartingQuiz,

        handleSelectAnswer,
        handleFinishQuiz,

        handleCreateQuestion,
        handleCreateAnswer,
        handleDeleteQuestion,
        handleDeleteQuiz,
        handleStartQuiz,
        handleNextQuestion
    };
}