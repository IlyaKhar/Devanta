package util

import (
	"regexp"
	"strings"
)

var reUnsplashSlug = regexp.MustCompile(`^photo-\d`)

// NormalizeAvatarURL — полный https, локальный /uploads/..., или slug Unsplash без домена.
func NormalizeAvatarURL(raw string) string {
	s := strings.TrimSpace(raw)
	if s == "" {
		return ""
	}
	lower := strings.ToLower(s)
	if strings.HasPrefix(lower, "http://") || strings.HasPrefix(lower, "https://") {
		return s
	}
	if strings.HasPrefix(s, "//") {
		return "https:" + s
	}
	if strings.HasPrefix(s, "/") {
		return s
	}
	if strings.HasPrefix(lower, "images.unsplash.com/") {
		return "https://" + s
	}
	if reUnsplashSlug.MatchString(s) {
		return "https://images.unsplash.com/" + s
	}
	return s
}
