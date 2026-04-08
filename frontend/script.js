const API = "http://127.0.0.1:8000";

// ─── Sample News ───────────────────────────────────────────────
const SAMPLE_NEWS = [
    "Apple beats earnings expectations with record iPhone sales.",
    "Federal Reserve raises interest rates by 25 basis points.",
    "Oil prices crash amid global demand concerns.",
    "Tesla reports surprise quarterly profit, stock surges.",
    "Banking sector faces pressure as bond yields spike.",
    "Amazon announces layoffs amid slowing cloud growth.",
    "Inflation cools for third straight month, markets rally.",
    "Silicon Valley Bank collapses, regulators intervene.",
    "Bitcoin surges past $70,000 on ETF approval news.",
    "European markets drop as geopolitical tensions rise.",
];

// ─── History (stored in memory) ───────────────────────────────
let history = [];
let sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

// ─── Robot Cursor ──────────────────────────────────────────────
// ─── Robot head tilt toward mouse ─────────────────────────────
const robotSvg    = document.getElementById("robot-svg");
const leftPupil   = document.getElementById("left-pupil");
const leftShine   = document.getElementById("left-shine");
const rightPupil  = document.getElementById("right-pupil");
const rightShine  = document.getElementById("right-shine");
const mouthBar    = document.getElementById("mouth-bar");

document.addEventListener("mousemove", (e) => {
    const wrap = document.getElementById("robot-wrap");
    const rect = wrap.getBoundingClientRect();

    // Centre of the robot
    const robotCX = rect.left + rect.width / 2;
    const robotCY = rect.top  + rect.height / 2;

    const dx = e.clientX - robotCX;
    const dy = e.clientY - robotCY;

    // Tilt head toward cursor — max ±18deg horizontal, ±10deg vertical
    const tiltX = Math.max(-10, Math.min(10,  (dy / window.innerHeight) * 30));
    const tiltY = Math.max(-18, Math.min(18,  (dx / window.innerWidth)  * 50));

    robotSvg.style.transform = `rotate3d(${-tiltX}, ${tiltY}, 0, ${Math.sqrt(tiltX**2 + tiltY**2)}deg)`;

    // Pupils track cursor
    moveEye(leftPupil,  leftShine,  20, 28, e.clientX, e.clientY, rect);
    moveEye(rightPupil, rightShine, 40, 28, e.clientX, e.clientY, rect);
});

function moveEye(pupil, shine, eyeCX, eyeCY, mx, my, rect) {
    const scale  = rect.width / 60;
    const eyeSX  = rect.left + eyeCX * scale;
    const eyeSY  = rect.top  + eyeCY * scale;
    const dx     = mx - eyeSX;
    const dy     = my - eyeSY;
    const dist   = Math.sqrt(dx * dx + dy * dy);
    const maxR   = 2.5;
    const nx     = dist > 0 ? dx / dist : 0;
    const ny     = dist > 0 ? dy / dist : 0;
    const travel = Math.min(dist / (rect.width * 0.5), 1) * maxR;

    pupil.setAttribute("cx", eyeCX + nx * travel);
    pupil.setAttribute("cy", eyeCY + ny * travel);
    shine.setAttribute("cx", eyeCX + nx * travel + 1.5);
    shine.setAttribute("cy", eyeCY + ny * travel - 1.5);
}

// ─── Char counter ──────────────────────────────────────────────
document.getElementById("inputText").addEventListener("input", function() {
    document.getElementById("charCount").textContent = this.value.length;
});

// ─── Buttons ───────────────────────────────────────────────────
function getRandom() {
    const pick = SAMPLE_NEWS[Math.floor(Math.random() * SAMPLE_NEWS.length)];
    const ta = document.getElementById("inputText");
    ta.value = pick;
    document.getElementById("charCount").textContent = pick.length;
}

function clearAll() {
    document.getElementById("inputText").value = "";
    document.getElementById("charCount").textContent = "0";
    document.getElementById("output").innerHTML = "";
}

