const form = document.getElementById('studentForm');

if (form) {
  const messageBox = document.getElementById('messageBox');
  const fields = {
    name: document.getElementById('name'),
    prn: document.getElementById('prn'),
    department: document.getElementById('department'),
    email: document.getElementById('email')
  };

  const clearErrors = () => {
    form.querySelectorAll('.error').forEach((error) => error.remove());
  };

  const showError = (input, message) => {
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = message;
    input.insertAdjacentElement('afterend', error);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    messageBox.style.display = 'none';
    messageBox.innerHTML = '';

    const name = fields.name.value.trim();
    const prn = fields.prn.value.trim();
    const department = fields.department.value.trim();
    const email = fields.email.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;

    if (!name) {
      showError(fields.name, 'Please enter your name.');
      isValid = false;
    }

    if (!prn) {
      showError(fields.prn, 'Please enter your PRN.');
      isValid = false;
    }

    if (!department) {
      showError(fields.department, 'Please enter your department.');
      isValid = false;
    }

    if (!email) {
      showError(fields.email, 'Please enter your email.');
      isValid = false;
    } else if (!emailPattern.test(email)) {
      showError(fields.email, 'Please enter a valid email address.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    messageBox.innerHTML = `
      <h2>Submitted Successfully</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>PRN:</strong> ${prn}</p>
      <p><strong>Department:</strong> ${department}</p>
      <p><strong>Email:</strong> ${email}</p>
    `;
    messageBox.style.display = 'block';
    form.reset();
  });
}
