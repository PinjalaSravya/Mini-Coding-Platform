const problems = [
    { title: "Reverse String", desc: "Return 'hello' reversed.", difficulty: "Easy", answer: "olleh" },
    { title: "Palindrome Check", desc: "Is 'racecar' palindrome? (true/false)", difficulty: "Easy", answer: "true" },
    { title: "Factorial 5", desc: "Return factorial of 5.", difficulty: "Medium", answer: "120" },
    { title: "Fibonacci(7)", desc: "Return 7th Fibonacci number.", difficulty: "Medium", answer: "13" },
    { title: "Prime Check 11", desc: "Return true if 11 is prime.", difficulty: "Medium", answer: "true" },
    { title: "Binary of 10", desc: "Return binary of 10.", difficulty: "Hard", answer: "1010" },
    { title: "Square of 12", desc: "Return square of 12.", difficulty: "Easy", answer: "144" },
    { title: "Sum 1 to 100", desc: "Return sum from 1 to 100.", difficulty: "Medium", answer: "5050" },
    { title: "Count vowels in 'education'", desc: "Return vowel count.", difficulty: "Hard", answer: "5" },
    { title: "2 + 2 * 2", desc: "Return result.", difficulty: "Easy", answer: "6" }
];

let score = 0;
let timer = 60;
let currentProblem = null;
let interval;
let currentUser = null;

/* LOGIN SYSTEM */
function login() {
    const name = document.getElementById("usernameInput").value.trim();
    if (!name) return alert("Enter your name!");

    localStorage.setItem("currentUser", name);
    startApp();
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

function startApp() {
    currentUser = localStorage.getItem("currentUser");
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("currentUser").innerText = currentUser;
    loadProblems(problems);
    loadLeaderboard();
}

/* Problems */
function loadProblems(list) {
    const problemList = document.getElementById("problemList");
    problemList.innerHTML = "";
    list.forEach(p => {
        const li = document.createElement("li");
        li.innerText = p.title + " (" + p.difficulty + ")";
        li.onclick = () => selectProblem(p);
        problemList.appendChild(li);
    });
}

function filterProblems() {
    const level = document.getElementById("difficultyFilter").value;
    if (level === "All") loadProblems(problems);
    else loadProblems(problems.filter(p => p.difficulty === level));
}

function selectProblem(problem) {
    currentProblem = problem;
    document.getElementById("problemTitle").innerText = problem.title;
    document.getElementById("problemDesc").innerText = problem.desc;
    document.getElementById("output").innerText = "";
    startTimer();
}

/* Code Execution */
function runCode() {
    const language = document.getElementById("languageSelect").value;
    const codeArea = document.getElementById("codeArea");
    const output = document.getElementById("output");

    try {
        if (language === "javascript") {
            const result = eval(codeArea.value);
            output.innerText = result;
        } else {
            output.innerText =
                "⚠ Execution not supported for " +
                language.toUpperCase() +
                " in frontend-only mode.";
        }
    } catch (e) {
        output.innerText = e;
    }
}

function submitCode() {
    if (!currentProblem) return alert("Select a problem first!");

    try {
        const result = eval(document.getElementById("codeArea").value);
        if (result.toString() === currentProblem.answer) {
            alert("Correct!");
            score += 10;
            document.getElementById("score").innerText = score;
            saveLeaderboard();
        } else {
            alert("Wrong Answer!");
        }
    } catch {
        alert("Error in Code!");
    }
}

/* Timer */
function startTimer() {
    clearInterval(interval);
    timer = 60;
    document.getElementById("timer").innerText = timer;

    interval = setInterval(() => {
        timer--;
        document.getElementById("timer").innerText = timer;
        if (timer === 0) {
            clearInterval(interval);
            alert("Time Up!");
        }
    }, 1000);
}

/* Leaderboard with Names */
function saveLeaderboard() {
    let lb = JSON.parse(localStorage.getItem("leaderboard")) || [];
    lb.push({ name: currentUser, score: score });
    lb.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(lb));
    loadLeaderboard();
}

function loadLeaderboard() {
    const leaderboardList = document.getElementById("leaderboardList");
    leaderboardList.innerHTML = "";
    let lb = JSON.parse(localStorage.getItem("leaderboard")) || [];

    lb.slice(0, 5).forEach(entry => {
        const li = document.createElement("li");
        li.innerText = entry.name + " - " + entry.score;
        leaderboardList.appendChild(li);
    });
}

/* Dark Mode */
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

window.onload = function () {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark");
    }

    if (localStorage.getItem("currentUser")) {
        startApp();
    }
};
