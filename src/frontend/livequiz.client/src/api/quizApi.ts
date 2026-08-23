import type { QuizDto } from "../types/QuizDto";
import type { CreateQuizDto } from "../types/CreateQuizDto";
import type { CreatedQuizDto } from "../types/CreatedQuizDto";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error("VITE_API_URL is not defined");
}

export async function createQuiz(
    quiz: CreateQuizDto
): Promise<CreatedQuizDto> {
    const response = await fetch(`${API_URL}/Quiz`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(quiz)
    });

    if (!response.ok) {
        throw new Error(`Failed to create quiz: ${response.status}`);
    }

    const data: CreatedQuizDto = await response.json();

    if (!data) {
        throw new Error("API returned no quiz");
    }

    return data;
}

export async function getQuizzes(): Promise<QuizDto[]> {
    const response = await fetch(`${API_URL}/Quiz/all`);

    if (!response.ok) {
        throw new Error(`Failed to get quizzes: ${response.status}`);
    }

    const data: QuizDto[] = await response.json();

    if (!data) {
        throw new Error("API returned no quizzes");
    }

    return data;
}

export async function deleteQuiz(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/Quiz/${id}`, {
        method: "DELETE"
    });

    if (response.status === 404) {
        return;
    }

    if (!response.ok) {
        throw new Error("Failed to delete quiz.");
    }
}