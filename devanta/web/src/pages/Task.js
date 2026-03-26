import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useParams } from "react-router-dom";
export function TaskPage() {
    const { id } = useParams();
    return (_jsxs("main", { className: "mx-auto max-w-md p-4", children: [_jsxs("h1", { className: "text-xl font-semibold", children: ["\u0417\u0430\u0434\u0430\u043D\u0438\u0435 #", id] }), _jsx("p", { children: "\u0418\u043D\u0442\u0435\u0440\u0430\u043A\u0442\u0438\u0432\u043D\u0430\u044F \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 + \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430 \u043E\u0442 \u041C\u0430\u043A\u0441\u0430." })] }));
}
