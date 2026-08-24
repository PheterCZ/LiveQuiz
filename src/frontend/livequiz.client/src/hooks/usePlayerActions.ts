import { useCallback } from "react";
import { submitAnswer } from "../services/signalRService";
import type { QuestionDto } from "../types/QuestionDto";

interface UsePlayerActionsProps {
    quizId: string | undefined;
    currentQuestionOrder: number | null;
    questions: QuestionDto[];
    onAnswerSelected?: (answerId: string) => void;
    onAnswerSubmitError?: (error: any) => void;
}


export function usePlayerActions(props: UsePlayerActionsProps) {
    const {
        quizId,
        currentQuestionOrder,
        questions,
        onAnswerSelected,
        onAnswerSubmitError
    } = props;

    const handleSelectAnswer = useCallback(
        async (answerId: string) => {
            if (!quizId || currentQuestionOrder === null) {
                return;
            }

            const currentQuestion = questions.find(
                (q) => q.order === currentQuestionOrder
            );

            if (!currentQuestion) {
                return;
            }

            try {
                onAnswerSelected?.(answerId);
                await submitAnswer(quizId, currentQuestion.id, answerId);
            } catch (error) {
                onAnswerSubmitError?.(error);
                console.error("Failed to submit answer:", error);
            }
        },
        [quizId, currentQuestionOrder, questions, onAnswerSelected, onAnswerSubmitError]
    );

    return {
        handleSelectAnswer
    };
}
