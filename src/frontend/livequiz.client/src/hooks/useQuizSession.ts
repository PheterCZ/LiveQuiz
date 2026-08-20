import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { createAnswer } from "../api/answerApi";
import {
    deleteQuestion,
    getQuestions,
    createQuestion
} from "../api/questionApi";
import { deleteQuiz } from "../api/quizApi";
import type { QuestionDto } from "../types/QuestionDto";
import {
    connection,
    joinQuiz,
    startSignalR,
    startQuiz
} from "../services/signalRService";

export default function useQuizSession(navigate: (to: string) => void) {
    const { id } = useParams();

    const [questions, setQuestions] = useState<QuestionDto[]>([]);
    const [questionText, setQuestionText] = useState("");
    const [answerText, setAnswerText] = useState("");
    const [answerIsCorrect, setAnswerIsCorrect] = useState(false);
    const [answerQuestionId, setAnswerQuestionId] = useState<string | null>(
        null
    );

    const addQuestionToState = (question: QuestionDto) => {
        setQuestions((current) => {
            const alreadyExists = current.some(
                (currentQuestion) => currentQuestion.id === question.id
            );

            if (alreadyExists) {
                return current;
            }

            return [...current, question];
        });
    };

    useEffect(() => {
        if (!id) {
            return;
        }

        const loadQuestions = async () => {
            try {
                const result = await getQuestions(id);
                setQuestions(result);
            } catch (error) {
                console.error("Failed to load questions:", error);
            }
        };

        const connectToQuiz = async () => {
            try {
                await startSignalR();

                connection.off("UserJoined");

                connection.on("UserJoined", (connectionId: string) => {
                    console.log("User joined:", connectionId);
                });

                connection.off("QuestionCreated");

                connection.on("QuestionCreated", (question: QuestionDto) => {
                    console.log("Question created:", question);
                    addQuestionToState(question);
                });

                connection.off("QuizStarted");

                connection.on("QuizStarted", () => {
                    console.log("QUIZ STARTED!");
                });

                await joinQuiz(id);

                console.log("Joined quiz:", id);
            } catch (error) {
                console.error("Failed to join quiz:", error);
            }
        };

        loadQuestions();
        connectToQuiz();

        return () => {
            connection.off("UserJoined");
            connection.off("QuestionCreated");
            connection.off("QuizStarted");
        };
    }, [id]);

    const handleCreateQuestion = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!id || !questionText.trim()) {
            return;
        }

        try {
            const result = await createQuestion({
                quizId: id,
                text: questionText
            });

            addQuestionToState(result);
            setQuestionText("");
        } catch (error) {
            console.error("Failed to create question:", error);
        }
    };

    const handleCreateAnswer = async (questionId: string) => {
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
    };

    const handleDeleteQuestion = async (questionId: string) => {
        try {
            await deleteQuestion(questionId);

            setQuestions((current) =>
                current.filter((question) => question.id !== questionId)
            );
        } catch (error) {
            console.error("Failed to delete question:", error);
        }
    };

    const handleDeleteQuiz = async () => {
        if (!id) {
            return;
        }

        try {
            await deleteQuiz(id);
            navigate("/");
        } catch (error) {
            console.error("Failed to delete quiz:", error);
        }
    };

    const handleStartQuiz = async () => {
        if (!id) {
            return;
        }

        try {
            await startQuiz(id);

            console.log("Quiz started successfully");
        } catch (error) {
            console.error("Failed to start quiz:", error);
        }
    };

    return {
        questions,
        questionText,
        setQuestionText,
        answerText,
        setAnswerText,
        answerIsCorrect,
        setAnswerIsCorrect,
        answerQuestionId,
        setAnswerQuestionId,
        handleCreateQuestion,
        handleCreateAnswer,
        handleDeleteQuestion,
        handleDeleteQuiz,
        handleStartQuiz
    };
}