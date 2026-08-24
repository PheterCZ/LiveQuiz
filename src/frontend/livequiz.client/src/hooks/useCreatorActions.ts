import { useCallback } from "react";
import {
    createQuestion,
    deleteQuestion,
    getQuestions
} from "../api/questionApi";
import { createAnswer } from "../api/answerApi";
import { deleteQuiz } from "../api/quizApi";
import { startQuiz, nextQuestion } from "../services/signalRService";
import { useTabStorage } from "./useTabStorage";
import type { QuestionDto } from "../types/QuestionDto";

interface UseCreatorActionsProps {
    quizId: string | undefined;
    questions: QuestionDto[];
    questionText: string;
    answerText: string;
    answerIsCorrect: boolean;
    onQuestionAdded?: (question: QuestionDto) => void;
    onQuestionDeleted?: (questionId: string) => void;
    onAnswerAdded?: (questionId: string, answer: any) => void;
    onQuizStarted?: () => void;
    onNavigate?: (path: string) => void;
}


export function useCreatorActions(props: UseCreatorActionsProps) {
    const {
        quizId,
        questions,
        questionText,
        answerText,
        answerIsCorrect,
        onQuestionAdded,
        onQuestionDeleted,
        onAnswerAdded,
        onQuizStarted,
        onNavigate
    } = props;

    const storage = useTabStorage();

    const handleCreateQuestion = useCallback(
        async (event: any) => {
            event.preventDefault();

            if (!quizId || !questionText.trim()) {
                return;
            }

            try {
                const result = await createQuestion({
                    quizId,
                    text: questionText
                });

                onQuestionAdded?.(result);
            } catch (error) {
                console.error("Failed to create question:", error);
            }
        },
        [quizId, questionText, onQuestionAdded]
    );

    const handleCreateAnswer = useCallback(
        async (questionId: string) => {
            if (!answerText.trim()) {
                return;
            }

            try {
                const result = await createAnswer({
                    questionId,
                    text: answerText,
                    isCorrect: answerIsCorrect
                });

                onAnswerAdded?.(questionId, result);
            } catch (error) {
                console.error("Failed to create answer:", error);
            }
        },
        [answerText, answerIsCorrect, onAnswerAdded]
    );

    const handleDeleteQuestion = useCallback(
        async (questionId: string) => {
            try {
                await deleteQuestion(questionId);
                onQuestionDeleted?.(questionId);
            } catch (error) {
                console.error("Failed to delete question:", error);
            }
        },
        [onQuestionDeleted]
    );

    const handleDeleteQuiz = useCallback(async () => {
        if (!quizId) {
            return;
        }

        try {
            await deleteQuiz(quizId);
            storage.clearHostToken(quizId);
            storage.clearPlayerName(quizId);
            onNavigate?.("/");
        } catch (error) {
            console.error("Failed to delete quiz:", error);
        }
    }, [quizId, storage, onNavigate]);

    const handleStartQuiz = useCallback(async () => {
        if (!quizId) {
            return;
        }

        const hostToken = storage.getHostToken(quizId);
        if (!hostToken) {
            console.error("Host token not found.");
            return;
        }

        try {
            const result = await getQuestions(quizId);
            const loadedQuestions = [...result].sort((a, b) => a.order - b.order);

            if (loadedQuestions.length === 0) {
                console.error("Cannot start quiz without questions.");
                return;
            }

            await startQuiz(quizId, hostToken);
            onQuizStarted?.();
        } catch (error) {
            console.error("Failed to start quiz:", error);
        }
    }, [quizId, storage, onQuizStarted]);

    const handleNextQuestion = useCallback(async () => {
        if (!quizId || questions.length === 0) {
            return;
        }

        try {
            const sortedOrders = questions.map((q) => q.order).sort((a, b) => a - b);
            const nextOrder = sortedOrders[0];

            await nextQuestion(quizId, nextOrder);
        } catch (error) {
            console.error("Failed to move to next question:", error);
        }
    }, [quizId, questions]);

    return {
        handleCreateQuestion,
        handleCreateAnswer,
        handleDeleteQuestion,
        handleDeleteQuiz,
        handleStartQuiz,
        handleNextQuestion
    };
}
