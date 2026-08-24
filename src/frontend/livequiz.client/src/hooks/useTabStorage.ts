import { useCallback, useMemo } from "react";

export function useTabStorage() {
    const getTabId = useCallback(() => {
        const tabId =
            sessionStorage.getItem("livequiz-tab-id") ??
            crypto.randomUUID();

        sessionStorage.setItem(
            "livequiz-tab-id",
            tabId
        );

        return tabId;
    }, []);

    const getKey = useCallback(
        (prefix: string, quizId: string) => {
            return `${prefix}-${quizId}-${getTabId()}`;
        },
        [getTabId]
    );

    const getHostToken = useCallback(
        (quizId: string) => {
            return sessionStorage.getItem(
                getKey("quiz-host-token", quizId)
            );
        },
        [getKey]
    );

    const setHostToken = useCallback(
        (quizId: string, token: string) => {
            sessionStorage.setItem(
                getKey("quiz-host-token", quizId),
                token
            );
        },
        [getKey]
    );

    const getPlayerName = useCallback(
        (quizId: string) => {
            return sessionStorage.getItem(
                getKey("quiz-player-name", quizId)
            );
        },
        [getKey]
    );

    const setPlayerName = useCallback(
        (quizId: string, name: string) => {
            sessionStorage.setItem(
                getKey("quiz-player-name", quizId),
                name
            );
        },
        [getKey]
    );

    const clearPlayerName = useCallback(
        (quizId: string) => {
            sessionStorage.removeItem(
                getKey("quiz-player-name", quizId)
            );
        },
        [getKey]
    );

    const clearHostToken = useCallback(
        (quizId: string) => {
            sessionStorage.removeItem(
                getKey("quiz-host-token", quizId)
            );
        },
        [getKey]
    );

    const isCreatorStored = useCallback(
        (quizId: string) => {
            return (
                sessionStorage.getItem(
                    getKey("quiz-host-creator", quizId)
                ) === "true"
            );
        },
        [getKey]
    );

    return useMemo(
        () => ({
            getKey,
            getHostToken,
            setHostToken,
            getPlayerName,
            setPlayerName,
            clearPlayerName,
            clearHostToken,
            isCreatorStored
        }),
        [
            getKey,
            getHostToken,
            setHostToken,
            getPlayerName,
            setPlayerName,
            clearPlayerName,
            clearHostToken,
            isCreatorStored
        ]
    );
}