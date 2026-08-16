import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import CreateQuizPage from "./pages/CreateQuizPage";
import QuizPage from "./pages/QuizPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/create" element={<CreateQuizPage />} />
                    <Route path="/quiz/:id" element={<QuizPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}