import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTabStorage } from "./useTabStorage";
import {
    useQuizState,
    type LeaderboardEntry
} from "./useQuizState";
import { useQuizConnection } from "./useQuizConnection";
import { useSignalRListeners } from "./useSignalRListeners";
import { usePlayerActions } from "./usePlayerActions";
import { useCreatorActions } from "./useCreatorActions";

export type { LeaderboardEntry };

export default function useQuizSession(
    navigate: (to: string) => void,
    providedIsCreator = false
) {
    const { id: quizId } = useParams();

    const storage = useTabStorage();
    const state = useQuizState();

    const isCreator =
        providedIsCreator ||
        (!!quizId && storage.isCreatorStored(quizId));

    const connection =
        useQuizConnection({
            quizId,
            isCreator,
            onPlayerNameSet:
                state.setPlayerName,
            onQuestionsLoaded:
                state.setQuestions
        });

    const handleAnswerSubmitError =
        useCallback(() => {
            state.setSelectedAnswerId(null);
            state.setAnswerResult(null);
        }, [
            state.setSelectedAnswerId,
            state.setAnswerResult
        ]);

    const playerActions =
        usePlayerActions({
            quizId,
            currentQuestionOrder:
                state.currentQuestionOrder,
            questions:
                state.questions,
            onAnswerSelected:
                state.setSelectedAnswerId,
            onAnswerSubmitError:
                handleAnswerSubmitError
        });

    const handleAnswerAdded =
        useCallback(
            (
                questionId: string,
                answer: any
            ) => {
                state.addAnswerToQuestion(
                    questionId,
                    answer
                );

                state.setAnswerText("");
                state.setAnswerIsCorrect(false);
                state.setAnswerQuestionId(null);
            },
            [
                state.addAnswerToQuestion,
                state.setAnswerText,
                state.setAnswerIsCorrect,
                state.setAnswerQuestionId
            ]
        );

    const creatorActions =
        useCreatorActions({
            quizId,
            questions:
                state.questions,
            questionText:
                state.questionText,
            answerText:
                state.answerText,
            answerIsCorrect:
                state.answerIsCorrect,
            onQuestionAdded:
                state.addQuestion,
            onQuestionDeleted:
                state.removeQuestion,
            onAnswerAdded:
                handleAnswerAdded,
            onQuizStarted:
                state.resetForQuizStart,
            onNavigate:
                navigate
        });

    const handleQuestionChanged =
        useCallback(
            (order: number) => {
                state.setCurrentQuestionOrder(
                    order
                );

                state.resetForNewQuestion();
            },
            [
                state.setCurrentQuestionOrder,
                state.resetForNewQuestion
            ]
        );

    const handleQuizStarted =
        useCallback(
            (order: number) => {
                state.resetForQuizStart();

                state.setCurrentQuestionOrder(
                    order
                );
            },
            [
                state.resetForQuizStart,
                state.setCurrentQuestionOrder
            ]
        );

    const handleAnswerSubmitted =
        useCallback(
            (
                answerId: string,
                isCorrect: boolean,
                score: number
            ) => {
                state.setSelectedAnswerId(
                    answerId
                );

                state.setAnswerResult(
                    isCorrect
                );

                state.setScore(score);
            },
            [
                state.setSelectedAnswerId,
                state.setAnswerResult,
                state.setScore
            ]
        );

    const handleQuizFinished =
        useCallback(
            (
                leaderboard: LeaderboardEntry[]
            ) => {
                state.setLeaderboard(
                    leaderboard
                );

                state.setIsQuizCompleted(
                    true
                );
            },
            [
                state.setLeaderboard,
                state.setIsQuizCompleted
            ]
        );

    const handleFinishQuiz =
        useCallback(() => {
            state.setIsQuizCompleted(true);
        }, [
            state.setIsQuizCompleted
        ]);

    useSignalRListeners({
        onQuestionCreated:
            state.addQuestion,

        onQuestionChanged:
            handleQuestionChanged,

        onQuizStarted:
            handleQuizStarted,

        onAnswerSubmitted:
            handleAnswerSubmitted,

        onQuizFinished:
            handleQuizFinished
    });

    useEffect(() => {
        let isCancelled = false;

        const initialize = async () => {
            if (isCancelled) {
                return;
            }

            await connection.loadQuestions();

            if (isCancelled) {
                return;
            }

            await connection.initializeConnection();
        };

        initialize();

        return () => {
            isCancelled = true;
        };
    }, [
        quizId,
        isCreator,
        connection
    ]);

    return {
        questions:
            state.questions,

        currentQuestionOrder:
            state.currentQuestionOrder,

        isQuizStarted:
            state.isQuizStarted,

        playerName:
            state.playerName,

        isJoiningQuiz:
            state.isJoiningQuiz,

        selectedAnswerId:
            state.selectedAnswerId,

        answerResult:
            state.answerResult,

        score:
            state.score,

        leaderboard:
            state.leaderboard,

        isQuizCompleted:
            state.isQuizCompleted,

        isStartingQuiz:
            state.isStartingQuiz,

        questionText:
            state.questionText,

        setQuestionText:
            state.setQuestionText,

        answerText:
            state.answerText,

        setAnswerText:
            state.setAnswerText,

        answerIsCorrect:
            state.answerIsCorrect,

        setAnswerIsCorrect:
            state.setAnswerIsCorrect,

        answerQuestionId:
            state.answerQuestionId,

        setAnswerQuestionId:
            state.setAnswerQuestionId,

        handleJoinQuiz:
            connection.handleJoinQuiz,

        handleSelectAnswer:
            playerActions.handleSelectAnswer,

        handleCreateQuestion:
            creatorActions.handleCreateQuestion,

        handleCreateAnswer:
            creatorActions.handleCreateAnswer,

        handleDeleteQuestion:
            creatorActions.handleDeleteQuestion,

        handleDeleteQuiz:
            creatorActions.handleDeleteQuiz,

        handleStartQuiz:
            creatorActions.handleStartQuiz,

        handleNextQuestion:
            creatorActions.handleNextQuestion,

        handleFinishQuiz
    };
}