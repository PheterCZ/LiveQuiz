import { useState, type FormEvent } from "react";
import { createQuiz } from "../api/quizApi";
import { useNavigate } from "react-router-dom";

export default function QuizForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Title is required.");
            return;
        }

        if (!description.trim()) {
            setError("Description is required.");
            return;
        }

        setError("");

        const quiz = {
            title,
            description
        };

        try {
            const result = await createQuiz(quiz);

            console.log("Quiz created:", result);
            setTitle("");
            setDescription("");

            navigate("/");
        } catch (error) {
            console.error("Failed to create quiz:", error);
            setError("Failed to create quiz.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-lg space-y-6 rounded-xl bg-white p-8 shadow-lg"
        >
            <div>
                <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Title
                </label>

                <input
                    id="title"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>

            <div>
                <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </div>

            <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Create Quiz
            </button>

            {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}
        </form>
    );
}