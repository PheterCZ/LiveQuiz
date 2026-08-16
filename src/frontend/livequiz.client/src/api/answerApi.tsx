import type { AnswerDto } from "../types/AnswerDto";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error("VITE_API_URL is not defined");
}

export async function createAnswer(
    answer: AnswerDto
): Promise<AnswerDto> {
    const response = await fetch(`${API_URL}/Answer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(answer)
    });

    if (!response.ok) {
        throw new Error(`Failed to create answer: ${response.status}`);
    }

    return await response.json();
}

export async function getAnswers(
    questionId: string
): Promise<AnswerDto[]> {
    const response = await fetch(
        `${API_URL}/Answer/question/${questionId}`
    );

    if (!response.ok) {
        throw new Error(`Failed to get answers: ${response.status}`);
    }

    return await response.json();
}