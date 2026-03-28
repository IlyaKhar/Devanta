package database

import (
	"encoding/json"
	"fmt"
	"strings"

	"devanta/backend/internal/models"
)

// trackFromModuleTitle — какой трек контента по названию модуля из сида.
func trackFromModuleTitle(title string) string {
	t := strings.ToLower(title)
	if strings.Contains(t, "python") {
		return "py"
	}
	if strings.Contains(t, "веб") {
		return "web"
	}
	return "js"
}

func trackLabel(track string) string {
	switch track {
	case "py":
		return "Python"
	case "web":
		return "веб-разработки (HTML/CSS и логика в браузере)"
	default:
		return "JavaScript"
	}
}

var blockTopics = []string{
	"Старт и мышление программиста",
	"Переменные, типы и ввод-вывод",
	"Условия и ветвление",
	"Циклы и повторение",
	"Функции и переиспользование",
	"Коллекции: массивы и объекты",
	"Строки и текст",
	"Область видимости и структура кода",
	"Ошибки и отладка",
	"Мини-проект и обзор блока",
}

func pickVideo(track string, seed int) string {
	pools := map[string][]string{
		"js": {
			"https://www.youtube.com/embed/W6NZfCO5SIk",
			"https://www.youtube.com/embed/hdI2bqOjy3c",
			"https://www.youtube.com/embed/PkZNo7MFNFg",
			"https://www.youtube.com/embed/jS4aFq5P91A",
		},
		"py": {
			"https://www.youtube.com/embed/rfscVS0vtbw",
			"https://www.youtube.com/embed/t8pPdKYpowI",
			"https://www.youtube.com/embed/kqtD5dpn9C8",
		},
		"web": {
			"https://www.youtube.com/embed/pQN-pnXPaVg",
			"https://www.youtube.com/embed/UB1O30fR-EE",
			"https://www.youtube.com/embed/1PnVor36_40",
		},
	}
	arr := pools[track]
	if len(arr) == 0 {
		arr = pools["js"]
	}
	if seed < 0 {
		seed = -seed
	}
	return arr[seed%len(arr)]
}

// DemoLessonContent — заголовок, YouTube embed URL, теория для урока по sort_order (1..31).
func DemoLessonContent(moduleTitle string, sortOrder int) (title string, videoURL string, content string) {
	track := trackFromModuleTitle(moduleTitle)
	if sortOrder >= 31 {
		videoURL = pickVideo(track, 99)
		title = "Итог модуля: чек-лист и выпуск"
		content = fmt.Sprintf(`Финальное занятие курса «%s» (трек: %s).

Просмотри видео ещё раз как шпаргалку, затем пройди тест по блоку 11 (итог) если откроешь его из последнего урока — и обязательно сдай финальную задачу с функцией moduleDone(): она символизирует «я закрыл модуль».

На платформе проверка кода идёт через движок JavaScript — в треках Python и Веб ты пишешь JS, но сопоставляешь идеи с тем языком/стеком, который изучаешь словами в теории.

%s`, moduleTitle, trackLabel(track), finalTheoryExtra(moduleTitle, track))
		return title, videoURL, content
	}
	block := (sortOrder-1)/3 + 1
	sub := (sortOrder-1)%3 + 1
	topic := blockTopics[block-1]
	title = fmt.Sprintf("Блок %d · %s — урок %d", block, topic, sub)
	videoURL = pickVideo(track, sortOrder+block*7)
	subHints := []string{
		"Сфокусируйся на терминах: выпиши 3 новых слова и определения.",
		"Повтори пример из видео вслух и перескажи своими словами.",
		"Составь мини-план: что применишь в задаче этого блока.",
	}[sub-1]
	detail := lessonTheoryDetail(track, sortOrder)
	content = fmt.Sprintf(`Курс: %s · Технологический трек: %s

%s

Блок %d из 10. Тема: «%s». Это шаг %d из 3 внутри блока.

%s

———
Теория этого урока (уникальный фокус):
%s
———

%s

Дальше по пайплайну: «Тест» — квиз этого урока (block=%d, lesson=%d); «Задание» — своя задача с кодом.`,
		moduleTitle, trackLabel(track), subHints, block, topic, sub, detail, blockNarrative(track, block), block, sub)
	return title, videoURL, content
}

