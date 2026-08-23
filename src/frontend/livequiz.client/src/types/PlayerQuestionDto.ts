import type { PlayerAnswerDto } from "./PlayerAnswerDto";

export interface PlayerQuestionDto {
    id: string;
    text: string;
    order: number;
    answers: PlayerAnswerDto[];
}