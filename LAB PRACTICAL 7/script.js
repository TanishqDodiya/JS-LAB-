const form = document.getElementById('registrationForm');
const successMessage = document.getElementById('successMessage');

const showError = (input, message) => {
  const errorBox = input.parentElement.querySelector('.error-message');
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  errorBox.textContent = message;
};

const clearError = (input) => {
  const errorBox = input.parentElement.querySelector('.error-message');
  input.classList.remove('error');
  input.setAttribute('aria-invalid', 'false');
  errorBox.textContent = '';
};

const validateField = (input) => {
  const value = input.value.trim();

  if (input.type === 'checkbox') {
    if (!input.checked) {
      showError(input, 'You must agree to the terms and conditions.');
      return false;
    }
    clearError(input);
    return true;
  }

  if (!value) {
    showError(input, 'This field is required.');
    return false;
  }

  if (input.name === 'username' && value.length < 4) {
    showError(input, 'Username must be at least 4 characters long.');
    return false;
  }

  if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    showError(input, 'Please enter a valid email address.');
    return false;
  }

  if (input.type === 'url' && !/^https?:\/\/.+/.test(value)) {
    showError(input, 'Please enter a valid website URL starting with http:// or https://');
    return false;
  }

  if (input.name === 'password' && value.length < 6) {
    showError(input, 'Password must be at least 6 characters long.');
    return false;
  }

  if (input.name === 'repassword') {
    const password = document.getElementById('password').value;
    if (value !== password) {
      showError(input, 'Passwords do not match.');
      return false;
    }
  }

  clearError(input);
  return true;
};

const inputs = form.querySelectorAll('input');

inputs.forEach((input) => {
  input.addEventListener('focus', () => {
    if (input.value.trim() !== '' || input.checked) {
      validateField(input);
    }
  });

  input.addEventListener('change', () => {
    validateField(input);
  });

  input.addEventListener('input', () => {
    if (input.value.trim() || input.checked) {
      clearError(input);
    }
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  successMessage.textContent = '';

  let isValid = true;

  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  if (isValid) {
    successMessage.textContent = 'Form submitted successfully!';
    form.reset();
  }
});