func blockNarrative(track string, block int) string {
	t := trackLabel(track)
	switch block {
	case 1:
		return fmt.Sprintf("Знакомимся со средой и тем, как компьютер исполняет инструкции. Для трека «%s» важно понять, где живёт код и как ты получаешь обратную связь.", t)
	case 2:
		return "Данные — сердце программы: числа, строки, логика сравнения. Сравни, как это выглядит в твоём треке и в JS на платформе."
	case 3:
		return "Условия позволяют программе принимать решения: разные ветки для разных ситуаций."
	case 4:
		return "Циклы экономят время: повторяем действия, пока выполняется условие или пока не обойдём коллекцию."
	case 5:
		return "Функции упаковывают логику с именем и параметрами — меньше копипаста, проще тестировать."
	case 6:
		return "Массивы и объекты (или их аналоги) — как хранить много значений и структурировать сущности."
	case 7:
		return "Текст везде: пароли, ники, URL. Разберись с конкатенацией, длиной и типичными операциями."
	case 8:
		return "Область видимости решает, где переменная «жива» — это спасает от загадочных багов."
	case 9:
		return "Ошибки неизбежны: учимся читать сообщения, локализовать строку и проверять предположения."
	default:
		return fmt.Sprintf("Сводка блоков 1–9 и мостик к итогу модуля. Закрепи связку теории %s с практическими шагами платформы.", t)
	}
}

type codeTaskSeed struct {
	Title       string
	Question    string
	StarterCode string
	HintsJSON   string
	ChecksJSON  string
	XPReward    int
}

