import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// Placeholder for CreatePaste page (to be implemented with logic from index.html/script.js)
export default function CreatePaste() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!content.trim()) {
        setError("Paste content can't be empty!");
        setLoading(false);
        return;
      }
      // Insert into Supabase
      const id = Math.random().toString(36).substring(2, 8);
      const { error: dbError } = await supabase.from('pastes').insert([
        { id, title, author, content, created_at: new Date().toISOString() }
      ]);
      if (dbError) throw dbError;
      setLink(`${window.location.origin}/view/${id}`);
      setLoading(false);
    } catch (e) {
      setError('Failed to create paste.');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>NeoPaste</h1>
        <p className="subtitle">Create a new paste</p>
      </header>
      <form onSubmit={handleSubmit} style={{marginBottom:'1.5rem'}}>
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Author (optional)"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <textarea
          placeholder="Paste your team here..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={10}
        />
        <button type="submit" className="fancy-btn" disabled={loading}>
          {loading ? 'Saving…' : 'Create Paste'}
        </button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      {link && (
        <div className="paste-output fade-in">
          <p><strong>Your Paste Link:</strong></p>
          <div className="link-buttons">
            <a className="fancy-btn" href={link} target="_blank" rel="noopener noreferrer">🔗 View Paste</a>
            <button className="copy-link-btn fancy-btn" onClick={() => {navigator.clipboard.writeText(link)}}>📋 Copy Link</button>
            <span className="link-status" style={{marginLeft:10, color:'green'}}>✅ Link updated!</span>
          </div>
        </div>
      )}
    </div>
  );
}
