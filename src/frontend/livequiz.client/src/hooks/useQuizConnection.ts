import { useCallback, useMemo } from "react";
import {
    joinQuiz,
    joinHost,
    startSignalR
} from "../services/signalRService";
import { getQuestions } from "../api/questionApi";
import { useTabStorage } from "./useTabStorage";

interface UseQuizConnectionProps {
    quizId: string | undefined;
    isCreator: boolean;
    onPlayerNameSet?: (name: string) => void;
    onQuestionsLoaded?: (questions: any[]) => void;
    onConnectionError?: (error: any) => void;
}

export function useQuizConnection(
    props: UseQuizConnectionProps
) {
    const {
        quizId,
        isCreator,
        onPlayerNameSet,
        onQuestionsLoaded,
        onConnectionError
    } = props;

    const storage = useTabStorage();

    const initializeConnection = useCallback(
        async () => {
            if (!quizId) {
                return;
            }

            try {
                await startSignalR();

                if (isCreator) {
                    const hostToken =
                        storage.getHostToken(quizId);

                    if (!hostToken) {
                        console.error(
                            "Host token could not be found."
                        );
                        return;
                    }

                    await joinHost(
                        quizId,
                        hostToken
                    );

                    console.log(
                        "Joined quiz as host:",
                        quizId
                    );
                } else {
                    const savedPlayerName =
                        storage.getPlayerName(quizId);

                    if (savedPlayerName) {
                        await joinQuiz(
                            quizId,
                            savedPlayerName
                        );

                        onPlayerNameSet?.(
                            savedPlayerName
                        );

                        console.log(
                            "Joined quiz as player:",
                            quizId,
                            savedPlayerName
                        );
                    }
                }
            } catch (error) {
                onConnectionError?.(error);

                console.error(
                    "Failed to initialize quiz connection:",
                    error
                );
            }
        },
        [
            quizId,
            isCreator,
            storage,
            onPlayerNameSet,
            onConnectionError
        ]
    );

    const loadQuestions = useCallback(
        async () => {
            if (!quizId) {
                return;
            }

            try {
                const result =
                    await getQuestions(quizId);

                const sorted =
                    [...result].sort(
                        (a, b) =>
                            a.order - b.order
                    );

                onQuestionsLoaded?.(
                    sorted
                );
            } catch (error) {
                console.error(
                    "Failed to load questions:",
                    error
                );
            }
        },
        [quizId, onQuestionsLoaded]
    );

    const handleJoinQuiz = useCallback(
        async (name: string) => {
            if (!quizId || isCreator) {
                return;
            }

            const trimmedName =
                name.trim();

            if (!trimmedName) {
                return;
            }

            try {
                storage.setPlayerName(
                    quizId,
                    trimmedName
                );

                await joinQuiz(
                    quizId,
                    trimmedName
                );

                onPlayerNameSet?.(
                    trimmedName
                );

                console.log(
                    "Joined quiz as player:",
                    quizId,
                    trimmedName
                );
            } catch (error) {
                storage.clearPlayerName(
                    quizId
                );

                console.error(
                    "Failed to join quiz:",
                    error
                );

                throw error;
            }
        },
        [
            quizId,
            isCreator,
            storage,
            onPlayerNameSet
        ]
    );

    return useMemo(
        () => ({
            initializeConnection,
            loadQuestions,
            handleJoinQuiz
        }),
        [
            initializeConnection,
            loadQuestions,
            handleJoinQuiz
        ]
    );
}