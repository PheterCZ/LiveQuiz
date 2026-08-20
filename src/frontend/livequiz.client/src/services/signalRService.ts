import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel
} from "@microsoft/signalr";

const SIGNALR_URL = import.meta.env.VITE_SIGNALR_URL;

if (!SIGNALR_URL) {
    throw new Error("VITE_SIGNALR_URL is not defined");
}

export const connection: HubConnection =
    new HubConnectionBuilder()
        .withUrl(SIGNALR_URL)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

let connectionPromise: Promise<void> | null = null;

export async function startSignalR(): Promise<void> {
    if (connection.state === HubConnectionState.Connected) {
        return;
    }

    if (connectionPromise) {
        await connectionPromise;
        return;
    }

    connectionPromise = connection.start();

    try {
        await connectionPromise;
        console.log("SignalR connected");
    } finally {
        connectionPromise = null;
    }
}

export async function joinQuiz(quizId: string): Promise<void> {
    await startSignalR();

    if (connection.state !== HubConnectionState.Connected) {
        throw new Error("SignalR failed to connect");
    }

    await connection.invoke("JoinQuiz", quizId);

    console.log("Joined quiz:", quizId);
}

export async function startQuiz(quizId: string): Promise<void> {
    await startSignalR();

    if (connection.state !== HubConnectionState.Connected) {
        throw new Error("SignalR failed to connect");
    }

    await connection.invoke("StartQuiz", quizId);

    console.log("Quiz started:", quizId);
}