import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel
} from "@microsoft/signalr";

const SIGNALR_URL =
    import.meta.env.VITE_SIGNALR_URL;

if (!SIGNALR_URL) {
    throw new Error(
        "VITE_SIGNALR_URL is not defined"
    );
}

export const connection: HubConnection =
    new HubConnectionBuilder()
        .withUrl(SIGNALR_URL)
        .configureLogging(
            LogLevel.Information
        )
        .withAutomaticReconnect()
        .build();

let connectionPromise:
    Promise<void> | null = null;

export async function startSignalR(): Promise<void> {
    if (
        connection.state ===
        HubConnectionState.Connected
    ) {
        return;
    }

    if (connectionPromise) {
        await connectionPromise;
        return;
    }

    connectionPromise =
        connection.start();

    try {
        await connectionPromise;

        console.log(
            "SignalR connected"
        );
    } finally {
        connectionPromise = null;
    }
}

export async function joinQuiz(
    quizId: string,
    playerName: string
): Promise<void> {
    await startSignalR();

    if (
        connection.state !==
        HubConnectionState.Connected
    ) {
        throw new Error(
            "SignalR failed to connect"
        );
    }

    await connection.invoke(
        "JoinQuiz",
        quizId,
        playerName
    );

    console.log(
        "Joined quiz:",
        quizId
    );
}

export async function joinHost(
    quizId: string,
    hostToken: string
): Promise<void> {
    await startSignalR();

    if (
        connection.state !==
        HubConnectionState.Connected
    ) {
        throw new Error(
            "SignalR failed to connect"
        );
    }

    await connection.invoke(
        "JoinHost",
        quizId,
        hostToken
    );

    console.log(
        "Joined quiz as host:",
        quizId
    );
}

export async function startQuiz(
    quizId: string,
    hostToken: string
): Promise<void> {
    await startSignalR();

    if (
        connection.state !==
        HubConnectionState.Connected
    ) {
        throw new Error(
            "SignalR failed to connect"
        );
    }

    await connection.invoke(
        "StartQuiz",
        quizId,
        hostToken
    );

    console.log(
        "Quiz started:",
        quizId
    );
}

export async function nextQuestion(
    quizId: string,
    questionOrder: number
): Promise<void> {
    await startSignalR();

    if (
        connection.state !==
        HubConnectionState.Connected
    ) {
        throw new Error(
            "SignalR failed to connect"
        );
    }

    await connection.invoke(
        "NextQuestion",
        quizId,
        questionOrder
    );

    console.log(
        "Next question:",
        questionOrder
    );
}

export async function submitAnswer(
    quizId: string,
    questionId: string,
    answerId: string
): Promise<void> {
    await startSignalR();

    if (
        connection.state !==
        HubConnectionState.Connected
    ) {
        throw new Error(
            "SignalR failed to connect"
        );
    }

    await connection.invoke(
        "SubmitAnswer",
        quizId,
        questionId,
        answerId
    );

    console.log(
        "Answer submitted:",
        answerId
    );
}