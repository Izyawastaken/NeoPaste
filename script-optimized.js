// Optimized script.js with performance improvements
window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pasteForm');
  const contentArea = document.getElementById('content');
  const linkContainer = document.getElementById("paste-link");
  let lastGeneratedContentHash = null;

  // Handle Pokepaste import on paste with optimized performance
  contentArea.addEventListener('paste', async (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    if (paste.includes('pokepast.es')) {
      e.preventDefault();
      
      // Show loading indicator
      const originalPlaceholder = contentArea.placeholder;
      contentArea.placeholder = 'Importing from Pokepaste...';
      contentArea.disabled = true;
      
      try {
        const raw = await tryImportFromPokepaste(paste);
        if (raw) {
          contentArea.value = raw.trim();
        } else {
          alert("Failed to import from Pokepaste. Check the link!");
        }
      } finally {
        // Restore original state
        contentArea.placeholder = originalPlaceholder;
        contentArea.disabled = false;
        contentArea.focus();
      }
    }
  }, { passive: false });

  // Handle form submission with enhanced validation
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const raw = contentArea.value;

    // Optimized content cleaning
    const content = raw
      .replace(/[""]/g, '"')
      .replace(/\u200B/g, '')
      .replace(/\r/g, '')
      .trim();

    if (!content) {
      alert("Paste content can't be empty!");
      contentArea.focus();
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Generating...';
    submitBtn.disabled = true;

    try {
      // Hash content to detect duplicates with optimized algorithm
      const currentHash = await hashString(content);
      if (currentHash === lastGeneratedContentHash) {
        alert("This team was already pasted. Please modify it first.");
        return;
      }

      // Validate team format
      let parsedTeam;
      try {
        parsedTeam = parsePaste(content);
        if (!parsedTeam || parsedTeam.length === 0) throw new Error("Empty team");
      } catch (err) {
        alert("Invalid team format! Please check your paste.");
        return;
      }

      // Generate optimized ID
      const id = generatePasteId();

      // Save to Supabase with error handling
      const { error } = await client.from('pastes').insert([
        { 
          id, 
          title: title || null, 
          author: author || null, 
          content, 
          created_at: new Date().toISOString() 
        }
      ]);

      if (error) {
        console.error('Supabase error:', error);
        alert("Failed to save paste to database!");
        return;
      }

      lastGeneratedContentHash = currentHash;
      showLink(id);

    } catch (error) {
      console.error('Form submission error:', error);
      alert("An error occurred while creating the paste.");
    } finally {
      // Restore button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Optimized link display with better UX
  function showLink(id) {
    const fullURL = `${window.location.origin}${window.location.pathname.replace('index.html', '')}view.html?id=${id}`;

    linkContainer.innerHTML = `
      <div class="paste-output fade-in">
        <p><strong>Your Paste Link:</strong></p>
        <div class="link-buttons">
          <a class="fancy-btn" href="${fullURL}" target="_blank">View Paste</a>
          <button class="copy-link-btn fancy-btn" data-link="${fullURL}">Copy Link</button>
          <span class="link-status" style="margin-left: 10px; color: green;">Link created!</span>
        </div>
      </div>
    `;

    // Enhanced copy functionality with better feedback
    const copyBtn = linkContainer.querySelector(".copy-link-btn");
    let copyTimeout;
    
    copyBtn.addEventListener("click", async () => {
      // Prevent multiple clicks
      if (copyBtn.disabled) return;
      
      const url = copyBtn.dataset.link;
      
      try {
        await navigator.clipboard.writeText(url);
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        copyBtn.disabled = true;
        copyBtn.classList.add("copied");

        // Clear existing timeout
        if (copyTimeout) clearTimeout(copyTimeout);
        
        copyTimeout = setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.disabled = false;
          copyBtn.classList.remove("copied");
        }, 1500);
        
      } catch (error) {
        console.error('Copy failed:', error);
        copyBtn.textContent = "Copy Failed";
        copyBtn.style.backgroundColor = '#ef5350';
        
        setTimeout(() => {
          copyBtn.textContent = "Copy Link";
          copyBtn.style.backgroundColor = '';
        }, 2000);
      }
    });

    linkContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Optimized Pokepaste import with better error handling
  async function tryImportFromPokepaste(url) {
    const match = url.match(/pokepast\.es\/([a-z0-9]+)/i);
    if (!match) return null;

    const pasteId = match[1];
    const targetUrl = `https://pokepast.es/${pasteId}`;
    const proxyUrl = `https://neopasteworker.agastyawastaken.workers.dev/?url=${encodeURIComponent(targetUrl)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(proxyUrl, { 
        signal: controller.signal,
        headers: {
          'Accept': 'text/plain, text/html, */*'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      
      // Better validation for HTML responses
      if (text.toLowerCase().includes('<!doctype') || text.toLowerCase().includes('<html')) {
        throw new Error("Received HTML page instead of paste content");
      }

      // Validate that we got actual paste content
      if (text.length < 10 || !text.includes('\n')) {
        throw new Error("Invalid paste content received");
      }

      return text.trim();
      
    } catch (err) {
      console.error("Pokepaste import failed:", err);
      
      if (err.name === 'AbortError') {
        console.error("Request timed out");
      }
      
      return null;
    }
  }

  // Enhanced team parser with better error handling
  function parsePaste(text) {
    const team = [];

    // Normalize line endings
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = text.trim().split(/\n{2,}(?=\S)/g);

    for (const block of blocks) {
      const lines = block
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      if (lines.length === 0) continue;

      const mon = {
        name: "",
        nickname: "",
        gender: null,
        item: "",
        ability: "",
        shiny: false,
        teraType: "",
        evs: {},
        ivs: {},
        nature: "",
        moves: []
      };

      // Enhanced name parsing
      const firstLine = lines[0];
      const nameMatch = firstLine.match(/^(.+?)(?: \((M|F)\))? @ (.+)$/);
      const fallbackMatch = firstLine.match(/^(.+?)(?: \((M|F)\))?$/);

      if (nameMatch) {
        const fullName = nameMatch[1].trim();
        mon.gender = nameMatch[2] || null;
        mon.item = nameMatch[3].trim();
        
        // Handle nickname parsing
        const nicknameMatch = fullName.match(/^(.+?) \((.+)\)$/);
        if (nicknameMatch) {
          mon.nickname = nicknameMatch[1];
          mon.name = nicknameMatch[2];
        } else {
          mon.name = fullName;
        }
      } else if (fallbackMatch) {
        const fullName = fallbackMatch[1].trim();
        mon.gender = fallbackMatch[2] || null;
        
        // Handle nickname parsing for no-item format
        const nicknameMatch = fullName.match(/^(.+?) \((.+)\)$/);
        if (nicknameMatch) {
          mon.nickname = nicknameMatch[1];
          mon.name = nicknameMatch[2];
        } else {
          mon.name = fullName;
        }
      } else {
        continue;
      }

      // Parse remaining lines with optimized regex
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("Ability:")) {
          mon.ability = line.slice(8).trim();
        } else if (line.startsWith("Shiny:")) {
          mon.shiny = line.slice(6).trim().toLowerCase() === "yes";
        } else if (line.startsWith("Tera Type:")) {
          mon.teraType = line.slice(10).trim();
        } else if (line.startsWith("EVs:")) {
          const parts = line.slice(4).split("/");
          for (const part of parts) {
            const [val, stat] = part.trim().split(" ");
            if (val && stat) {
              mon.evs[stat.toLowerCase()] = parseInt(val, 10);
            }
          }
        } else if (line.startsWith("IVs:")) {
          const parts = line.slice(4).split("/");
          for (const part of parts) {
            const [val, stat] = part.trim().split(" ");
            if (val && stat) {
              mon.ivs[stat.toLowerCase()] = parseInt(val, 10);
            }
          }
        } else if (line.endsWith("Nature")) {
          mon.nature = line.replace("Nature", "").trim();
        } else if (line.startsWith("- ")) {
          mon.moves.push(line.slice(2).trim());
        }
      }

      team.push(mon);
    }

    return team;
  }

  // Optimized ID generation
  function generatePasteId() {
    return Math.random().toString(36).substring(2, 8) + 
           Date.now().toString(36).slice(-2);
  }

  // Optimized hash function with better performance
  async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
});
