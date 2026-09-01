function checkPalindrome(input) {
  try {
    if (typeof input !== 'string') {
      throw new TypeError('Input must be a string.');
    }

    if (input.trim() === '') {
      throw new Error('Input cannot be empty.');
    }

    const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = cleaned.split('').reverse().join('');

    return cleaned === reversed;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return false;
  }
}

function checkPalindromeFromInput() {
  const input = document.getElementById('inputText').value;
  const resultBox = document.getElementById('result');

  const isPalindrome = checkPalindrome(input);

  if (isPalindrome) {
    resultBox.textContent = 'It is a palindrome!';
    resultBox.style.color = 'green';
  } else {
    resultBox.textContent = 'It is not a palindrome.';
    resultBox.style.color = 'red';
  }
}

const samples = ['madam', 'hello', 'A man a plan a canal Panama', '12321'];

samples.forEach(sample => {
  console.log(`${sample} -> ${checkPalindrome(sample)}`);
});
