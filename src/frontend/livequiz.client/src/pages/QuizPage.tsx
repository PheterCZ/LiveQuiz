import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteQuiz } from "../api/quizApi";
import {
    createQuestion,
    deleteQuestion,
    getQuestions
} from "../api/questionApi";
import { createAnswer } from "../api/answerApi";
import type { QuestionDto } from "../types/QuestionDto";

export default function QuizPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<QuestionDto[]>([]);
    const [questionText, setQuestionText] = useState("");

    const [answerText, setAnswerText] = useState("");
    const [answerIsCorrect, setAnswerIsCorrect] = useState(false);
    const [answerQuestionId, setAnswerQuestionId] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        async function loadQuestions(quizId: string) {
            try {
                const result = await getQuestions(quizId);
                setQuestions(result);
            } catch (error) {
                console.error("Failed to load questions:", error);
            }
        }

        loadQuestions(id);
    }, [id]);

    async function handleCreateQuestion(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!id || !questionText.trim()) {
            return;
        }

        try {
            const result = await createQuestion({
                quizId: id,
                text: questionText
            });

            setQuestions((current) => [...current, result]);
            setQuestionText("");
        } catch (error) {
            console.error("Failed to create question:", error);
        }
    }

    async function handleCreateAnswer(questionId: string) {
        if (!answerText.trim()) {
            return;
        }

        try {
            const result = await createAnswer({
                questionId,
                text: answerText,
                isCorrect: answerIsCorrect
            });

            setQuestions((current) =>
                current.map((question) =>
                    question.id === questionId
                        ? {
                              ...question,
                              answers: [...question.answers, result]
                          }
                        : question
                )
            );

            setAnswerText("");
            setAnswerIsCorrect(false);
            setAnswerQuestionId(null);
        } catch (error) {
            console.error("Failed to create answer:", error);
        }
    }

    async function handleDeleteQuestion(questionId: string) {
        try {
            await deleteQuestion(questionId);

            setQuestions((current) =>
                current.filter((question) => question.id !== questionId)
            );
        } catch (error) {
            console.error("Failed to delete question:", error);
        }
    }

    async function handleDelete() {
        if (!id) {
            return;
        }

        try {
            await deleteQuiz(id);
            navigate("/");
        } catch (error) {
            console.error("Failed to delete quiz:", error);
        }
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                        Live Quiz
                    </p>

                    <h1 className="text-3xl font-bold text-gray-800">
                        Quiz overview
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                >
                    Delete Quiz
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Questions
                        </h2>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                            {questions.length}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {questions.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                                No questions yet. Add the first one to your quiz.
                            </div>
                        ) : (
                            questions.map((question) => (
                                <article
                                    key={question.id}
                                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {question.text}
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteQuestion(question.id)
                                            }
                                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {question.answers.length > 0 ? (
                                        <ul className="mt-3 space-y-2">
                                            {question.answers.map((answer) => (
                                                <li
                                                    key={`${question.id}-${answer.text}`}
                                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                                                        answer.isCorrect
                                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                            : "border-gray-200 bg-white text-gray-600"
                                                    }`}
                                                >
                                                    <span>{answer.text}</span>

                                                    {answer.isCorrect && (
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                            Correct
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-3 text-sm text-gray-500">
                                            No answers added yet.
                                        </p>
                                    )}

                                    <div className="mt-4">
                                        {answerQuestionId === question.id ? (
                                            <form
                                                onSubmit={(event) => {
                                                    event.preventDefault();
                                                    handleCreateAnswer(question.id);
                                                }}
                                                className="space-y-2"
                                            >
                                                <div className="flex gap-2">
                                                    <input
                                                        value={answerText}
                                                        onChange={(event) =>
                                                            setAnswerText(
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Answer..."
                                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                    />

                                                    <button
                                                        type="submit"
                                                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                    >
                                                        Add
                                                    </button>
                                                </div>

                                                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={answerIsCorrect}
                                                        onChange={(event) =>
                                                            setAnswerIsCorrect(
                                                                event.target.checked
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />

                                                    <span>Correct answer</span>
                                                </label>
                                            </form>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAnswerQuestionId(
                                                        question.id
                                                    )
                                                }
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                + Add Answer
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">
                        Add Question
                    </h2>

                    <form
                        onSubmit={handleCreateQuestion}
                        className="space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="question"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Question text
                            </label>

                            <textarea
                                id="question"
                                rows={5}
                                value={questionText}
                                onChange={(event) =>
                                    setQuestionText(event.target.value)
                                }
                                placeholder="Type your question..."
                                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Add Question
                        </button>
                    </form>
                </aside>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition hover:bg-green-700"
                >
                    Save Quiz
                </button>
            </div>
        </div>
    );
}

