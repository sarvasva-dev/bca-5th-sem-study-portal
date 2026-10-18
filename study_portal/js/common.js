// Common JS for BCA 5th Sem Exam Study Portal
// Theme Engine, MCQ Runner, Code Copy, Reading Progress

// 1. Theme Management
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

// 2. Code Copy Function
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

// 3. MCQ Test Engine
class MCQEngine {
  constructor(containerId, questions) {
    this.container = document.getElementById(containerId);
    this.questions = questions;
    this.userScore = 0;
    this.answeredCount = 0;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="mcq-header">
        <span class="mcq-badge">Interactive Revision Quiz</span>
        <h3 class="mcq-title">Test Your Unit Mastery</h3>
        <p class="mcq-subtitle">${this.questions.length} Exam-Oriented High-Yield Questions</p>
      </div>
      <div id="mcq-questions-list"></div>
      <div id="mcq-score-banner" class="mcq-score-bar">
        <div class="score-text" id="mcq-score-text"></div>
        <p id="mcq-score-desc" style="font-size:13px; color:var(--text-muted); margin-top:4px;"></p>
        <button class="reset-test-btn" onclick="mcqQuiz.reset()">↺ Retake Quiz</button>
      </div>
    `;

    const list = this.container.querySelector('#mcq-questions-list');
    this.questions.forEach((q, qIndex) => {
      const qCard = document.createElement('div');
      qCard.className = 'mcq-question-card';
      qCard.id = `q-card-${qIndex}`;

      const optionsHtml = q.options.map((opt, optIndex) => `
        <button class="mcq-option" onclick="mcqQuiz.selectOption(${qIndex}, ${optIndex})">
          <span style="font-weight:700; min-width:20px;">${String.fromCharCode(65 + optIndex)}.</span>
          <span>${opt}</span>
        </button>
      `).join('');

      qCard.innerHTML = `
        <div class="mcq-q-text">Q${qIndex + 1}. ${q.question}</div>
        <div class="mcq-options" id="opt-group-${qIndex}">
          ${optionsHtml}
        </div>
        <div class="mcq-explanation" id="exp-${qIndex}">
          <strong>💡 Explanation:</strong> ${q.explanation}
        </div>
      `;
      list.appendChild(qCard);
    });
  }

  selectOption(qIndex, selectedOptIndex) {
    const qData = this.questions[qIndex];
    const optGroup = document.getElementById(`opt-group-${qIndex}`);
    const buttons = optGroup.querySelectorAll('.mcq-option');
    const expBox = document.getElementById(`exp-${qIndex}`);

    // Disable all options in this question
    buttons.forEach(btn => btn.style.pointerEvents = 'none');

    if (selectedOptIndex === qData.answer) {
      buttons[selectedOptIndex].classList.add('correct');
      this.userScore++;
    } else {
      buttons[selectedOptIndex].classList.add('wrong');
      buttons[qData.answer].classList.add('correct');
    }

    expBox.style.display = 'block';
    this.answeredCount++;

    if (this.answeredCount === this.questions.length) {
      this.showScore();
    }
  }

  showScore() {
    const banner = document.getElementById('mcq-score-banner');
    const scoreText = document.getElementById('mcq-score-text');
    const scoreDesc = document.getElementById('mcq-score-desc');
    const percent = Math.round((this.userScore / this.questions.length) * 100);

    banner.style.display = 'block';
    scoreText.innerText = `You scored ${this.userScore} / ${this.questions.length} (${percent}%)`;
    
    if (percent === 100) {
      scoreDesc.innerText = "🔥 Outstanding! You have complete command over this Unit's exam concepts!";
    } else if (percent >= 70) {
      scoreDesc.innerText = "⭐ Great work! Review the explanations above to achieve a 100% score.";
    } else {
      scoreDesc.innerText = "⚠️ Good attempt! Go through the notes again and retry to solidify your marks.";
    }

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  reset() {
    this.userScore = 0;
    this.answeredCount = 0;
    this.render();
  }
}

// 4. Reading Progress Bar
function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'reading-progress-bar';
  bar.style.position = 'fixed';
  bar.style.top = '0';
  bar.style.left = '0';
  bar.style.height = '3px';
  bar.style.background = 'var(--accent-emerald)';
  bar.style.zIndex = '1000';
  bar.style.width = '0%';
  bar.style.transition = 'width 0.1s ease';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    bar.style.width = scrolled + '%';
  });
}

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initProgressBar();
});
