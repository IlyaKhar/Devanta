import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
export function LessonPage() {
    const { id } = useParams();
    return (_jsxs("main", { className: "mx-auto max-w-md p-4", children: [_jsxs("h1", { className: "text-xl font-semibold", children: ["\u0423\u0440\u043E\u043A #", id] }), _jsx("p", { children: "\u0422\u0435\u043E\u0440\u0438\u044F + \u043A\u043D\u043E\u043F\u043A\u0430 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430 \u043A \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0435." })] }));
}
