import { useParams } from "react-router-dom";

export function QuizPage() {
  const { moduleId } = useParams();
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Квиз модуля #{moduleId}</h1>
      <p>Вопросы с проверкой и начислением XP.</p>
    </main>
  );
}