// ─── Analyze ───────────────────────────────────────────────────
async function analyze() {
    const text = document.getElementById("inputText").value.trim();
    if (!text) {
        showOutput("<p class='error'>⚠️ Please enter some news text first.</p>");
        return;
    }

    showOutput("<div class='loading'><div class='spinner'></div> Analyzing…</div>");

    try {
        const res = await fetch(`${API}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        const p = data.parsed || {};
        const sentiment = (p.sentiment || "neutral").toLowerCase();

        // Update mouth to reflect sentiment
        mouthBar.style.width = sentiment === "positive" ? "22px"
                             : sentiment === "negative" ? "4px"
                             : "8px";

        showOutput(`
            <div class="result-card border-${sentiment}">
                <div class="result-row"><span class="label">Model</span><span>${data.model}</span></div>
                <div class="result-row">
                    <span class="label">Sentiment</span>
                    <span class="badge ${sentiment}">${p.sentiment || "—"}</span>
                </div>
                <div class="result-row"><span class="label">Category</span><span>${p.category || "—"}</span></div>
                <div class="result-row reasoning-row"><span class="label">Reasoning</span><span>${p.reasoning || "—"}</span></div>
                <div class="result-row"><span class="label">Latency</span><span>${data.latency}s</span></div>
            </div>
        `);

        // Add to history
        addToHistory(text, p, data.latency);

    } catch (err) {
        showOutput(`<p class='error'>❌ ${err.message} — is the backend running?</p>`);
    }
}

// ─── History ───────────────────────────────────────────────────
function addToHistory(text, parsed, latency) {
    const sentiment = (parsed.sentiment || "neutral").toLowerCase();
    const entry = { text, parsed, latency, time: new Date().toLocaleTimeString() };
    history.unshift(entry);

    const key = sentiment === "positive" ? "positive"
              : sentiment === "negative" ? "negative" : "neutral";
    sentimentCounts[key]++;

    renderHistory();
    renderChart();
    document.getElementById("history-section").style.display = "block";
    document.getElementById("chart-section").style.display   = "block";
}

function renderHistory() {
    document.getElementById("history-list").innerHTML = history.slice(0, 8).map(e => `
        <div class="history-item">
            <span class="badge ${(e.parsed.sentiment||'neutral').toLowerCase()}">${e.parsed.sentiment||'?'}</span>
            <span class="history-text">${e.text.slice(0, 70)}${e.text.length > 70 ? '…' : ''}</span>
            <span class="history-time">${e.time}</span>
        </div>
    `).join("");
}

function clearHistory() {
    history = [];
    sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    document.getElementById("history-section").style.display = "none";
    document.getElementById("chart-section").style.display   = "none";
}

function renderChart() {
    const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative || 1;
    ["positive", "neutral", "negative"].forEach(k => {
        const pct = Math.round(sentimentCounts[k] / total * 100);
        document.getElementById(`bar-${k}`).style.width = pct + "%";
        document.getElementById(`count-${k}`).textContent = sentimentCounts[k];
    });
}

// ─── Compare ───────────────────────────────────────────────────
async function compare() {
    const text = document.getElementById("inputText").value.trim();
    if (!text) {
        document.getElementById("leaderboard").innerHTML = "<p class='error'>⚠️ Enter some news text first.</p>";
        return;
    }
    document.getElementById("leaderboard").innerHTML = "<div class='loading'><div class='spinner'></div> Comparing models…</div>";

    try {
        const res = await fetch(`${API}/compare`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();

        let rows = "";
        for (let modelName in data) {
            const m = data[modelName];
            const p = m.parsed || {};
            const s = (p.sentiment || "").toLowerCase();
            rows += `<tr>
                <td><strong>${modelName}</strong></td>
                <td>${m.latency != null ? m.latency + "s" : "—"}</td>
                <td>${s ? `<span class="badge ${s}">${p.sentiment}</span>` : "—"}</td>
                <td>${p.category || "—"}</td>
                <td>${m.error ? "❌ " + m.error : p.reasoning || "—"}</td>
            </tr>`;
        }

        document.getElementById("leaderboard").innerHTML = `
            <table>
                <thead><tr><th>Model</th><th>Latency</th><th>Sentiment</th><th>Category</th><th>Reasoning</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>`;
    } catch (err) {
        document.getElementById("leaderboard").innerHTML = `<p class='error'>❌ ${err.message}</p>`;
    }
}

function showOutput(html) {
    document.getElementById("output").innerHTML = html;
}
