package codecheck

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/dop251/goja"
)

// ValidateJavaScript — загружает код ученика и по очереди выполняет assert-выражения в том же VM (ES5).
func ValidateJavaScript(userCode string, assertions []string, maxDuration time.Duration) error {
	code := strings.TrimSpace(userCode)
	if code == "" {
		return fmt.Errorf("пустой код")
	}
	vm := goja.New()
	timer := time.AfterFunc(maxDuration, func() { vm.Interrupt("слишком долго") })
	defer timer.Stop()

	if _, err := vm.RunString(code); err != nil {
		return fmt.Errorf("ошибка в коде: %v", err)
	}
	for i, a := range assertions {
		a = strings.TrimSpace(a)
		if a == "" {
			continue
		}
		v, err := vm.RunString(a)
		if err != nil {
			return fmt.Errorf("тест %d: %v", i+1, err)
		}
		if !v.ToBoolean() {
			return fmt.Errorf("тест %d не пройден", i+1)
		}
	}
	return nil
}

// ParseAssertionsJSON — массив строк из JSON.
func ParseAssertionsJSON(raw string) ([]string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	var out []string
	if err := json.Unmarshal([]byte(raw), &out); err != nil {
		return nil, err
	}
	return out, nil
}
