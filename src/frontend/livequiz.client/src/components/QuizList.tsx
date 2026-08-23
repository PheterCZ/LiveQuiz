import { useEffect, useState } from "react";
import type { QuizDto } from "../types/QuizDto";
import { getQuizzes } from "../api/quizApi";
import { Link } from "react-router-dom";

export default function QuizList() {
    const [quizzes, setQuizzes] = useState<QuizDto[]>([]);

    useEffect(() => {
        const loadQuizzes = async () => {
            try {
                const result = await getQuizzes();
                setQuizzes(result);
            } catch (error) {
                console.error("Failed to load quizzes:", error);
            }
        };

        loadQuizzes();
    }, []);

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <h2 className="mb-6 text-3xl font-bold text-gray-800">
                Quizzes
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                    <Link
                        key={quiz.id}
                        to={`/quiz/${quiz.id}?creator=true`}
                        className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <h3 className="mb-2 text-xl font-semibold text-blue-600">
                            {quiz.title}
                        </h3>

                        <p className="text-gray-600">
                            {quiz.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}