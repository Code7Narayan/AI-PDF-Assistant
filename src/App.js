import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [pdf, setPdf] = useState(null);
  const [dbId, setDbId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [fileName, setFileName] = useState("");
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(false);

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Set initial theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleUpload = async () => {
    if (!pdf) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", pdf);

    try {
      const res = await axios.post("http://localhost:8000/upload/", formData);
      setDbId(res.data.db_id);
      setMessages([...messages, { type: "system", text: "✅ PDF uploaded successfully!" }]);
    } catch (err) {
      setMessages([...messages, { type: "system", text: "❌ Upload failed. Please try again." }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question || !dbId) return;
    setIsLoading(true);
    setMessages([...messages, { type: "user", text: question }]);
    const formData = new FormData();
    formData.append("db_id", dbId);
    formData.append("question", question);

    try {
      const res = await axios.post("http://localhost:8000/ask/", formData);
      setMessages([...messages, { type: "user", text: question }, { type: "ai", text: res.data.answer }]);
      setQuestion("");
    } catch (err) {
      setMessages([...messages, { type: "user", text: question }, { type: "system", text: "❌ Failed to get answer. Please try again." }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdf(file);
      setFileName(file.name);
    }
  };

  return (
    <div className="App">
      <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <div className="sidebar">
        <h2>AI PDF Assistant</h2>
        <div className="file-upload-container">
          <label htmlFor="pdf-upload" className="file-upload-label">
            Upload PDF
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
          {fileName && <div className="file-name">Selected: {fileName}</div>}
          <button
            onClick={handleUpload}
            disabled={!pdf || isLoading}
            className={isLoading ? "loading" : ""}
          >
            {isLoading ? "Uploading..." : "Submit PDF"}
          </button>
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.type === "user" ? "user" : msg.type === "ai" ? "ai" : "system"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        {dbId && (
          <div className="question-container">
            <input
              type="text"
              className="question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your PDF..."
              onKeyPress={(e) => e.key === "Enter" && handleAsk()}
            />
            <button
              onClick={handleAsk}
              disabled={!question || isLoading}
              className={isLoading ? "loading" : ""}
            >
              {isLoading ? "Processing..." : "Ask AI"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;