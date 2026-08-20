import type { FormEvent } from "react";

type AddQuestionFormProps = {
    questionText: string;
    onQuestionTextChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function AddQuestionForm({
    questionText,
    onQuestionTextChange,
    onSubmit
}: AddQuestionFormProps) {
    return (
        <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Add Question
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
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
                            onQuestionTextChange(event.target.value)
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
    );
}