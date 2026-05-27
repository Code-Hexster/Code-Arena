"use client";

/**
 * Real Python execution in the browser using Pyodide (CPython compiled to WebAssembly).
 * No API keys, no external services, runs entirely client-side.
 */

let pyodideInstance: any = null;
let loadingPromise: Promise<any> | null = null;

/** Check if Pyodide script is already loaded */
function isPyodideLoaded(): boolean {
  return typeof (window as any).loadPyodide === "function";
}

/** Load Pyodide from CDN (cached after first load) */
export async function initPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Load the Pyodide script from CDN if not already loaded
    if (!isPyodideLoaded()) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Pyodide"));
        document.head.appendChild(script);
      });
    }

    // Initialize the Python runtime
    pyodideInstance = await (window as any).loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });

    return pyodideInstance;
  })();

  return loadingPromise;
}

export interface PythonResult {
  stdout: string;
  stderr: string;
  status: { id: number; description: string };
  time: string;
  memory: number;
}

/** Execute Python code and capture stdout/stderr */
export async function runPython(code: string, stdin: string = ""): Promise<PythonResult> {
  const pyodide = await initPyodide();

  // Redirect stdout and stderr to StringIO so we can capture them
  pyodide.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
  `);

  // Set up stdin if provided
  if (stdin) {
    pyodide.runPython(`
sys.stdin = StringIO(${JSON.stringify(stdin)})
    `);
  }

  const startTime = performance.now();

  try {
    // Run the user's code
    pyodide.runPython(code);

    const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
    const stdout: string = pyodide.runPython("_stdout_capture.getvalue()");
    const stderr: string = pyodide.runPython("_stderr_capture.getvalue()");

    return {
      stdout: stdout || "",
      stderr: stderr || "",
      status: { id: 3, description: "Accepted" },
      time: elapsed,
      memory: 1024,
    };
  } catch (error: any) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);

    // Extract the Python traceback from the error
    let errorMessage = error.message || "Runtime Error";

    // Pyodide wraps Python errors — extract the clean traceback
    if (errorMessage.includes("PythonError")) {
      const lines = errorMessage.split("\n");
      // Find the line that starts with the actual Python error type
      const pythonError = lines.filter(
        (l: string) =>
          l.match(/^(NameError|TypeError|SyntaxError|ValueError|IndentationError|ZeroDivisionError|IndexError|KeyError|AttributeError|ImportError):/) ||
          l.includes("Traceback") ||
          l.includes("File") ||
          l.trim().startsWith("^")
      );
      if (pythonError.length > 0) {
        errorMessage = pythonError.join("\n");
      }
    }

    return {
      stdout: "",
      stderr: errorMessage,
      status: { id: 11, description: "Runtime Error" },
      time: elapsed,
      memory: 0,
    };
  } finally {
    // Reset stdout/stderr back to defaults
    try {
      pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);
    } catch {
      // Ignore cleanup errors
    }
  }
}
