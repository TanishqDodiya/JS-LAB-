const form = document.getElementById('validatorForm');
const input = document.getElementById('registrationNumber');
const messageBox = document.getElementById('messageBox');

const registrationPattern = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

function showMessage(type, text) {
  messageBox.hidden = false;
  messageBox.classList.remove('success', 'error');
  messageBox.classList.add(type);
  messageBox.textContent = text;
}

function validateRegistrationNumber() {
  const value = input.value.trim().toUpperCase();
  input.value = value;

  if (registrationPattern.test(value)) {
    showMessage('success', 'Valid vehicle registration number.');
    return true;
  }

  showMessage('error', 'Invalid vehicle registration number. Use a format like MH12AB1234.');
  return false;
}

input.addEventListener('input', () => {
  const cleanedValue = input.value.replace(/^\s+/, '').toUpperCase();
  if (cleanedValue !== input.value) {
    input.value = cleanedValue;
  }
});

input.addEventListener('blur', () => {
  input.value = input.value.trim().toUpperCase();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  validateRegistrationNumber();
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    validateRegistrationNumber();
  }
});
