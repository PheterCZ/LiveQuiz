
import { useState, type FormEvent } from "react";

interface PlayerJoinFormProps {
    onJoin: (playerName: string) => void;
}

export default function PlayerJoinForm({
    onJoin
}: PlayerJoinFormProps) {
    const [playerName, setPlayerName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!playerName.trim()) {
            setError("Zadej svoje jméno.");
            return;
        }

        setError("");

        onJoin(playerName.trim());
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-lg"
        >
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Připojit se ke kvízu
            </h2>

            <p className="mb-6 text-gray-500">
                Zadej svoje jméno.
            </p>

            <input
                type="text"
                value={playerName}
                onChange={(event) =>
                    setPlayerName(event.target.value)
                }
                placeholder="Tvoje jméno"
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
                Připojit se
            </button>

            {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}
        </form>
    );
}