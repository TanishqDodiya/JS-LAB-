const form = document.getElementById("palindrome-form");
const input = document.getElementById("palindrome-input");
const result = document.getElementById("result");

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isPalindrome(text) {
  const normalized = normalizeText(text);
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}

function showMessage(message, type) {
  result.textContent = message;
  result.classList.remove("success", "error");
  result.classList.add(type);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = input.value.trim();

  if (!value) {
    showMessage("Please enter a word.", "error");
    return;
  }

  if (isPalindrome(value)) {
    showMessage(`"${value}" is a palindrome!`, "success");
  } else {
    showMessage(`"${value}" is not a palindrome.`, "error");
  }
});
