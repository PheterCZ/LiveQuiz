import { useCallback, useState } from "react";
import type { QuestionDto } from "../types/QuestionDto";

export type LeaderboardEntry = {
    position: number;
    playerName: string;
    score: number;
};

export function useQuizState() {
    const [questions, setQuestions] =
        useState<QuestionDto[]>([]);

    const [currentQuestionOrder, setCurrentQuestionOrder] =
        useState<number | null>(null);

    const [selectedAnswerId, setSelectedAnswerId] =
        useState<string | null>(null);

    const [answerResult, setAnswerResult] =
        useState<boolean | null>(null);

    const [score, setScore] = useState(0);

    const [leaderboard, setLeaderboard] =
        useState<LeaderboardEntry[]>([]);

    const [isQuizCompleted, setIsQuizCompleted] =
        useState(false);

    const [questionText, setQuestionText] =
        useState("");

    const [answerText, setAnswerText] =
        useState("");

    const [answerIsCorrect, setAnswerIsCorrect] =
        useState(false);

    const [answerQuestionId, setAnswerQuestionId] =
        useState<string | null>(null);

    const [playerName, setPlayerName] =
        useState<string | null>(null);

    const [isJoiningQuiz, setIsJoiningQuiz] =
        useState(false);

    const [isStartingQuiz, setIsStartingQuiz] =
        useState(false);

    const addQuestion = useCallback(
        (question: QuestionDto) => {
            setQuestions(current => {
                if (
                    current.some(
                        q => q.id === question.id
                    )
                ) {
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
        },
        []
    );

    const removeQuestion = useCallback(
        (questionId: string) => {
            setQuestions(
                current =>
                    current.filter(
                        q => q.id !== questionId
                    )
            );
        },
        []
    );

    const addAnswerToQuestion = useCallback(
        (
            questionId: string,
            answer: any
        ) => {
            setQuestions(current =>
                current.map(q =>
                    q.id === questionId
                        ? {
                            ...q,
                            answers: [
                                ...q.answers,
                                answer
                            ]
                        }
                        : q
                )
            );
        },
        []
    );

    const resetForNewQuestion =
        useCallback(() => {
            setSelectedAnswerId(null);
            setAnswerResult(null);
            setIsQuizCompleted(false);
        }, []);

    const resetForQuizStart =
        useCallback(() => {
            setCurrentQuestionOrder(null);
            resetForNewQuestion();
            setScore(0);
            setLeaderboard([]);
        }, [resetForNewQuestion]);

    return {
        questions,
        setQuestions,
        addQuestion,
        removeQuestion,
        addAnswerToQuestion,

        currentQuestionOrder,
        setCurrentQuestionOrder,

        selectedAnswerId,
        setSelectedAnswerId,

        answerResult,
        setAnswerResult,

        score,
        setScore,

        leaderboard,
        setLeaderboard,

        isQuizCompleted,
        setIsQuizCompleted,

        questionText,
        setQuestionText,

        answerText,
        setAnswerText,

        answerIsCorrect,
        setAnswerIsCorrect,

        answerQuestionId,
        setAnswerQuestionId,

        playerName,
        setPlayerName,

        isJoiningQuiz,
        setIsJoiningQuiz,

        isStartingQuiz,
        setIsStartingQuiz,

        resetForNewQuestion,
        resetForQuizStart,

        isQuizStarted:
            currentQuestionOrder !== null
    };
}