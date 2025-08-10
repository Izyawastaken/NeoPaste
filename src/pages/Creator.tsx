import React, { useEffect, useState, useRef } from "react";

const ACCENT_KEY = "neopaste-accent";

export default function LandingPage() {
  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [pasteLink, setPasteLink] = useState("");

  // Accent color state
  const [accent, setAccent] = useState<string>("");

  const accentInputRef = useRef<HTMLInputElement | null>(null);
  const accentCircleRef = useRef<HTMLSpanElement | null>(null);

  // On mount, restore accent color and theme
  useEffect(() => {
    const savedAccent = localStorage.getItem(ACCENT_KEY);
    if (savedAccent) {
      setAccent(savedAccent);
      document.documentElement.style.setProperty("--accent", savedAccent);
      if (accentCircleRef.current) accentCircleRef.current.style.background = savedAccent;
    } else {
      const defaultAccent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      setAccent(defaultAccent);
    }

    // Theme dark mode from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme || savedTheme === "dark") {
      document.body.classList.add("dark");
    }
  }, []);

  // Handle accent color changes
  function handleAccentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const color = e.target.value;
    setAccent(color);
    document.documentElement.style.setProperty("--accent", color);
    localStorage.setItem(ACCENT_KEY, color);
    if (accentCircleRef.current) accentCircleRef.current.style.background = color;
  }

  // Handle form submit (you can replace this with your actual logic)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: create a fake link for now
    const fakeLink = `https://neopaste.app/view/${encodeURIComponent(title.trim() || "untitled")}`;
    setPasteLink(fakeLink);
  }

  return (
    <>
      <style>
        {`
          .fade-in {
            animation: fadeIn 0.4s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .link-buttons {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .copy-link-btn.copied {
            background-color: #4caf50;
            color: white;
            transition: background-color 0.3s ease;
          }

          .link-status {
            font-size: 0.95em;
            color: #4caf50;
            font-weight: bold;
          }

          .floating-report-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #007bff;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            text-align: center;
            text-decoration: none;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s ease;
          }

          .floating-report-btn:hover {
            background-color: #0056b3;
          }

          /* Accent Picker Styles */
          .accent-picker-container {
            position: fixed;
            top: 20px;
            left: 20px;
            display: flex;
            align-items: center;
            cursor: pointer;
            z-index: 1000;
          }

          .accent-circle {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid #fff;
            margin-right: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          /* Ensure the report button is not covered by the accent picker */
          .report-btn {
            margin-top: 10px;
          }
        `}
      </style>

      <div className="container fade-in">
        <header>
          <h1>NeoPaste</h1>
          <p className="subtitle">Share your Pokémon teams with style.</p>
        </header>

        <form id="pasteForm" onSubmit={handleSubmit}>
          <input
            type="text"
            id="title"
            placeholder="Paste Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            id="author"
            placeholder="Author (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <textarea
            id="content"
            placeholder="Paste your team here..."
            rows={20}
            spellCheck={false}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit">Generate Link</button>
        </form>

        <div id="paste-link">{pasteLink && <a href={pasteLink}>{pasteLink}</a>}</div>

        <footer>
          <p>
            Inspired by{" "}
            <a href="https://pokepast.es" target="_blank" rel="noopener noreferrer">
              Pokepaste
            </a>{" "}
            by felixphew
          </p>
        </footer>
      </div>

      {/* Accent Picker */}
      <div className="accent-picker-container" title="Pick accent color">
        <span ref={accentCircleRef} className="accent-circle" style={{ background: accent }}></span>
        <input
          type="color"
          id="accentColorPicker"
          aria-label="Pick accent color"
          value={accent}
          onChange={handleAccentChange}
          ref={accentInputRef}
        />
      </div>

      {/* Report Issues Button */}
      <a
        href="https://github.com/Izyawastaken/NeoPaste/issues"
        target="_blank"
        rel="noopener noreferrer"
        className="report-btn floating-report-btn"
      >
        🐛 Report Issues Here
      </a>
    </>
  );
}
