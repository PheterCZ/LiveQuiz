import type { QuestionDto } from "./QuestionDto";

export interface QuizDto {
    id: string;
    title: string;
    createdAt: string;
    description: string;
    questions: QuestionDto[];
}