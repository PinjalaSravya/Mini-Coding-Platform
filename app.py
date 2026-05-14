from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import render_template
import subprocess
import tempfile
import os
import uuid
import time
app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static"
)

CORS(app)
@app.route("/")
def home():
    return render_template("index.html")
LANGUAGE_CONFIG = {
    "python": {
    "extension": "py",
    "compile": None,
    "run": [
        "C:\\Users\\HP\\AppData\\Local\\Programs\\Python\\Python314\\python.exe",
        "{file}"
    ],
},
    "java": {
        "extension": "java",
        "compile": ["javac", "{file}"],
        "run": ["java", "-cp", "{dir}", "Solution"],
        "filename": "Solution.java",
    },
    "javascript": {
        "extension": "js",
        "compile": None,
        "run": ["node", "{file}"],
    },
    "c": {
        "extension": "c",
        "compile": ["gcc", "{file}", "-o", "{output}"],
        "run": ["{output}"],
    },
}

TIMEOUT = 5  # seconds

TEST_CASES = {
    1: [
        {"input": "2 7 11 15\n9", "expected": "[0, 1]"},
        {"input": "3 2 4\n6",     "expected": "[1, 2]"},
        {"input": "3 3\n6",       "expected": "[0, 1]"},
    ],
    2: [
        {"input": "hello",  "expected": "olleh"},
        {"input": "Hannah", "expected": "hannaH"},
        {"input": "abcde",  "expected": "edcba"},
    ],
    3: [
        {"input": "0",  "expected": "0"},
        {"input": "5",  "expected": "5"},
        {"input": "10", "expected": "55"},
    ],
    4: [
        {"input": "racecar",                    "expected": "true"},
        {"input": "hello",                      "expected": "false"},
        {"input": "A man a plan a canal Panama","expected": "true"},
    ],
    5: [
        {"input": "-2 1 -3 4 -1 2 1 -5 4", "expected": "6"},
        {"input": "1",                      "expected": "1"},
        {"input": "5 4 -1 7 8",             "expected": "23"},
    ],
}


def execute_code(code: str, language: str, stdin: str = "") -> dict:
    config = LANGUAGE_CONFIG.get(language)
    if not config:
        return {"stdout": "", "stderr": "Unsupported language", "exit_code": 1}

    tmpdir = tempfile.mkdtemp()
    try:
        ext = config["extension"]
        filename = config.get("filename", f"solution.{ext}")
        filepath = os.path.join(tmpdir, filename)

        with open(filepath, "w") as f:
            f.write(code)

        # Compile if needed
        if config["compile"]:
            output_bin = os.path.join(tmpdir, "solution_bin")
            compile_cmd = [
                c.replace("{file}", filepath)
                 .replace("{output}", output_bin)
                 .replace("{dir}", tmpdir)
                for c in config["compile"]
            ]
            result = subprocess.run(
                compile_cmd, capture_output=True, text=True, timeout=10
            )
            if result.returncode != 0:
                return {
                    "stdout": "",
                    "stderr": result.stderr,
                    "exit_code": result.returncode,
                }

        # Run
        output_bin = os.path.join(tmpdir, "solution_bin")
        run_cmd = [
            c.replace("{file}", filepath)
             .replace("{output}", output_bin)
             .replace("{dir}", tmpdir)
            for c in config["run"]
        ]
        start = time.time()
        result = subprocess.run(
            run_cmd,
            input=stdin,
            capture_output=True,
            text=True,
            timeout=TIMEOUT,
        )
        elapsed = round((time.time() - start) * 1000)

        return {
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "exit_code": result.returncode,
            "time_ms": elapsed,
        }

    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Time Limit Exceeded (5s)", "exit_code": -1}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "exit_code": -1}
    finally:
        import shutil
        shutil.rmtree(tmpdir, ignore_errors=True)


def normalize(s: str) -> str:
    return s.strip().replace(" ", "").replace("[", "").replace("]", "").lower()


@app.route("/api/run", methods=["POST"])
def run_code():
    data = request.get_json()
    code = data.get("code", "")
    language = data.get("language", "python")
    stdin = data.get("stdin", "")

    result = execute_code(code, language, stdin)
    return jsonify(result)


@app.route("/api/submit", methods=["POST"])
def submit_code():
    data = request.get_json()
    code = data.get("code", "")
    language = data.get("language", "python")
    problem_id = data.get("problem_id", 1)

    cases = TEST_CASES.get(problem_id, [])
    results = []
    passed = 0

    for i, tc in enumerate(cases):
        res = execute_code(code, language, tc["input"])
        got = res["stdout"].strip()
        exp = tc["expected"].strip()
        ok = got == exp or normalize(got) == normalize(exp)
        if ok:
            passed += 1
        results.append({
            "case": i + 1,
            "input": tc["input"],
            "expected": exp,
            "got": got,
            "passed": ok,
            "stderr": res.get("stderr", ""),
            "time_ms": res.get("time_ms", 0),
        })

    return jsonify({
        "passed": passed,
        "total": len(cases),
        "results": results,
        "all_passed": passed == len(cases),
    })


@app.route("/api/problems", methods=["GET"])
def get_problems():
    problems = [
        {"id": 1, "title": "Two Sum",         "difficulty": "Easy",   "tags": ["Array", "Hash Map"]},
        {"id": 2, "title": "Reverse String",   "difficulty": "Easy",   "tags": ["String", "Two Pointer"]},
        {"id": 3, "title": "Fibonacci Number", "difficulty": "Easy",   "tags": ["Recursion", "DP"]},
        {"id": 4, "title": "Valid Palindrome",  "difficulty": "Easy",   "tags": ["String", "Two Pointer"]},
        {"id": 5, "title": "Maximum Subarray", "difficulty": "Medium", "tags": ["DP", "Kadane's"]},
    ]
    return jsonify(problems)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
