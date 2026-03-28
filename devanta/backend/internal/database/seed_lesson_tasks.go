package database

import "encoding/json"

// DemoCodeTaskForLesson — задача с кодом на каждый урок (1..30) + финал 31.
func DemoCodeTaskForLesson(moduleTitle string, sortOrder int) codeTaskSeed {
	if sortOrder >= 31 {
		return DemoFinalCodeTask(moduleTitle)
	}
	block := (sortOrder-1)/3 + 1
	sub := (sortOrder-1)%3 + 1
	if sub == 1 {
		return DemoCodeTaskForBlock(moduleTitle, block)
	}
	track := trackFromModuleTitle(moduleTitle)
	xp := 48 + sortOrder*2 + sub*5
	prefix := ""
	switch track {
	case "py":
		prefix = "[Python-трек → код на JS] "
	case "web":
		prefix = "[Веб-трек → логика на JS] "
	}
	switch sub {
	case 2:
		return secondLessonTask(prefix, block, sortOrder, xp)
	default:
		return thirdLessonTask(prefix, block, xp)
	}
}

func secondLessonTask(prefix string, block, _, xp int) codeTaskSeed {
	switch block {
	case 1:
		h, _ := json.Marshal([]string{"return n + 1", "Имя функции: inc"})
		c, _ := json.Marshal([]string{"inc(0) === 1", "inc(-3) === -2", "inc(99) === 100"})
		return codeTaskSeed{"Урок: шаг вперёд", prefix + "Функция inc(n) возвращает n + 1.", "function inc(n) {\n}\n", string(h), string(c), xp}
	case 2:
		h, _ := json.Marshal([]string{"return n - 1", "Имя: dec"})
		c, _ := json.Marshal([]string{"dec(5) === 4", "dec(0) === -1", "dec(-2) === -3"})
		return codeTaskSeed{"Урок: шаг назад", prefix + "Функция dec(n) возвращает n - 1.", "function dec(n) {\n}\n", string(h), string(c), xp}
	case 3:
		h, _ := json.Marshal([]string{"Оба true → true", "Иначе false"})
		c, _ := json.Marshal([]string{"bothTrue(true, true) === true", "bothTrue(true, false) === false", "bothTrue(false, false) === false"})
		return codeTaskSeed{"Урок: логическое И", prefix + "Функция bothTrue(a, b) — true только если a и b оба true.", "function bothTrue(a, b) {\n}\n", string(h), string(c), xp}
	case 4:
		h, _ := json.Marshal([]string{"Сумма от 1 до n включительно", "n >= 1"})
		c, _ := json.Marshal([]string{"sumTo(1) === 1", "sumTo(3) === 6", "sumTo(5) === 15"})
		return codeTaskSeed{"Урок: сумма ряда", prefix + "Функция sumTo(n) возвращает 1+2+...+n (n целое ≥ 1).", "function sumTo(n) {\n}\n", string(h), string(c), xp}
	case 5:
		h, _ := json.Marshal([]string{"return a * a", "Квадрат"})
		c, _ := json.Marshal([]string{"sqr(3) === 9", "sqr(0) === 0", "sqr(-4) === 16"})
		return codeTaskSeed{"Урок: квадрат", prefix + "Функция sqr(a) возвращает a * a.", "function sqr(a) {\n}\n", string(h), string(c), xp}
	case 6:
		h, _ := json.Marshal([]string{"arr[0] + arr[1] + arr[2]", "Массив ровно из 3 чисел"})
		c, _ := json.Marshal([]string{"sum3([1,2,3]) === 6", "sum3([0,0,0]) === 0", "sum3([-1,5,2]) === 6"})
		return codeTaskSeed{"Урок: сумма трёх из массива", prefix + "Функция sum3(arr) — сумма трёх элементов массива длины 3.", "function sum3(arr) {\n}\n", string(h), string(c), xp}
	case 7:
		h, _ := json.Marshal([]string{"toLowerCase", "includes('а') для проверки буквы а"})
		c, _ := json.Marshal([]string{"hasA('Алма') === true", "hasA('Боб') === false", "hasA('а') === true"})
		return codeTaskSeed{"Урок: буква «а» в строке", prefix + "Функция hasA(s) — true, если в строке s (любой регистр) есть буква «а» или «А».", "function hasA(s) {\n}\n", string(h), string(c), xp}
	case 8:
		h, _ := json.Marshal([]string{"Объяви let внутри if недостаточно для return снаружи — верни значение из веток", "Или одна переменная result"})
		c, _ := json.Marshal([]string{"pick(true, 1, 2) === 1", "pick(false, 1, 2) === 2", "pick(false, 'x', 'y') === 'y'"})
		return codeTaskSeed{"Урок: тернарный выбор", prefix + "Функция pick(cond, a, b) возвращает a если cond истинно, иначе b.", "function pick(cond, a, b) {\n}\n", string(h), string(c), xp}
	case 9:
		h, _ := json.Marshal([]string{"Number.isNaN или сравнение с самим NaN ненадёжно — используй Number.isNaN(x)"})
		c, _ := json.Marshal([]string{"isReallyNaN(NaN) === true", "isReallyNaN(0) === false", "isReallyNaN('x') === false"})
		return codeTaskSeed{"Урок: проверка NaN", prefix + "Функция isReallyNaN(x) — true только если x именно NaN.", "function isReallyNaN(x) {\n}\n", string(h), string(c), xp}
	default:
		h, _ := json.Marshal([]string{"Объедини темы блока в одну функцию", "Верни строку 'ok'"})
		c, _ := json.Marshal([]string{`blockWrap(1) === "ok-1"`, `blockWrap(9) === "ok-9"`})
		return codeTaskSeed{"Урок: мини-итог блока", prefix + "Функция blockWrap(n) возвращает строку \"ok-\" + n (через шаблонную строку или +).", "function blockWrap(n) {\n}\n", string(h), string(c), xp}
	}
}

