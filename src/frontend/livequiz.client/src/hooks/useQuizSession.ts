
import {
    useEffect,
    useState,
    type FormEvent
} from "react";
import {
    useParams,
    useLocation
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

export default function useQuizSession(
    navigate: (to: string) => void,
    providedIsCreator = false
) {
    const { id } = useParams();
    const location = useLocation();

    const isCreator =
        providedIsCreator ||
        (!!id &&
            sessionStorage.getItem(
                `quiz-host-creator-${id}`
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

    const addQuestionToState = (
        question: QuestionDto
    ) => {
        setQuestions((current) => {
            const alreadyExists = current.some(
                (currentQuestion) =>
                    currentQuestion.id === question.id
            );

            if (alreadyExists) {
                return current;
            }

            return [...current, question].sort(
                (a, b) => a.order - b.order
            );
        });
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

        const currentQuestion = questions.find(
            (question) =>
                question.order ===
                currentQuestionOrder
        );

        if (!currentQuestion) {
            return;
        }

        try {
            setSelectedAnswerId(answerId);
            setAnswerResult(null);

            await submitAnswer(
                id,
                currentQuestion.id,
                answerId
            );
        } catch (error) {
            setSelectedAnswerId(null);
            setAnswerResult(null);

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
            if (!id) {
                return null;
            }

            const storageKey =
                `quiz-host-token-${id}`;

            return (
                sessionStorage.getItem(storageKey) ??
                localStorage.getItem(storageKey)
            );
        };

        const waitForHostToken =
            async (): Promise<string | null> => {
                const maxAttempts = 200;
                const delay = 100;

                for (
                    let attempt = 0;
                    attempt < maxAttempts;
                    attempt++
                ) {
                    if (isCancelled) {
                        return null;
                    }

                    const hostToken =
                        readHostToken();

                    if (hostToken) {
                        return hostToken;
                    }

                    await new Promise<void>(
                        (resolve) =>
                            setTimeout(
                                resolve,
                                delay
                            )
                    );
                }

                return readHostToken();
            };

        const connectToQuiz = async () => {
            try {
                await startSignalR();

                if (isCancelled) {
                    return;
                }

                connection.off("UserJoined");

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
                    (question: QuestionDto) => {
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

                        setCurrentQuestionOrder(
                            order
                        );

                        setSelectedAnswerId(
                            null
                        );

                        setAnswerResult(null);

                        setIsQuizCompleted(
                            false
                        );
                    }
                );

                connection.off("QuizStarted");

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

                        setAnswerResult(null);

                        setIsQuizCompleted(
                            false
                        );
                    }
                );

                connection.off(
                    "AnswerSubmitted"
                );

                connection.on(
                    "AnswerSubmitted",
                    (
                        answerId: string,
                        isCorrect: boolean
                    ) => {
                        console.log(
                            "Answer submitted:",
                            answerId,
                            isCorrect
                        );

                        setSelectedAnswerId(
                            answerId
                        );

                        setAnswerResult(
                            isCorrect
                        );
                    }
                );

                if (isCreator) {
                    const hostToken =
                        await waitForHostToken();

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

                const storageKey =
                    `quiz-player-${id}`;

                let playerId =
                    sessionStorage.getItem(
                        storageKey
                    );

                if (!playerId) {
                    playerId =
                        crypto.randomUUID();

                    sessionStorage.setItem(
                        storageKey,
                        playerId
                    );
                }

                await joinQuiz(
                    id,
                    playerId
                );

                console.log(
                    "Joined quiz as player:",
                    id,
                    playerId
                );
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

            connection.off("UserJoined");
            connection.off(
                "QuestionCreated"
            );
            connection.off(
                "QuestionChanged"
            );
            connection.off("QuizStarted");
            connection.off(
                "AnswerSubmitted"
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

            addQuestionToState(result);

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
                    isCorrect: answerIsCorrect
                });

            setQuestions((current) =>
                current.map((question) =>
                    question.id === questionId
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
            setAnswerQuestionId(null);
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
                `quiz-host-token-${id}`
            );
            localStorage.removeItem(
                `quiz-host-token-${id}`
            );

            sessionStorage.removeItem(
                `quiz-player-${id}`
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
                `quiz-host-token-${id}`
            ) ?? localStorage.getItem(
                `quiz-host-token-${id}`
            );

        if (!hostToken) {
            console.error(
                "Host token not found."
            );

            return;
        }

        try {
            setIsStartingQuiz(true);

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
                loadedQuestions.length === 0
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
            setIsStartingQuiz(false);
        }
    };

    const handleNextQuestion = async () => {
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
                        (a, b) => a - b
                    );

            const currentIndex =
                sortedOrders.indexOf(
                    current
                );

            if (
                currentIndex >= 0 &&
                currentIndex <
                    sortedOrders.length - 1
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
        setIsQuizCompleted(true);
    };

    const isQuizStarted =
        currentQuestionOrder !== null;

    return {
        questions,
        currentQuestionOrder,
        isQuizStarted,

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