// DemoCodeTaskForBlock — одна задача с кодом на блок (первый урок блока).
func DemoCodeTaskForBlock(moduleTitle string, block int) codeTaskSeed {
	track := trackFromModuleTitle(moduleTitle)
	xp := 60 + block*15
	prefix := ""
	switch track {
	case "py":
		prefix = "[Трек Python — пишем решение на JS, как на платформе] "
	case "web":
		prefix = "[Трек Веб — логика на JS, разметка/стили в теории] "
	}
	switch block {
	case 1:
		h, _ := json.Marshal([]string{"Функция называется sum.", "return a + b;"})
		c, _ := json.Marshal([]string{"sum(2, 3) === 5", "sum(-1, 1) === 0", "sum(0, 0) === 0", "sum(100, -50) === 50"})
		return codeTaskSeed{
			Title:       "Практика блока 1: сумма двух чисел",
			Question:    prefix + "Напиши функцию sum(a, b), возвращающую сумму. Язык проверки: JavaScript.",
			StarterCode: "function sum(a, b) {\n  // верни сумму\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	case 2:
		h, _ := json.Marshal([]string{"Имя функции: mult", "return a * b;"})
		c, _ := json.Marshal([]string{"mult(3, 4) === 12", "mult(0, 9) === 0", "mult(-2, 5) === -10"})
		return codeTaskSeed{
			Title:       "Практика блока 2: произведение",
			Question:    prefix + "Функция mult(a, b) — произведение двух чисел.",
			StarterCode: "function mult(a, b) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	case 3:
		h, _ := json.Marshal([]string{"Используй оператор %", "Чётность: n % 2 === 0"})
		c, _ := json.Marshal([]string{"isEven(4) === true", "isEven(7) === false", "isEven(0) === true"})
		return codeTaskSeed{
			Title:       "Практика блока 3: чётное число",
			Question:    prefix + "Функция isEven(n) возвращает true, если n чётное.",
			StarterCode: "function isEven(n) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	case 4:
		h, _ := json.Marshal([]string{"Math.abs для модуля", "return Math.abs(a - b);"})
		c, _ := json.Marshal([]string{"absDiff(3, 10) === 7", "absDiff(10, 3) === 7", "absDiff(-2, -2) === 0"})
		return codeTaskSeed{
			Title:       "Практика блока 4: модуль разности",
			Question:    prefix + "Функция absDiff(a, b) возвращает |a - b|.",
			StarterCode: "function absDiff(a, b) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	case 5:
		h, _ := json.Marshal([]string{"Склей строку: 'Привет, ' + name", "Не забудь запятую и пробел как в тесте"})
		c, _ := json.Marshal([]string{`greet("Аня") === "Привет, Аня"`, `greet("Мир") === "Привет, Мир"`})
		return codeTaskSeed{
			Title:       "Практика блока 5: приветствие",
			Question:    prefix + `Функция greet(name) возвращает строку ровно "Привет, " + name (как в тестах).`,
			StarterCode: "function greet(name) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	case 6:
		h, _ := json.Marshal([]string{"Сравни a и b", "return большее из двух"})
		c, _ := json.Marshal([]string{"maxOfTwo(3, 9) === 9", "maxOfTwo(9, 3) === 9", "maxOfTwo(-1, -5) === -1"})
		return codeTaskSeed{
			Title:       "Практика блока 6: максимум из двух",
			Question:    prefix + "Функция maxOfTwo(a, b) возвращает большее число.",
			StarterCode: "function maxOfTwo(a, b) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	case 7:
		h, _ := json.Marshal([]string{"У строки есть .length", "Пустая строка даёт 0"})
		c, _ := json.Marshal([]string{`strLen("abc") === 3`, `strLen("") === 0`, `strLen("x") === 1`})
		return codeTaskSeed{
			Title:       "Практика блока 7: длина строки",
			Question:    prefix + "Функция strLen(s) возвращает длину строки s.",
			StarterCode: "function strLen(s) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	case 8:
		h, _ := json.Marshal([]string{"Индекс 0 — первый символ", "Пустая строка: верни пустую строку"})
		c, _ := json.Marshal([]string{`firstChar("код") === "к"`, `firstChar("Z") === "Z"`, `firstChar("") === ""`})
		return codeTaskSeed{
			Title:       "Практика блока 8: первый символ",
			Question:    prefix + "Функция firstChar(s) возвращает первый символ строки или пустую строку, если s пустая.",
			StarterCode: "function firstChar(s) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	case 9:
		h, _ := json.Marshal([]string{"Положительное: строго больше нуля"})
		c, _ := json.Marshal([]string{"isPositive(3) === true", "isPositive(-1) === false", "isPositive(0) === false"})
		return codeTaskSeed{
			Title:       "Практика блока 9: положительное число",
			Question:    prefix + "Функция isPositive(n) — true только если n > 0.",
			StarterCode: "function isPositive(n) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	default:
		h, _ := json.Marshal([]string{"n * n", "Учти отрицательные — квадрат положителен"})
		c, _ := json.Marshal([]string{"square(3) === 9", "square(-4) === 16", "square(0) === 0"})
		return codeTaskSeed{
			Title:       "Практика блока 10: квадрат числа",
			Question:    prefix + "Функция square(n) возвращает n * n.",
			StarterCode: "function square(n) {\n}\n",
			HintsJSON:   string(h),
			ChecksJSON:  string(c),
			XPReward:    xp,
		}
	}
}

// DemoFinalCodeTask — финальная «галочка» модуля.
func DemoFinalCodeTask(moduleTitle string) codeTaskSeed {
	h, _ := json.Marshal([]string{"Верни true", "Имя функции: moduleDone"})
	c, _ := json.Marshal([]string{"moduleDone() === true"})
	return codeTaskSeed{
		Title:       "Финальная задача",
		Question:    fmt.Sprintf("Модуль «%s»: напиши moduleDone(), которая возвращает true — как символ того, что ты прошёл весь путь.", moduleTitle),
		StarterCode: "function moduleDone() {\n}\n",
		HintsJSON:   string(h),
		ChecksJSON:  string(c),
		XPReward:    300,
	}
}

// quizSeedRow — одна позиция банка квиза (10 блоков × 5 вопросов).
type quizSeedRow struct {
	q  string
	o0 string
	o1 string
	o2 string
	o3 string
	ok int
}

// quizBankJS — курс JavaScript-разработчик.
var quizBankJS = []quizSeedRow{
	{"Что такое переменная?", "Жёстко зашитое значение в прошивке", "Именованное место для хранения данных", "Только число", "Только функция", 1},
	{"Что делает оператор + для двух строк в JS?", "Сравнивает лексикографически", "Склеивает строки (конкатенация)", "Возвращает длину", "Вызывает ошибку всегда", 1},
	{"Какой тип у значения true?", "string", "boolean", "number", "object", 1},
	{"Что выведет typeof null в JavaScript?", "null", "object", "undefined", "number", 1},
	{"Зачем нужны комментарии в коде?", "Чтобы компилятор быстрее работал", "Для пояснений людям; не влияют на выполнение", "Чтобы скрыть баги", "Чтобы шифровать пароли", 1},
	{"Что вернёт Boolean(0)?", "true", "false", "0", "undefined", 1},
	{"Чем отличается == от === в JS?", "Ничем", "=== сравнивает без приведения типов", "=== только для строк", "=== устарел", 1},
	{"Что такое NaN?", "Не существует в JS", "«Не число» как результат некорректной математики", "Синоним null", "Максимальное число", 1},
	{"Какой результат выражения \"5\" + 1?", "6", "51", "Ошибка", "undefined", 1},
	{"Для чего нужен parseInt?", "Удалить пробелы", "Преобразовать строку к целому числу", "Округлить дробь", "Сортировать массив", 1},
	{"Зачем нужен if?", "Повторять код", "Выполнять код при условии", "Импортировать модули", "Объявлять функцию", 1},
	{"Что делает else?", "Завершает программу", "Ветка, если условие if ложно", "Цикл", "Создаёт переменную", 1},
	{"Можно ли вкладывать if внутрь другого if?", "Нет, запрещено стандартом", "Да", "Только в Python", "Только один уровень", 1},
	{"Что такое тернарный оператор?", "Три функции подряд", "Краткая форма if/else: условие ? a : b", "Три цикла", "Тип данных", 1},
	{"Как записать «не равно» в JS?", "<>", "!= или !==", "=/=", "NOT", 1},
	{"Сколько раз выполнится тело while, если условие сразу false?", "Один раз", "Ноль раз", "Бесконечно", "Два раза", 1},
	{"Что характерно для for?", "Только бесконечный цикл", "Инициализация; условие; шаг — классический цикл со счётчиком", "Только по массивам в Python-стиле", "Заменяет if", 1},
	{"Что делает break внутри цикла?", "Пропускает одну итерацию", "Выходит из цикла", "Удаляет переменную", "Перезапускает программу", 1},
	{"Что делает continue?", "Завершает программу", "Переходит к следующей итерации цикла", "Удаляет элемент массива", "Создаёт функцию", 1},
	{"Опасность бесконечного цикла — в том, что…", "Программа станет слишком быстрой", "Условие выхода никогда не выполнится", "Компьютер выключится", "Переменные исчезнут", 1},
	{"Зачем объявлять функцию?", "Чтобы код можно было вызывать по имени и переиспользовать", "Чтобы удалить переменные", "Только для красоты", "Чтобы замедлить код", 0},
	{"Что такое параметр функции?", "Результат return", "Входное значение, имя в объявлении", "Глобальная константа", "Имя файла", 1},
	{"Что делает return?", "Печатает в консоль", "Возвращает значение из функции вызывающему коду", "Удаляет функцию", "Запускает цикл", 1},
	{"Может ли функция не иметь return?", "Нет", "Да — тогда вернётся undefined", "Только в строгом режиме нельзя", "Только одна строка кода", 1},
	{"Что такое область видимости параметра?", "Виден везде в программе", "Обычно только внутри функции", "Только в цикле for", "Только в комментариях", 1},
	{"Индексация массива в JS с какого числа?", "С 1", "С 0", "С -1", "С 10", 1},
	{"Что вернёт [1,2,3].length?", "2", "3", "4", "undefined", 1},
	{"Как добавить элемент в конец массива?", "array.add(x)", "array.push(x)", "array.append(x) в JS", "array.insertEnd(x)", 1},
	{"Что такое объект как структура данных?", "Только список чисел", "Набор пар ключ–значение", "Только строка", "Тип цикла", 1},
	{"Зачем перебирать массив в цикле?", "Чтобы удалить интернет", "Чтобы обработать каждый элемент", "Чтобы отключить ошибки", "Чтобы ускорить CPU", 1},
	{"Метод строки для поиска подстроки?", "find()", "indexOf() или includes()", "searchArray()", "locate()", 1},
	{"Как получить длину строки s?", "s.size", "s.length", "len(s) в JS", "s.count", 1},
	{"Что такое шаблонная строка (template literal)?", "Строка в одинарных кавычках", "Строка в обратных кавычках с ${}", "Комментарий", "Только JSON", 1},
	{"Зачем экранировать кавычки в строке?", "Чтобы строка не закрылась раньше времени", "Чтобы ускорить код", "Чтобы скрыть код", "Не нужно никогда", 0},
	{"Что делает trim()?", "Удаляет пробелы по краям строки", "Делает все буквы заглавными", "Разбивает по словам", "Кодирует base64", 0},
	{"Глобальная переменная (без модулей) в браузере часто оказывается свойством…", "document", "window", "body", "head", 1},
	{"Почему объявляют let/const вместо повторного var без нужды?", "Чтобы код дольше компилировался", "Чтобы ограничить область видимости и уменьшить баги", "var быстрее", "let запрещён в JS", 1},
	{"Что такое блочная область видимости?", "Видимость внутри { ... } для let/const", "Видимость только в функциях на C", "Видимость везде", "Область комментариев", 0},
	{"Зачем разбивать код на маленькие функции?", "Чтобы запутать коллег", "Чтобы проще читать, тестировать и переиспользовать", "Чтобы один файл был на 10 000 строк", "Чтобы отключить return", 1},
	{"Что покажет console.log?", "Сохранит в БД", "Выведет значение в консоль разработчика", "Удалит переменную", "Запустит сервер", 1},
	{"Что такое stack trace?", "Список вызовов функций до ошибки", "Скорость процессора", "Размер массива", "Тип переменной", 0},
	{"Первый шаг при странном баге?", "Сразу переписать весь проект", "Воспроизвести, локализовать, добавить логи", "Удалить тесты", "Отключить интернет", 1},
	{"Зачем читать текст ошибки?", "Не нужно", "Там часто указан тип проблемы и строка", "Только для дизайна", "Чтобы замедлить IDE", 1},
	{"Что такое debugger?", "Удалитель багов автоматически", "Точка остановки для пошагового выполнения", "Формат файла", "CSS-свойство", 1},
	{"Почему важны маленькие шаги при обучении?", "Чтобы не перегружать память и закреплять навык", "Чтобы ничего не понять", "Чтобы не писать код", "Чтобы избегать практики", 0},
	{"Что такое рефакторинг?", "Удаление всех тестов", "Улучшение структуры кода без смены поведения", "Смена языка проекта", "Компиляция в бинарник", 1},
	{"Зачем повторять материал через неделю?", "Забывающая кривая — без повторения знания выветриваются", "Потому что платформа требует", "Чтобы скучать", "Не нужно повторять", 0},
	{"Итоговый совет перед «большим» проектом?", "Не планировать", "Разбить на задачи, прототип, тесты ключевых функций", "Писать всё в одном файле", "Игнорировать ошибки", 1},
	{"Что такое MVP?", "Самая сложная версия", "Минимально жизнеспособный продукт с ключевой ценностью", "Тип базы данных", "Стиль CSS", 1},
	{"Почему полезен code review (даже самому себе)?", "Замедляет всегда", "Свежий взгляд ловит опечатки и логические дыры", "Заменяет тесты полностью", "Удаляет комментарии", 1},
}

func quizBankForModuleTitle(title string) []quizSeedRow {
	switch trackFromModuleTitle(title) {
	case "py":
		return quizBankPython
	case "web":
		return quizBankWeb
	default:
		return quizBankJS
	}
}

// BuildDemoQuizQuestions — по 5 вопросов на каждый урок (10×3 + итог 11.1) = 155; банк зависит от трека.
func BuildDemoQuizQuestions(moduleID uint, moduleTitle string) []models.QuizQuestion {
	bank := quizBankForModuleTitle(moduleTitle)
	n := len(bank)
	if n == 0 {
		return nil
	}
	out := make([]models.QuizQuestion, 0, 155)
	for b := 1; b <= 10; b++ {
		for l := 1; l <= 3; l++ {
			slot := (b-1)*3 + (l - 1)
			for q := 0; q < 5; q++ {
				bi := (slot*5 + q*7 + b + l*2) % n
				e := bank[bi]
				raw, _ := json.Marshal([]string{e.o0, e.o1, e.o2, e.o3})
				prefix := fmt.Sprintf("Блок %d · урок %d: ", b, l)
				out = append(out, models.QuizQuestion{
					ModuleID:      moduleID,
					BlockIndex:    b,
					LessonInBlock: l,
					Question:      prefix + e.q,
					Options:       string(raw),
					CorrectIdx:    e.ok,
				})
			}
		}
	}
	for q := 0; q < 5; q++ {
		bi := (45 + q*4) % n
		e := bank[bi]
		raw, _ := json.Marshal([]string{e.o0, e.o1, e.o2, e.o3})
		out = append(out, models.QuizQuestion{
			ModuleID:      moduleID,
			BlockIndex:    11,
			LessonInBlock: 1,
			Question:      fmt.Sprintf("Итог модуля: %s", e.q),
			Options:       string(raw),
			CorrectIdx:    e.ok,
		})
	}
	return out
}

// DemoAchievementSeeds — ачивки, которые выдаются из хендлеров (коды фиксированы).
func DemoAchievementSeeds() []models.Achievement {
	return []models.Achievement{
		{Code: "code_warrior", Title: "Первый рабочий код"},
		{Code: "task_marathon", Title: "10 задач с автопроверкой"},
		{Code: "quiz_first", Title: "Первый сданный тест блока"},
		{Code: "quiz_veteran", Title: "5 успешных тестов по блокам"},
		{Code: "grad_js", Title: "Выпускник: JavaScript"},
		{Code: "grad_py", Title: "Выпускник: Python"},
		{Code: "grad_web", Title: "Выпускник: Веб"},
	}
}
