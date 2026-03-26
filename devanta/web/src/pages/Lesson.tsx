import { useParams } from "react-router-dom";

export function LessonPage() {
  const { id } = useParams();
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Урок #{id}</h1>
      <p>Теория + кнопка перехода к практике.</p>
    </main>
  );
}
