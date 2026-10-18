// Common JS for BCA 5th Sem Exam Study Portal
// Theme Engine, Dual Study Track, MCQ Runner, Code Copy, Reading Progress

// 1. MathJax Dynamic Typesetting Helper
function typesetMath() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch((err) => console.warn('MathJax typeset error:', err));
  }
}

// 2. Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('study_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('study_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }
}

// 3. Dual Study Track Management (Essential Pass vs Full Understanding)
function initStudyMode() {
  const savedMode = localStorage.getItem('study_mode') || 'full';
  setStudyMode(savedMode, false);
}

function setStudyMode(mode, save = true) {
  if (save) localStorage.setItem('study_mode', mode);
  
  const passBtn = document.getElementById('btn-mode-pass');
  const fullBtn = document.getElementById('btn-mode-full');

  if (mode === 'pass') {
    document.body.classList.add('mode-pass-active');
    if (passBtn) passBtn.classList.add('active');
    if (fullBtn) fullBtn.classList.remove('active');
  } else {
    document.body.classList.remove('mode-pass-active');
    if (fullBtn) fullBtn.classList.add('active');
    if (passBtn) passBtn.classList.remove('active');
  }

  // Trigger MathJax re-typeset when DOM visibility shifts
  setTimeout(typesetMath, 50);
}

// 4. Code Copy Function
function copyCode(btn, codeId) {
  const codeEl = document.getElementById(codeId);
  if (!codeEl) return;
  const text = codeEl.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.innerText;
    btn.innerText = 'Copied! ✓';
    btn.style.background = 'var(--accent-emerald)';
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = '';
    }, 2000);
  }).catch(() => {
    alert('Failed to copy code.');
  });
}

// 5. Unit Completion Tracker
function markUnitCompleted(unitId) {
  const completed = JSON.parse(localStorage.getItem('completed_units') || '{}');
  completed[unitId] = true;
  localStorage.setItem('completed_units', JSON.stringify(completed));
  updateCompletionUI();
}

function updateCompletionUI() {
  const completed = JSON.parse(localStorage.getItem('completed_units') || '{}');
  document.querySelectorAll('[data-unit-id]').forEach(el => {
    const uid = el.getAttribute('data-unit-id');
    if (completed[uid]) {
      el.classList.add('completed');
      const badge = el.querySelector('.unit-status-badge');
      if (badge) {
        badge.innerText = 'Completed ✓';
        badge.style.background = 'var(--accent-emerald)';
        badge.style.color = '#fff';
      }
    }
  });
}