func thirdLessonTask(prefix string, block, xp int) codeTaskSeed {
	switch block {
	case 1:
		h, _ := json.Marshal([]string{"n * 2", "Имя: double"})
		c, _ := json.Marshal([]string{"double(3) === 6", "double(0) === 0", "double(-5) === -10"})
		return codeTaskSeed{"Урок: удвоение", prefix + "Функция double(n) возвращает n * 2.", "function double(n) {\n}\n", string(h), string(c), xp}
	case 2:
		h, _ := json.Marshal([]string{"typeof", "сравни со строками 'number' и 'string'"})
		c, _ := json.Marshal([]string{`typeLabel(1) === "num"`, `typeLabel("x") === "str"`, `typeLabel(true) === "other"`})
		return codeTaskSeed{"Урок: ярлык типа", prefix + `Функция typeLabel(x): для числа верни "num", для строки "str", иначе "other".`, "function typeLabel(x) {\n}\n", string(h), string(c), xp}
	case 3:
		h, _ := json.Marshal([]string{"a <= x && x <= b", "Границы включительно"})
		c, _ := json.Marshal([]string{"inRange(2, 1, 3) === true", "inRange(0, 1, 3) === false", "inRange(3, 3, 3) === true"})
		return codeTaskSeed{"Урок: попадание в диапазон", prefix + "Функция inRange(x, a, b) — true если x между a и b включительно (a может быть > b — тогда диапазон между ними).", "function inRange(x, a, b) {\n}\n", string(h), string(c), xp}
	case 4:
		h, _ := json.Marshal([]string{"Факториал n! = 1*2*...*n", "n >= 0, 0! = 1"})
		c, _ := json.Marshal([]string{"fact(0) === 1", "fact(3) === 6", "fact(4) === 24"})
		return codeTaskSeed{"Урок: факториал", prefix + "Функция fact(n) возвращает факториал неотрицательного целого n.", "function fact(n) {\n}\n", string(h), string(c), xp}
	case 5:
		h, _ := json.Marshal([]string{"return fn(fn(x))", "fn вызывается дважды"})
		c, _ := json.Marshal([]string{"applyTwice(2, function(y){ return y + 1; }) === 4", "applyTwice(0, function(y){ return y * 2; }) === 0"})
		return codeTaskSeed{"Урок: функция дважды", prefix + "Функция applyTwice(x, fn) вызывает fn(fn(x)) (fn — функция одного аргумента).", "function applyTwice(x, fn) {\n}\n", string(h), string(c), xp}
	case 6:
		h, _ := json.Marshal([]string{"arr[arr.length - 1]", "Последний элемент"})
		c, _ := json.Marshal([]string{"last([1,2,3]) === 3", "last(['a']) === 'a'", "last([0,0,7]) === 7"})
		return codeTaskSeed{"Урок: последний элемент", prefix + "Функция last(arr) возвращает последний элемент непустого массива.", "function last(arr) {\n}\n", string(h), string(c), xp}
	case 7:
		h, _ := json.Marshal([]string{"split по пробелу", "length массива слов"})
		c, _ := json.Marshal([]string{`wordCount("a b c") === 3`, `wordCount("hello") === 1`, `wordCount("") === 0`})
		return codeTaskSeed{"Урок: число слов", prefix + "Функция wordCount(s) — сколько слов в строке (слова разделены одним или несколькими пробелами; пустая строка → 0).", "function wordCount(s) {\n}\n", string(h), string(c), xp}
	case 8:
		h, _ := json.Marshal([]string{"Используй замыкание или просто return function(){ return x; }"})
		c, _ := json.Marshal([]string{"const f = constant(5); f() === 5", "constant('z')() === 'z'"})
		return codeTaskSeed{"Урок: константа-функция", prefix + "Функция constant(x) возвращает функцию без аргументов, которая всегда возвращает x.", "function constant(x) {\n}\n", string(h), string(c), xp}
	case 9:
		h, _ := json.Marshal([]string{"try/catch в JS — для ошибок времени выполнения; здесь просто проверь typeof"})
		c, _ := json.Marshal([]string{"safeLen(null) === 0", "safeLen(undefined) === 0", `safeLen("ab") === 2`})
		return codeTaskSeed{"Урок: безопасная длина", prefix + "Функция safeLen(x): если x строка — верни .length, иначе 0.", "function safeLen(x) {\n}\n", string(h), string(c), xp}
	default:
		h, _ := json.Marshal([]string{"Сконкатенируй номер блока", "String(block)"})
		c, _ := json.Marshal([]string{`tagBlock(3) === "[block-3]"`, `tagBlock(10) === "[block-10]"`})
		return codeTaskSeed{"Урок: тег блока", prefix + "Функция tagBlock(block) возвращает строку вида \"[block-N]\" где N — число block.", "function tagBlock(block) {\n}\n", string(h), string(c), xp}
	}
}
