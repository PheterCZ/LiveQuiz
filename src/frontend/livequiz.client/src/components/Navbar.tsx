import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="bg-gray-900 px-6 py-4">
            <div className="mx-auto flex max-w-5xl items-center justify-between">
                <Link to="/" className="text-xl font-bold text-white">
                    LiveQuiz
                </Link>

                <div className="flex gap-6">
                    <Link
                        to="/"
                        className="text-gray-300 transition hover:text-white"
                    >
                        Home
                    </Link>

                    <Link
                        to="/create"
                        className="text-gray-300 transition hover:text-white"
                    >
                        Add Quiz
                    </Link>
                </div>
            </div>
        </nav>
    );
}