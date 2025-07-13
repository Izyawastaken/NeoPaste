import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ViewPaste() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [paste, setPaste] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPaste() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase.from('pastes').select().eq('id', id).single();
        if (dbError || !data) throw dbError || new Error('Not found');
        setPaste(data);
      } catch (e) {
        setError('Failed to load paste.');
      } finally {
        setLoading(false);
      }
    }
    fetchPaste();
  }, [id]);

  return (
    <div className="container">
      <header>
        <h1 id="paste-title">{loading ? 'Loading…' : (paste?.title || 'Paste Not Found')}</h1>
        <p className="subtitle" id="paste-author">{paste?.author}</p>
      </header>
      <div id="team-container" role="main">
        {error && <div style={{color:'red'}}>{error}</div>}
        {!loading && !error && <pre>{paste?.content}</pre>}
      </div>
      <footer>
        <pre id="pasteDisplay" style={{ display: 'none' }}></pre>
        <div className="footer-buttons">
          <button className="fancy-btn" onClick={() => paste && navigator.clipboard.writeText(paste.content)}>📋 Copy to Clipboard</button>
          <button className="fancy-btn">🔀 Vertical Layout</button>
          <button className="fancy-btn">🖼️ Export as PNG</button>
          <button className="fancy-btn" type="button">Animated Sprites</button>
          <button className="fancy-btn" style={{ display: 'none' }}>Open in Calculator</button>
          <button className="fancy-btn">Show Raw Damage Modifiers</button>
          <div id="secret-btns">Visit The Creator!</div>
        </div>
      </footer>
      <div id="report-issue-container" style={{ textAlign: 'center', margin: '2rem 0' }}>
        <a href="https://github.com/Izyawastaken/NeoPaste/issues" target="_blank" rel="noopener noreferrer" className="report-btn">
          🐛 Report Issues Here
        </a>
      </div>
      <a href="/" className="back-link">Back to Paste Builder</a>
    </div>
  );
}
