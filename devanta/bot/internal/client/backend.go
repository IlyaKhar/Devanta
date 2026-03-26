package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type BackendClient struct {
	baseURL string
	client  *http.Client
}

func NewBackendClient(baseURL string) *BackendClient {
	return &BackendClient{
		baseURL: baseURL,
		client:  &http.Client{},
	}
}

func (c *BackendClient) GetLesson() (string, error) {
	resp, err := c.client.Get(c.baseURL + "/api/lessons/1")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body), nil
}

func (c *BackendClient) GetProgress() (string, error) {
	return "Прогресс: 120 XP, уровень 1", nil
}

func (c *BackendClient) AskMax(prompt string) (string, error) {
	payload, _ := json.Marshal(map[string]string{
		"lesson": "Циклы",
		"age":    "11-15",
	})
	resp, err := c.client.Post(c.baseURL+"/api/ai/explain", "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return fmt.Sprintf("Ответ Макса: %s", string(body)), nil
}
