import { useParams } from "react-router-dom";

export function TaskPage() {
  const { id } = useParams();
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Задание #{id}</h1>
      <p>Интерактивная практика + подсказка от Макса.</p>
    </main>
  );
}
