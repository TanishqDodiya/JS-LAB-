const arrayForm = document.getElementById("arrayForm");
const numbersInput = document.getElementById("numbersInput");
const maximum = document.getElementById("maximum");
const minimum = document.getElementById("minimum");
const message = document.getElementById("message");

arrayForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const numbers = numbersInput.value
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);

  if (!numbersInput.value.trim() || numbers.some((number) => !Number.isFinite(number))) {
    maximum.textContent = "-";
    minimum.textContent = "-";
    message.textContent = "Please enter only valid numbers separated by commas or spaces.";
    message.className = "message error";
    return;
  }

  const highest = numbers.reduce((currentHighest, number) => (
    number > currentHighest ? number : currentHighest
  ));
  const lowest = numbers.reduce((currentLowest, number) => (
    number < currentLowest ? number : currentLowest
  ));

  maximum.textContent = highest;
  minimum.textContent = lowest;
  message.textContent = `Compared ${numbers.length} number${numbers.length === 1 ? "" : "s"} using reduce().`;
  message.className = "message success";
});