// 6. Comprehensive MCQ Test Engine
class MCQEngine {
  constructor(containerId, questions) {
    this.container = document.getElementById(containerId);
    this.questions = questions;
    this.userAnswers = new Array(questions.length).fill(null);
    this.userScore = 0;
    this.submitted = false;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="mcq-header">
        <span class="mcq-badge">Exam Mastery Quiz</span>
        <h3 class="mcq-title">Test Your Unit Knowledge</h3>
        <p class="mcq-subtitle">${this.questions.length} Rigorous University-Standard Questions</p>
      </div>

      <div class="mcq-progress-bar-container" style="background:var(--border-color); height:6px; border-radius:3px; margin:12px 0 20px 0; overflow:hidden;">
        <div id="mcq-progress-fill" style="background:var(--accent-emerald); height:100%; width:0%; transition:width 0.3s ease;"></div>
      </div>

      <div id="mcq-questions-list"></div>

      <div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;">
        <button id="mcq-submit-btn" class="nav-unit-btn primary" style="flex:1;" onclick="mcqQuiz.submitTest()">Submit Test & View Detailed Score</button>
        <button id="mcq-reset-btn" class="nav-unit-btn" style="display:none;" onclick="mcqQuiz.reset()">↺ Reset & Retake</button>
      </div>

      <div id="mcq-score-banner" class="mcq-score-bar" style="display:none; margin-top:20px;">
        <div class="score-text" id="mcq-score-text"></div>
        <p id="mcq-score-desc" style="font-size:13.5px; color:var(--text-muted); margin:6px 0 12px 0;"></p>
        <div id="mcq-score-breakdown" style="font-size:13px; margin-bottom:12px;"></div>
      </div>
    `;

    const list = this.container.querySelector('#mcq-questions-list');
    this.questions.forEach((q, qIndex) => {
      const qCard = document.createElement('div');
      qCard.className = 'mcq-question-card';
      qCard.id = `q-card-${qIndex}`;

      const optionsHtml = q.options.map((opt, optIndex) => `
        <button class="mcq-option" id="opt-btn-${qIndex}-${optIndex}" onclick="mcqQuiz.selectOption(${qIndex}, ${optIndex})">
          <span style="font-weight:700; min-width:22px;">${String.fromCharCode(65 + optIndex)}.</span>
          <span>${opt}</span>
        </button>
      `).join('');

      const pyqTag = q.is_pyq ? `<span class="badge badge-amber" style="margin-left:6px; font-size:10px;">⭐ PYQ</span>` : '';

      qCard.innerHTML = `
        <div class="mcq-q-text">
          <span style="font-weight:800; color:var(--accent-emerald);">Q${qIndex + 1}.</span> 
          ${q.question} ${pyqTag}
        </div>
        <div class="mcq-options" id="opt-group-${qIndex}">
          ${optionsHtml}
        </div>
        <div class="mcq-explanation" id="exp-${qIndex}" style="display:none; margin-top:10px; padding:10px; background:var(--surface-alt); border-left:3px solid var(--accent-emerald); border-radius:4px; font-size:13px;">
          <strong>💡 Solution & Explanation:</strong> ${q.explanation}
        </div>
      `;
      list.appendChild(qCard);
    });

    typesetMath();
  }

  selectOption(qIndex, optIndex) {
    if (this.submitted) return; // Prevent change after submit

    this.userAnswers[qIndex] = optIndex;
    const optGroup = document.getElementById(`opt-group-${qIndex}`);
    const buttons = optGroup.querySelectorAll('.mcq-option');
    buttons.forEach((btn, idx) => {
      if (idx === optIndex) {
        btn.style.borderColor = 'var(--accent-emerald)';
        btn.style.background = 'var(--accent-emerald-light)';
      } else {
        btn.style.borderColor = '';
        btn.style.background = '';
      }
    });

    // Update progress bar
    const answeredCount = this.userAnswers.filter(a => a !== null).length;
    const progressFill = document.getElementById('mcq-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${(answeredCount / this.questions.length) * 100}%`;
    }
  }

  submitTest() {
    const unanswered = this.userAnswers.filter(a => a === null).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    }

    this.submitted = true;
    this.userScore = 0;

    this.questions.forEach((q, qIndex) => {
      const selected = this.userAnswers[qIndex];
      const optGroup = document.getElementById(`opt-group-${qIndex}`);
      const buttons = optGroup.querySelectorAll('.mcq-option');
      const expBox = document.getElementById(`exp-${qIndex}`);

      // Lock buttons
      buttons.forEach(btn => btn.style.pointerEvents = 'none');

      // Highlight correct answer
      buttons[q.answer].classList.add('correct');

      if (selected !== null) {
        if (selected === q.answer) {
          this.userScore++;
        } else {
          buttons[selected].classList.add('wrong');
        }
      }

      expBox.style.display = 'block';
    });

    const submitBtn = document.getElementById('mcq-submit-btn');
    const resetBtn = document.getElementById('mcq-reset-btn');
    if (submitBtn) submitBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'inline-block';

    this.showScore();
    typesetMath();
  }

  showScore() {
    const banner = document.getElementById('mcq-score-banner');
    const scoreText = document.getElementById('mcq-score-text');
    const scoreDesc = document.getElementById('mcq-score-desc');
    const scoreBreakdown = document.getElementById('mcq-score-breakdown');
    const percent = Math.round((this.userScore / this.questions.length) * 100);

    banner.style.display = 'block';
    scoreText.innerText = `Final Score: ${this.userScore} / ${this.questions.length} (${percent}%)`;

    if (percent === 100) {
      scoreDesc.innerText = "🔥 Flawless performance! You have mastered every key concept in this unit!";
    } else if (percent >= 75) {
      scoreDesc.innerText = "⭐ Excellent grasp! Review the flagged explanations below to seal your full marks.";
    } else if (percent >= 50) {
      scoreDesc.innerText = "👍 Passing foundation! Review the Essential Pass summary notes and retry.";
    } else {
      scoreDesc.innerText = "⚠️ Weak performance detected. Study the Full Understanding track and retake.";
    }

    scoreBreakdown.innerHTML = `
      <span>Correct: <strong style="color:var(--accent-emerald);">${this.userScore}</strong></span> | 
      <span>Incorrect: <strong style="color:var(--accent-coral);">${this.questions.length - this.userScore}</strong></span>
    `;

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  reset() {
    this.userAnswers = new Array(this.questions.length).fill(null);
    this.userScore = 0;
    this.submitted = false;
    this.render();
  }
}

// 7. Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initStudyMode();
  updateCompletionUI();
  typesetMath();
});
