import { useEffect, useRef } from "react";
import { connection } from "../services/signalRService";
import type { LeaderboardEntry } from "./useQuizState";
import type { QuestionDto } from "../types/QuestionDto";

interface SignalRListenersProps {
    onUserJoined?: (
        connectionId: string,
        playerName: string
    ) => void;

    onQuestionCreated?: (
        question: QuestionDto
    ) => void;

    onQuestionChanged?: (
        order: number
    ) => void;

    onQuizStarted?: (
        order: number
    ) => void;

    onAnswerSubmitted?: (
        answerId: string,
        isCorrect: boolean,
        score: number
    ) => void;

    onQuizFinished?: (
        leaderboard: LeaderboardEntry[]
    ) => void;
}

export function useSignalRListeners(
    props: SignalRListenersProps
) {
    const {
        onUserJoined,
        onQuestionCreated,
        onQuestionChanged,
        onQuizStarted,
        onAnswerSubmitted,
        onQuizFinished
    } = props;

    const timeoutRef =
        useRef<number | null>(null);

    useEffect(() => {
        const handleUserJoined = (
            connectionId: string,
            playerName: string
        ) => {
            console.log(
                "User joined:",
                connectionId,
                playerName
            );

            onUserJoined?.(
                connectionId,
                playerName
            );
        };

        const handleQuestionCreated = (
            question: QuestionDto
        ) => {
            console.log(
                "Question created:",
                question
            );

            onQuestionCreated?.(
                question
            );
        };

        const handleQuestionChanged = (
            order: number
        ) => {
            console.log(
                "Question changed:",
                order
            );

            if (timeoutRef.current !== null) {
                window.clearTimeout(
                    timeoutRef.current
                );
            }

            timeoutRef.current =
                window.setTimeout(() => {
                    onQuestionChanged?.(order);
                }, 1500);
        };

        const handleQuizStarted = (
            order: number
        ) => {
            console.log(
                "QUIZ STARTED!",
                order
            );

            onQuizStarted?.(order);
        };

        const handleAnswerSubmitted = (
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

            onAnswerSubmitted?.(
                answerId,
                isCorrect,
                currentScore
            );
        };

        const handleQuizFinished = (
            result: LeaderboardEntry[]
        ) => {
            console.log(
                "Quiz finished:",
                result
            );

            onQuizFinished?.(result);
        };

        connection.on(
            "UserJoined",
            handleUserJoined
        );

        connection.on(
            "QuestionCreated",
            handleQuestionCreated
        );

        connection.on(
            "QuestionChanged",
            handleQuestionChanged
        );

        connection.on(
            "QuizStarted",
            handleQuizStarted
        );

        connection.on(
            "AnswerSubmitted",
            handleAnswerSubmitted
        );

        connection.on(
            "QuizFinished",
            handleQuizFinished
        );

        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(
                    timeoutRef.current
                );

                timeoutRef.current = null;
            }

            connection.off(
                "UserJoined",
                handleUserJoined
            );

            connection.off(
                "QuestionCreated",
                handleQuestionCreated
            );

            connection.off(
                "QuestionChanged",
                handleQuestionChanged
            );

            connection.off(
                "QuizStarted",
                handleQuizStarted
            );

            connection.off(
                "AnswerSubmitted",
                handleAnswerSubmitted
            );

            connection.off(
                "QuizFinished",
                handleQuizFinished
            );
        };
    }, [
        onUserJoined,
        onQuestionCreated,
        onQuestionChanged,
        onQuizStarted,
        onAnswerSubmitted,
        onQuizFinished
    ]);
}