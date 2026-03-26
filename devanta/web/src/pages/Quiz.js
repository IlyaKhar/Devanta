import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
export function QuizPage() {
    const { moduleId } = useParams();
    return (_jsxs("main", { className: "mx-auto max-w-md p-4", children: [_jsxs("h1", { className: "text-xl font-semibold", children: ["\u041A\u0432\u0438\u0437 \u043C\u043E\u0434\u0443\u043B\u044F #", moduleId] }), _jsx("p", { children: "\u0412\u043E\u043F\u0440\u043E\u0441\u044B \u0441 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u043E\u0439 \u0438 \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u0435\u043C XP." })] }));
}
