import type { QuestionDto } from "../types/QuestionDto";
import type { CreateQuestionDto } from "../types/CreateQuestionDto";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error("VITE_API_URL is not defined");
}

export async function getQuestions(
    quizId: string
): Promise<QuestionDto[]> {
    const response = await fetch(`${API_URL}/Question/quiz/${quizId}`);

    if (!response.ok) {
        throw new Error(`Failed to get questions: ${response.status}`);
    }

    return await response.json();
}

export async function createQuestion(
    question: CreateQuestionDto
): Promise<QuestionDto> {
    const response = await fetch(`${API_URL}/Question`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(question)
    });

    if (!response.ok) {
        throw new Error(`Failed to create question: ${response.status}`);
    }

    return await response.json();
}

export async function deleteQuestion(questionId: string): Promise<void> {
    const response = await fetch(`${API_URL}/Question/${questionId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error(`Failed to delete question: ${response.status}`);
    }
}