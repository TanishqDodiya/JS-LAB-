function escapeHtml(value) {
    return value.replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entities[character];
    });
}

function processString() {
    const text = document.getElementById("text").value;
    const paragraph = document.getElementById("paragraph").value;
    const words = paragraph.trim() ? paragraph.trim().split(/\s+/) : [];
    const vowels = paragraph.match(/[aeiou]/gi);
    const searchWord = "powerful";
    const position = paragraph.toLowerCase().indexOf(searchWord);
    const results = document.getElementById("output");

    results.innerHTML = `
        <div class="results-heading">
            <h2>Results</h2>
            <span>8 operations</span>
        </div>
        <div class="result-grid">
            <article class="result-card accent">
                <h3>1. Basic string operations</h3>
                <p>String: <strong>${escapeHtml(text)}</strong><br>
                Length: <strong>${text.length}</strong><br>
                Uppercase: <strong>${escapeHtml(text.toUpperCase())}</strong><br>
                Lowercase: <strong>${escapeHtml(text.toLowerCase())}</strong></p>
            </article>
            <article class="result-card">
                <h3>2. substring()</h3>
                <p>First 10 characters: <strong>${escapeHtml(text.substring(0, 10))}</strong></p>
            </article>
            <article class="result-card">
                <h3>3. split()</h3>
                <p>${escapeHtml(words.join(", ")) || "No words found"}</p>
            </article>
            <article class="result-card">
                <h3>4. match() - vowels</h3>
                <p>${vowels ? escapeHtml(vowels.join(", ")) : "No vowels found"}</p>
            </article>
            <article class="result-card accent">
                <h3>5. Vowel count</h3>
                <p>Total vowels: <strong>${vowels ? vowels.length : 0}</strong></p>
            </article>
            <article class="result-card">
                <h3>6. replace()</h3>
                <p>${escapeHtml(paragraph.replace(/JavaScript/gi, "JavaScript Programming"))}</p>
            </article>
            <article class="result-card">
                <h3>7. indexOf()</h3>
                <p>Position of <strong>"${searchWord}"</strong>: <strong>${position}</strong></p>
            </article>
            <article class="result-card accent">
                <h3>8. Reverse string</h3>
                <p>${escapeHtml(paragraph.split("").reverse().join(""))}</p>
            </article>
        </div>
    `;
}
