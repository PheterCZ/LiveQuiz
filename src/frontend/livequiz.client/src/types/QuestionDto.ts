import type { AnswerDto } from "./AnswerDto";

export interface QuestionDto {
    id: string;
    text: string;
    answers: AnswerDto[];
}