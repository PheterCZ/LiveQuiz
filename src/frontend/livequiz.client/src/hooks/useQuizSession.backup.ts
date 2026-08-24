import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTabStorage } from "./useTabStorage";
import { useQuizState, type LeaderboardEntry } from "./useQuizState";
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
    const connection = useQuizConnection({
        quizId,
        isCreator: providedIsCreator || (!!quizId && storage.isCreatorStored(quizId)),
        onPlayerNameSet: state.setPlayerName,
        onQuestionsLoaded: state.setQuestions
    });

    const isCreator = providedIsCreator || (!!quizId && storage.isCreatorStored(quizId));

    const playerActions = usePlayerActions({
        quizId,
        currentQuestionOrder: state.currentQuestionOrder,
        questions: state.questions,
        onAnswerSelected: state.setSelectedAnswerId,
        onAnswerSubmitError: () => {
            state.setSelectedAnswerId(null);
            state.setAnswerResult(null);
        }
    });

    const creatorActions = useCreatorActions({
        quizId,
        questions: state.questions,
        questionText: state.questionText,
        answerText: state.answerText,
        answerIsCorrect: state.answerIsCorrect,
        onQuestionAdded: state.addQuestion,
        onQuestionDeleted: state.removeQuestion,
        onAnswerAdded: (qId, answer) => {
            state.addAnswerToQuestion(qId, answer);
            state.setAnswerText("");
            state.setAnswerIsCorrect(false);
            state.setAnswerQuestionId(null);
        },
        onQuizStarted: state.resetForQuizStart,
        onNavigate: navigate
    });

    useSignalRListeners({
        onQuestionCreated: state.addQuestion,
        onQuestionChanged: (order) => {
            state.setCurrentQuestionOrder(order);
            state.resetForNewQuestion();
        },
        onQuizStarted: (order) => {
            state.resetForQuizStart();
            state.setCurrentQuestionOrder(order);
        },
        onAnswerSubmitted: (answerId, isCorrect, score) => {
            state.setSelectedAnswerId(answerId);
            state.setAnswerResult(isCorrect);
            state.setScore(score);
        },
        onQuizFinished: (leaderboard) => {
            state.setLeaderboard(leaderboard);
            state.setIsQuizCompleted(true);
        }
    });

    useEffect(() => {
        let isCancelled = false;

        (async () => {
            await connection.loadQuestions();
            await connection.initializeConnection();
        })();

        return () => {
            isCancelled = true;
        };
    }, [quizId, isCreator, connection]);

    return {
        questions: state.questions,
        currentQuestionOrder: state.currentQuestionOrder,
        isQuizStarted: state.isQuizStarted,
        playerName: state.playerName,
        isJoiningQuiz: state.isJoiningQuiz,
        selectedAnswerId: state.selectedAnswerId,
        answerResult: state.answerResult,
        score: state.score,
        leaderboard: state.leaderboard,
        isQuizCompleted: state.isQuizCompleted,
        isStartingQuiz: state.isStartingQuiz,

        questionText: state.questionText,
        setQuestionText: state.setQuestionText,
        answerText: state.answerText,
        setAnswerText: state.setAnswerText,
        answerIsCorrect: state.answerIsCorrect,
        setAnswerIsCorrect: state.setAnswerIsCorrect,
        answerQuestionId: state.answerQuestionId,
        setAnswerQuestionId: state.setAnswerQuestionId,

        handleJoinQuiz: connection.handleJoinQuiz,
        handleSelectAnswer: playerActions.handleSelectAnswer,

        handleCreateQuestion: creatorActions.handleCreateQuestion,
        handleCreateAnswer: creatorActions.handleCreateAnswer,
        handleDeleteQuestion: creatorActions.handleDeleteQuestion,
        handleDeleteQuiz: creatorActions.handleDeleteQuiz,
        handleStartQuiz: creatorActions.handleStartQuiz,
        handleNextQuestion: creatorActions.handleNextQuestion,

        handleFinishQuiz: () => state.setIsQuizCompleted(true)
    };
}
