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

// 7. Interactive Animated Video Theater Engine with Sarvam AI Voice Sync & Offline Cache

const PlayerState = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  AUDIO_UNAVAILABLE: 'AUDIO_UNAVAILABLE',
  ERROR: 'ERROR'
};

const AudioCache = {
  dbName: 'study_portal_tts_cache',
  dbVersion: 1,
  _db: null,
  async getDB() {
    if (this._db) return this._db;
    if (typeof window === 'undefined' || !window.indexedDB) return null;
    return new Promise((resolve) => {
      const req = indexedDB.open(this.dbName, this.dbVersion);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('audios')) {
          db.createObjectStore('audios', { keyPath: 'key' });
        }
      };
      req.onsuccess = () => {
        this._db = req.result;
        resolve(this._db);
      };
      req.onerror = () => resolve(null);
    });
  },
  async get(key) {
    const db = await this.getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('audios', 'readonly');
        const store = tx.objectStore('audios');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.blob : null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  },
  async set(key, blob) {
    const db = await this.getDB();
    if (!db) return;
    try {
      const tx = db.transaction('audios', 'readwrite');
      const store = tx.objectStore('audios');
      store.put({ key, blob, timestamp: Date.now() });
    } catch (err) {
      console.warn('AudioCache set error:', err);
    }
  }
};

class AnimatedVideoTheater {
  constructor(config) {
    this.canvas = document.getElementById(config.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.steps = config.steps || [];
    this.currentStep = 0;
    this.state = PlayerState.IDLE;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.progress = 0;
    this.animId = null;
    this.soundEnabled = true;
    this.currentAudio = null;
    this.currentBlobUrl = null;

    // UI elements
    this.playBtn = document.getElementById(config.playBtnId);
    this.stepIndicator = document.getElementById(config.stepIndicatorId);
    this.subEnEl = document.getElementById(config.subEnId);
    this.subHiEl = document.getElementById(config.subHiId);
    this.speedBtn = document.getElementById(config.speedBtnId);
    this.soundBtn = document.getElementById(config.soundBtnId);
    this.badgeEl = document.getElementById(config.badgeId) || (this.canvas.closest('.concept-theater') ? this.canvas.closest('.concept-theater').querySelector('.theater-badge') : null);

    this.setupCanvas();
    this.setupAccessibility();
    this.updateUI();
    this.render();

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.render();
    });
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 640;
    this.height = Math.round(this.width * 0.52);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupAccessibility() {
    this.canvas.setAttribute('tabindex', '0');
    this.canvas.setAttribute('role', 'region');
    this.canvas.setAttribute('aria-label', 'Interactive Educational Animated Video');
    this.canvas.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prevStep();
      }
    });
  }

  updateState(newState) {
    this.state = newState;
    if (this.badgeEl) {
      switch (newState) {
        case PlayerState.PLAYING:
          this.badgeEl.innerText = '▶️ Playing (60 FPS)';
          this.badgeEl.style.background = '#059669';
          break;
        case PlayerState.PAUSED:
          this.badgeEl.innerText = '⏸️ Paused';
          this.badgeEl.style.background = '#d97706';
          break;
        case PlayerState.LOADING:
          this.badgeEl.innerText = '⏳ Loading Voice...';
          this.badgeEl.style.background = '#0d9488';
          break;
        case PlayerState.AUDIO_UNAVAILABLE:
          this.badgeEl.innerText = '💬 Captions-Only Mode';
          this.badgeEl.style.background = '#475569';
          break;
        case PlayerState.COMPLETED:
          this.badgeEl.innerText = '✓ Completed';
          this.badgeEl.style.background = '#059669';
          break;
        default:
          this.badgeEl.innerText = '🎙️ Sarvam AI Voice Sync';
          this.badgeEl.style.background = '#059669';
      }
    }
  }

  updateUI() {
    if (this.stepIndicator) {
      this.stepIndicator.innerText = `Step ${this.currentStep + 1} of ${this.steps.length}: ${this.steps[this.currentStep].title}`;
    }
    if (this.subEnEl) {
      this.subEnEl.innerHTML = this.steps[this.currentStep].subEn;
    }
    if (this.subHiEl) {
      this.subHiEl.innerHTML = this.steps[this.currentStep].subHi;
    }
    if (this.playBtn) {
      this.playBtn.innerHTML = this.isPlaying ? '⏸️ Pause' : '▶️ Play Video';
      this.playBtn.setAttribute('aria-label', this.isPlaying ? 'Pause Animation' : 'Play Animation');
    }
    if (this.soundBtn) {
      this.soundBtn.innerHTML = this.soundEnabled ? '🔊 Voice ON' : '🔇 Voice OFF';
      this.soundBtn.style.color = this.soundEnabled ? '#10b981' : '#94a3b8';
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const step = this.steps[this.currentStep];
    if (step && step.draw) {
      step.draw(this.ctx, this.width, this.height, this.progress);
    }
  }

  stopCurrentAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.onended = null;
      this.currentAudio.ontimeupdate = null;
      this.currentAudio = null;
    }
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  async play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.updateState(PlayerState.PLAYING);
    this.updateUI();
    this.playStep(this.currentStep);
  }

  async playStep(stepIndex) {
    if (!this.isPlaying) return;
    this.currentStep = stepIndex;
    this.progress = 0;
    this.updateUI();
    this.stopCurrentAudio();

    const step = this.steps[stepIndex];
    if (!this.soundEnabled || !step) {
      this.updateState(PlayerState.AUDIO_UNAVAILABLE);
      this.runTimerFallback();
      return;
    }

    let audioUrl = null;

    if (step.audioSrc) {
      audioUrl = step.audioSrc;
    } else {
      const cacheKey = `tts_${stepIndex}_${(step.subHi || step.subEn).slice(0, 30)}`;
      const cachedBlob = await AudioCache.get(cacheKey);
      if (cachedBlob) {
        audioUrl = URL.createObjectURL(cachedBlob);
        this.currentBlobUrl = audioUrl;
      } else {
        try {
          this.updateState(PlayerState.LOADING);
          const resp = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: step.subHi || step.subEn, speaker: step.speaker || 'aditya' })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.audio_base64) {
              const byteCharacters = atob(data.audio_base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'audio/wav' });
              await AudioCache.set(cacheKey, blob);
              audioUrl = URL.createObjectURL(blob);
              this.currentBlobUrl = audioUrl;
            }
          }
        } catch (err) {
          console.warn('/api/tts endpoint unavailable or offline:', err);
        }
      }
    }

    if (audioUrl) {
      this.updateState(PlayerState.PLAYING);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.playbackRate = this.playbackSpeed;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          this.progress = Math.min(1, audio.currentTime / audio.duration);
          this.render();
        }
      };

      audio.onended = () => {
        this.progress = 1;
        this.render();
        setTimeout(() => {
          if (!this.isPlaying) return;
          if (this.currentStep < this.steps.length - 1) {
            this.playStep(this.currentStep + 1);
          } else {
            this.updateState(PlayerState.COMPLETED);
            this.pause();
          }
        }, 800 / this.playbackSpeed);
      };

      audio.play().catch((err) => {
        console.warn('Audio playback prevented by browser autoplay policy:', err);
        this.updateState(PlayerState.AUDIO_UNAVAILABLE);
        this.runTimerFallback();
      });
    } else {
      this.updateState(PlayerState.AUDIO_UNAVAILABLE);
      this.runTimerFallback();
    }
  }

  runTimerFallback() {
    let lastTime = performance.now();
    const duration = 5.0 / this.playbackSpeed;
    let elapsed = 0;

    const loop = (now) => {
      if (!this.isPlaying) return;
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      elapsed += dt;
      this.progress = Math.min(1, elapsed / duration);
      this.render();

      if (this.progress >= 1) {
        setTimeout(() => {
          if (!this.isPlaying) return;
          if (this.currentStep < this.steps.length - 1) {
            this.playStep(this.currentStep + 1);
          } else {
            this.updateState(PlayerState.COMPLETED);
            this.pause();
          }
        }, 800 / this.playbackSpeed);
        return;
      }
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  pause() {
    this.isPlaying = false;
    this.updateState(PlayerState.PAUSED);
    if (this.animId) cancelAnimationFrame(this.animId);
    this.stopCurrentAudio();
    this.updateUI();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentStep === this.steps.length - 1 && this.progress >= 1) {
        this.currentStep = 0;
        this.progress = 0;
      }
      this.play();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled && this.currentAudio) {
      this.currentAudio.pause();
    } else if (this.soundEnabled && this.isPlaying) {
      this.playStep(this.currentStep);
    }
    this.updateUI();
  }

  nextStep() {
    this.pause();
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.progress = 1;
      this.updateUI();
      this.render();
    }
  }

  prevStep() {
    this.pause();
    if (this.currentStep > 0) {
      this.currentStep--;
      this.progress = 1;
      this.updateUI();
      this.render();
    }
  }

  replay() {
    this.pause();
    this.currentStep = 0;
    this.progress = 0;
    this.updateUI();
    this.render();
    this.play();
  }

  toggleSpeed() {
    this.playbackSpeed = this.playbackSpeed === 1 ? 1.5 : (this.playbackSpeed === 1.5 ? 2 : 1);
    if (this.speedBtn) {
      this.speedBtn.innerText = `⚡ ${this.playbackSpeed}x`;
    }
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.playbackSpeed;
    }
  }
}

// 8. Newton-Raphson Animated Explainer Video Factory
function setupNewtonRaphsonTheater(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const f = (x) => x * x - 5;
  const fPrime = (x) => 2 * x;
  const root = Math.sqrt(5); // ~2.236068

  const steps = [
    {
      title: "Problem Setup: Root of f(x) = x² - 5 = 0",
      audioSrc: "audio/nr_step0.wav",
      subEn: "<strong>Objective:</strong> Find the positive root of $f(x) = x^2 - 5 = 0$ (i.e. $\\alpha = \\sqrt{5} \\approx 2.23607$). The teal curve represents $y = f(x)$ intersecting the x-axis at $\\alpha$.",
      subHi: "<strong>Hindi Samjhaun:</strong> Hume $f(x) = x^2 - 5 = 0$ ka positive root $\\alpha = \\sqrt{5} \\approx 2.23607$ nikalna hai. Teal curve $y = f(x)$ hai jo x-axis ko red dot $\\alpha$ par cut karta hai.",
      draw: (ctx, w, h, p) => {
        drawAxes(ctx, w, h);
        drawCurve(ctx, w, h, f);
        drawRoot(ctx, w, h, root);
      }
    },
    {
      title: "Initial Guess x₀ = 3.2 & Function Value f(x₀) = 5.24",
      audioSrc: "audio/nr_step1.wav",
      subEn: "<strong>Initial Guess:</strong> We choose $x_0 = 3.2$. Projecting vertically up gives point $(x_0, f(x_0)) = (3.2, 5.24)$ with derivative $f'(x_0) = 6.4$.",
      subHi: "<strong>Hindi Samjhaun:</strong> Pehla guess $x_0 = 3.2$ liya. Curve par point $(x_0, f(x_0)) = (3.2, 5.24)$ locate hua, jahan derivative $f'(x_0) = 6.4$ hai.",
      draw: (ctx, w, h, p) => {
        drawAxes(ctx, w, h);
        drawCurve(ctx, w, h, f);
        drawRoot(ctx, w, h, root);
        drawPointAndProjection(ctx, w, h, 3.2, f(3.2), "x₀ = 3.2", "#f59e0b", p);
      }
    },
    {
      title: "Iteration 1: Tangent Descent to x₁ = 2.38125",
      audioSrc: "audio/nr_step2.wav",
      subEn: "<strong>Tangent Line Descent:</strong> Tangent at $(x_0, f(x_0))$ strikes the x-axis at $x_1 = 3.2 - \\frac{5.24}{6.4} = \\mathbf{2.38125}$. Error drops from $0.9639$ to $0.1452$.",
      subHi: "<strong>Hindi Samjhaun:</strong> $(x_0, f(x_0))$ se tangent line x-axis ko exactly $x_1 = 2.38125$ par cut karti hai! Error $0.9639$ se ghat kar $0.1452$ ho gaya.",
      draw: (ctx, w, h, p) => {
        drawAxes(ctx, w, h);
        drawCurve(ctx, w, h, f);
        drawRoot(ctx, w, h, root);
        drawPointAndProjection(ctx, w, h, 3.2, f(3.2), "x₀ = 3.2", "#f59e0b", 1);
        const x1 = 3.2 - f(3.2) / fPrime(3.2);
        drawTangent(ctx, w, h, 3.2, f(3.2), x1, "#f59e0b", p);
        if (p > 0.8) {
          drawAxisPoint(ctx, w, h, x1, "x₁ = 2.38125", "#10b981");
        }
      }
    },
    {
      title: "Iteration 2: Quadratic Convergence (p = 2) to x₂ = 2.24049",
      audioSrc: "audio/nr_step3.wav",
      subEn: "<strong>Quadratic Convergence:</strong> Evaluating at $x_1 = 2.38125$ gives $f(x_1) = 0.67035$. Next tangent strikes at $x_2 = 2.38125 - \\frac{0.67035}{4.7625} = \\mathbf{2.24049}$. Next is $x_3 = 2.23607 \\approx \\sqrt{5}$!",
      subHi: "<strong>Hindi Samjhaun:</strong> Dusri iteration me tangent $x_1$ se seedha $x_2 = 2.24049$ par aati hai! Agle step me $x_3 = 2.23607 \\approx \\sqrt{5}$ mil jata hai!",
      draw: (ctx, w, h, p) => {
        drawAxes(ctx, w, h);
        drawCurve(ctx, w, h, f);
        drawRoot(ctx, w, h, root);
        const x1 = 3.2 - f(3.2) / fPrime(3.2);
        drawPointAndProjection(ctx, w, h, 3.2, f(3.2), "x₀", "#94a3b8", 1);
        drawTangent(ctx, w, h, 3.2, f(3.2), x1, "#94a3b8", 1);
        drawAxisPoint(ctx, w, h, x1, "x₁ = 2.38125", "#f59e0b");

        drawPointAndProjection(ctx, w, h, x1, f(x1), "", "#f59e0b", p);
        const x2 = x1 - f(x1) / fPrime(x1);
        drawTangent(ctx, w, h, x1, f(x1), x2, "#10b981", p);
        if (p > 0.8) {
          drawAxisPoint(ctx, w, h, x2, "x₂ = 2.24049", "#10b981");
        }
      }
    }
  ];

  function toScreenX(x, w) {
    // Domain [1.5, 3.8] -> [60, w - 40]
    return 60 + ((x - 1.5) / 2.3) * (w - 100);
  }

  function toScreenY(y, h) {
    // Range [-4, 9] -> [h - 40, 30]
    return (h - 40) - ((y + 4) / 13) * (h - 70);
  }

  function drawAxes(ctx, w, h) {
    const yZero = toScreenY(0, h);
    const xZero = toScreenX(1.5, w);

    // X Axis
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, yZero);
    ctx.lineTo(w - 20, yZero);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(xZero, 20);
    ctx.lineTo(xZero, h - 20);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('X (Values)', w - 70, yZero + 18);
    ctx.fillText('Y = f(X)', xZero + 8, 25);
  }

  function drawCurve(ctx, w, h, fn) {
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let first = true;
    for (let x = 1.6; x <= 3.6; x += 0.05) {
      const sx = toScreenX(x, w);
      const sy = toScreenY(fn(x), h);
      if (first) { ctx.moveTo(sx, sy); first = false; }
      else { ctx.lineTo(sx, sy); }
    }
    ctx.stroke();
  }

  function drawRoot(ctx, w, h, r) {
    const sx = toScreenX(r, w);
    const sy = toScreenY(0, h);
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('α = √5 ≈ 2.236', sx - 35, sy + 18);
  }

  function drawPointAndProjection(ctx, w, h, x, y, label, color, progress) {
    const sx = toScreenX(x, w);
    const syZero = toScreenY(0, h);
    const syTarget = toScreenY(y, h);
    const curY = syZero + (syTarget - syZero) * progress;

    ctx.strokeStyle = color;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sx, syZero);
    ctx.lineTo(sx, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (progress > 0.1) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(sx, curY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      if (label) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(label, sx + 8, curY - 6);
      }
    }
  }

  function drawTangent(ctx, w, h, x0, y0, x1, color, progress) {
    const sx0 = toScreenX(x0, w);
    const sy0 = toScreenY(y0, h);
    const sx1 = toScreenX(x1, w);
    const sy1 = toScreenY(0, h);

    const curX = sx0 + (sx1 - sx0) * progress;
    const curY = sy0 + (sy1 - sy0) * progress;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(curX, curY);
    ctx.stroke();
  }

  function drawAxisPoint(ctx, w, h, x, label, color) {
    const sx = toScreenX(x, w);
    const sy = toScreenY(0, h);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(label, sx - 25, sy - 10);
  }

  window.nrTheater = new AnimatedVideoTheater({
    canvasId: canvasId,
    playBtnId: 'nr-btn-play',
    stepIndicatorId: 'nr-step-ind',
    subEnId: 'nr-sub-en',
    subHiId: 'nr-sub-hi',
    speedBtnId: 'nr-btn-speed',
    soundBtnId: 'nr-btn-sound',
    steps: steps
  });
}

// 9. TCP 3-Way Handshake Animated Video Factory
function setupTcpHandshakeTheater(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const steps = [
    {
      title: "Initial State: Client CLOSED, Server in LISTEN Mode",
      audioSrc: "audio/tcp_step0.wav",
      subEn: "<strong>Connection Setup:</strong> Server is passive and listening on port 80/443 (<code>LISTEN</code>). Client is ready to initiate a reliable TCP connection (<code>CLOSED</code>).",
      subHi: "<strong>Hindi Samjhaun:</strong> Server port 80 par wait kar raha hai (<code>LISTEN</code>). Client abhi <code>CLOSED</code> state me hai aur connection establish karna chahta hai.",
      draw: (ctx, w, h, p) => {
        drawHosts(ctx, w, h, "CLOSED", "LISTEN");
      }
    },
    {
      title: "Step 1: Client sends SYN packet (seq = 100)",
      audioSrc: "audio/tcp_step1.wav",
      subEn: "<strong>SYN Transmission:</strong> Client generates Initial Sequence Number (ISN = 100), sets SYN flag = 1, moves to <code>SYN_SENT</code>, and transmits the segment across the network.",
      subHi: "<strong>Hindi Samjhaun:</strong> Client <code>SYN (seq=100)</code> packet bhejta hai: 'Hey server, kya tum ready ho?' Client <code>SYN_SENT</code> state me chala gaya.",
      draw: (ctx, w, h, p) => {
        drawHosts(ctx, w, h, "SYN_SENT", "LISTEN");
        drawPacket(ctx, w, h, 140, w - 140, p, "SYN (seq=100)", "#f59e0b");
      }
    },
    {
      title: "Step 2: Server responds with SYN-ACK (seq = 300, ack = 101)",
      audioSrc: "audio/tcp_step2.wav",
      subEn: "<strong>SYN-ACK Response:</strong> Server allocates connection buffers, picks its own ISN = 300, acknowledges Client's seq (ack = 100 + 1 = 101), sets SYN=1 and ACK=1, and shifts to <code>SYN_RCVD</code>.",
      subHi: "<strong>Hindi Samjhaun:</strong> Server bolta hai: 'Haan main ready hoon! Mujhe seq 100 mil gaya (ack=101), aur mera seq 300 hai.' Server <code>SYN_RCVD</code> state me chala gaya.",
      draw: (ctx, w, h, p) => {
        drawHosts(ctx, w, h, "SYN_SENT", "SYN_RCVD");
        drawPacket(ctx, w, h, w - 140, 140, p, "SYN-ACK (seq=300, ack=101)", "#14b8a6");
      }
    },
    {
      title: "Step 3: Client confirms with ACK (seq = 101, ack = 301)",
      audioSrc: "audio/tcp_step3.wav",
      subEn: "<strong>Final ACK & Connection ESTABLISHED:</strong> Client verifies ack=101, acknowledges Server's seq (ack = 300 + 1 = 301). Both sides are now in <code>ESTABLISHED</code> state, ready for full-duplex data streaming!",
      subHi: "<strong>Hindi Samjhaun:</strong> Client confirm karta hai: 'Got it! Handshake complete!' Dono sides <code>ESTABLISHED</code> ho gayi aur reliable data transfer shuru!",
      draw: (ctx, w, h, p) => {
        const clientState = p > 0.5 ? "ESTABLISHED" : "SYN_SENT";
        const serverState = p > 0.9 ? "ESTABLISHED" : "SYN_RCVD";
        drawHosts(ctx, w, h, clientState, serverState);
        drawPacket(ctx, w, h, 140, w - 140, p, "ACK (seq=101, ack=301)", "#10b981");
      }
    }
  ];

  function drawHosts(ctx, w, h, cState, sState) {
    const yCenter = h * 0.5;

    // Transmission wire
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(140, yCenter);
    ctx.lineTo(w - 140, yCenter);
    ctx.stroke();

    // Client Host (Left)
    drawHostBox(ctx, 40, yCenter - 55, 100, 110, "CLIENT", cState, "#f59e0b");

    // Server Host (Right)
    drawHostBox(ctx, w - 140, yCenter - 55, 100, 110, "SERVER", sState, "#10b981");
  }

  function drawHostBox(ctx, x, y, width, height, name, state, stateColor) {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();
    ctx.stroke();

    // Icon & Name
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name === 'CLIENT' ? '💻 Client' : '🖥️ Server', x + width / 2, y + 28);

    // State Badge
    const isEst = state === 'ESTABLISHED';
    ctx.fillStyle = isEst ? '#059669' : '#334155';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 55, width - 20, 24, 4);
    ctx.fill();

    ctx.fillStyle = isEst ? '#ffffff' : '#f59e0b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(state, x + width / 2, y + 71);
    ctx.textAlign = 'left';
  }

  function drawPacket(ctx, w, h, startX, endX, progress, label, color) {
    const curX = startX + (endX - startX) * progress;
    const yCenter = h * 0.5;

    // Glowing packet pill
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(curX - 60, yCenter - 14, 120, 28, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, curX, yCenter + 4);
    ctx.textAlign = 'left';
  }

  window.tcpTheater = new AnimatedVideoTheater({
    canvasId: canvasId,
    playBtnId: 'tcp-btn-play',
    stepIndicatorId: 'tcp-step-ind',
    subEnId: 'tcp-sub-en',
    subHiId: 'tcp-sub-hi',
    speedBtnId: 'tcp-btn-speed',
    soundBtnId: 'tcp-btn-sound',
    steps: steps
  });
}

// 10. Java JVM Memory & Execution Engine Animated Video Factory
function setupJvmMemoryTheater(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const steps = [
    {
      title: "JVM Runtime Architecture Layout",
      audioSrc: "audio/jvm_step0.wav",
      subEn: "<strong>JVM Memory Architecture:</strong> Method Area (Class metadata), Heap (Runtime Objects), and JVM Stack (Per-thread method frames).",
      subHi: "<strong>Hindi Samjhaun:</strong> JVM Memory 3 main parts me divided hai: Method Area, Heap (objects ke liye), aur Call Stack (local variables ke liye).",
      draw: (ctx, w, h, p) => {
        drawJvmLayout(ctx, w, h);
      }
    },
    {
      title: "Step 1: ClassLoader Loads Student.class into Method Area",
      audioSrc: "audio/jvm_step1.wav",
      subEn: "<strong>ClassLoader Subsystem:</strong> <code>Student.class</code> bytecode is loaded, linked, verified, and placed into the shared Method Area.",
      subHi: "<strong>Hindi Samjhaun:</strong> ClassLoader <code>Student.class</code> ko load karke Method Area me class structure aur bytecode store karta hai.",
      draw: (ctx, w, h, p) => {
        drawJvmLayout(ctx, w, h);
        drawBytecodeFlow(ctx, w, h, p);
      }
    },
    {
      title: "Step 2: Thread Call Stack Pushes main() Stack Frame",
      audioSrc: "audio/jvm_step2.wav",
      subEn: "<strong>Call Stack Activation:</strong> When <code>main()</code> is invoked, a Stack Frame is pushed containing Local Variables Array and Operand Stack.",
      subHi: "<strong>Hindi Samjhaun:</strong> Main thread start hote hi JVM Stack par <code>main()</code> method ka Frame push ho jata hai.",
      draw: (ctx, w, h, p) => {
        drawJvmLayout(ctx, w, h);
        drawStackFrame(ctx, w, h, p);
      }
    },
    {
      title: "Step 3: Object Instantiation (Student s1 = new Student('Amit'))",
      audioSrc: "audio/jvm_step3.wav",
      subEn: "<strong>Heap Allocation & Reference Pointer:</strong> <code>new</code> allocates object on Heap at address <code>0x7FA0</code>. Stack variable <code>s1</code> stores the reference address.",
      subHi: "<strong>Hindi Samjhaun:</strong> Heap me actual object banta hai (<code>name='Amit'</code>), aur Stack ka variable <code>s1</code> uske address <code>0x7FA0</code> ko point karta hai!",
      draw: (ctx, w, h, p) => {
        drawJvmLayout(ctx, w, h);
        drawStackFrame(ctx, w, h, 1);
        drawHeapObject(ctx, w, h, p, false);
      }
    },
    {
      title: "Step 4: Dereferencing (s1 = null) & Garbage Collector (GC)",
      audioSrc: "audio/jvm_step4.wav",
      subEn: "<strong>Garbage Collection (GC):</strong> When <code>s1 = null</code>, the reference pointer breaks. The unreferenced Heap object is swept by the Garbage Collector!",
      subHi: "<strong>Hindi Samjhaun:</strong> Jab reference null hota hai, link tut jati hai. Garbage Collector (GC) unused memory ko sweep karke free kar deta hai!",
      draw: (ctx, w, h, p) => {
        drawJvmLayout(ctx, w, h);
        drawStackFrame(ctx, w, h, 1);
        drawHeapObject(ctx, w, h, 1, p > 0.5);
      }
    }
  ];

  function drawJvmLayout(ctx, w, h) {
    const yTop = 30;
    const boxH = h - 60;

    // Method Area Box
    drawSectionBox(ctx, 30, yTop, w * 0.28, boxH, "Method Area", "Class & Static Data", "#0d9488");

    // JVM Stack Box
    drawSectionBox(ctx, w * 0.35, yTop, w * 0.28, boxH, "JVM Call Stack", "Stack Frames (Thread)", "#10b981");

    // Heap Area Box
    drawSectionBox(ctx, w * 0.67, yTop, w * 0.30, boxH, "Java Heap Memory", "All Objects (new)", "#f59e0b");
  }

  function drawSectionBox(ctx, x, y, width, height, title, subtitle, color) {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + width / 2, y + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText(subtitle, x + width / 2, y + 34);
    ctx.textAlign = 'left';
  }

  function drawBytecodeFlow(ctx, w, h, p) {
    const startX = 30;
    const targetY = 70 + (h - 130) * p;
    ctx.fillStyle = '#0d9488';
    ctx.beginPath();
    ctx.roundRect(40, targetY, w * 0.28 - 20, 26, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9.5px monospace';
    ctx.fillText("Student.class [Code]", 50, targetY + 17);
  }

  function drawStackFrame(ctx, w, h, p) {
    const stackX = w * 0.35 + 10;
    const stackY = h - 55 - (60 * p);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(stackX, stackY, w * 0.28 - 20, 50, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText("main() Frame", stackX + 10, stackY + 18);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '9px monospace';
    ctx.fillText("ref s1: 0x7FA0", stackX + 10, stackY + 36);
  }

  function drawHeapObject(ctx, w, h, p, isGc) {
    const heapX = w * 0.67 + 10;
    const heapY = 70;
    const stackX = w * 0.35 + w * 0.28 - 10;
    const stackY = h - 75;

    // Heap Object Block
    ctx.fillStyle = isGc ? '#fb7185' : '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(heapX, heapY, w * 0.30 - 20, 75, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText("Object [0x7FA0]", heapX + 10, heapY + 20);

    ctx.fillStyle = '#1e293b';
    ctx.font = '9px monospace';
    ctx.fillText("name: 'Amit'", heapX + 10, heapY + 40);
    ctx.fillText("roll: 101", heapX + 10, heapY + 56);

    // Pointer line from stack to heap
    if (!isGc && p > 0.3) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(stackX, stackY);
      const curX = stackX + (heapX - stackX) * p;
      const curY = stackY + (heapY + 35 - stackY) * p;
      ctx.lineTo(curX, curY);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(curX, curY, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (isGc) {
      // Disconnected indicator
      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText("⚠️ UNREFERENCED (GC SWEEP)", heapX + 5, heapY + 70);
    }
  }

  window.jvmTheater = new AnimatedVideoTheater({
    canvasId: canvasId,
    playBtnId: 'jvm-btn-play',
    stepIndicatorId: 'jvm-step-ind',
    subEnId: 'jvm-sub-en',
    subHiId: 'jvm-sub-hi',
    speedBtnId: 'jvm-btn-speed',
    soundBtnId: 'jvm-btn-sound',
    steps: steps
  });
}

// 11. Herbert Simon 4-Phase Decision Process Animated Video Factory (BCA-5001 KM)
function setupKmDecisionTheater(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const steps = [
    {
      title: "Herbert Simon's 4-Phase Decision Framework Overview",
      audioSrc: "audio/km_step0.wav",
      subEn: "<strong>Simon's Decision Process:</strong> Rational decision-making operates in 4 sequential stages (Intelligence &rarr; Design &rarr; Choice &rarr; Implementation) connected by continuous feedback loops.",
      subHi: "<strong>Hindi Samjhaun:</strong> हर्बर्ट साइमन का डिसीजन मॉडल: इंटेलिजेंस, डिज़ाइन, चॉइस और इम्प्लीमेंटेशन के 4 स्टेप्स फीडबैक लूप के साथ काम करते हैं।",
      draw: (ctx, w, h, p) => {
        drawPhaseBoxes(ctx, w, h, -1, p);
        drawDetailOverview(ctx, w, h, p);
      }
    },
    {
      title: "Phase 1: Intelligence — Environmental Scanning & Problem Discovery",
      audioSrc: "audio/km_step1.wav",
      subEn: "<strong>Phase 1 (Intelligence):</strong> Continuously scanning internal ERP records and market data to detect problems or emerging opportunities (e.g., detecting unexpected 28% drop in quarterly sales).",
      subHi: "<strong>Hindi Samjhaun:</strong> पहला चरण इंटेलिजेंस फेज़ है। डेटा स्कैन करके समस्या की खोज करना, जैसे सेल्स में अचानक 28% गिरावट डिटेक्ट होना।",
      draw: (ctx, w, h, p) => {
        drawPhaseBoxes(ctx, w, h, 0, p);
        drawDetailIntelligence(ctx, w, h, p);
      }
    },
    {
      title: "Phase 2: Design — Formulating & Modeling Alternatives",
      audioSrc: "audio/km_step2.wav",
      subEn: "<strong>Phase 2 (Design):</strong> Inventing, formulating, and simulating alternative courses of action. Mathematical models forecast the consequences of each strategy before committing capital.",
      subHi: "<strong>Hindi Samjhaun:</strong> दूसरा चरण डिज़ाइन फेज़ है। समाधान के संभावित विकल्प तैयार करना और मॉडल्स के ज़रिए उनके संभावित परिणामों का अनुमान लगाना।",
      draw: (ctx, w, h, p) => {
        drawPhaseBoxes(ctx, w, h, 1, p);
        drawDetailDesign(ctx, w, h, p);
      }
    },
    {
      title: "Phase 3: Choice — Multi-Criteria Selection & Sensitivity Analysis",
      audioSrc: "audio/km_step3.wav",
      subEn: "<strong>Phase 3 (Choice):</strong> Evaluating generated alternatives against constraints (cost, risk, ROI) using decision matrices and sensitivity analysis to select the single optimal strategy.",
      subHi: "<strong>Hindi Samjhaun:</strong> तीसरा चरण चॉइस फेज़ है। सभी विकल्पों का कॉस्ट, रिस्क और रिटर्न के आधार पर मूल्यांकन करके सबसे बेस्ट ऑप्शन को चुनना।",
      draw: (ctx, w, h, p) => {
        drawPhaseBoxes(ctx, w, h, 2, p);
        drawDetailChoice(ctx, w, h, p);
      }
    },
    {
      title: "Phase 4: Implementation & Closed-Loop Feedback",
      audioSrc: "audio/km_step4.wav",
      subEn: "<strong>Phase 4 (Implementation & Feedback):</strong> Executing the selected strategy, deploying resources, and monitoring outcomes. If performance deviates from goals, feedback loops trigger redesign or problem redefinition!",
      subHi: "<strong>Hindi Samjhaun:</strong> चौथा चरण इम्प्लीमेंटेशन है। फैसले को लागू करना और फीडबैक लूप से मॉनिटर करना ताकि कमियाँ आने पर डिज़ाइन या इंटेलिजेंस में वापस जा सकें।",
      draw: (ctx, w, h, p) => {
        drawPhaseBoxes(ctx, w, h, 3, p);
        drawDetailImplementation(ctx, w, h, p);
      }
    }
  ];

  const phases = [
    { title: "1. Intelligence", subtitle: "Problem Discovery", color: "#0d9488" },
    { title: "2. Design", subtitle: "Model Alternatives", color: "#f59e0b" },
    { title: "3. Choice", subtitle: "Select Best Option", color: "#10b981" },
    { title: "4. Implementation", subtitle: "Execute & Monitor", color: "#e11d48" }
  ];

  function drawPhaseBoxes(ctx, w, h, activeIndex, p) {
    const padX = 24;
    const boxW = (w - padX * 2 - 3 * 20) / 4;
    const boxH = 58;
    const topY = 22;

    for (let i = 0; i < 4; i++) {
      const bx = padX + i * (boxW + 20);
      const phase = phases[i];
      const isActive = (i === activeIndex);

      ctx.fillStyle = isActive ? 'rgba(30, 41, 59, 0.95)' : 'rgba(30, 41, 59, 0.6)';
      ctx.strokeStyle = isActive ? phase.color : '#475569';
      ctx.lineWidth = isActive ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.roundRect(bx, topY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      if (isActive) {
        ctx.fillStyle = phase.color;
        ctx.beginPath();
        ctx.arc(bx + 14, topY + 16, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isActive ? '#ffffff' : '#cbd5e1';
      ctx.font = isActive ? 'bold 11px sans-serif' : '10.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(phase.title, bx + (isActive ? 24 : 12), topY + 22);

      ctx.fillStyle = isActive ? phase.color : '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText(phase.subtitle, bx + 12, topY + 42);

      // Arrow to next box
      if (i < 3) {
        const arrowX = bx + boxW + 4;
        const arrowY = topY + boxH / 2;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + 11, arrowY);
        ctx.lineTo(arrowX + 8, arrowY - 3);
        ctx.moveTo(arrowX + 11, arrowY);
        ctx.lineTo(arrowX + 8, arrowY + 3);
        ctx.stroke();
      }
    }
  }

  function drawDetailOverview(ctx, w, h, p) {
    const py = 105;
    const pw = w - 48;
    const ph = h - py - 20;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(24, py, pw, ph, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText("⭐ Herbert A. Simon's Rational Decision Model (CSJMU High-Yield 10-Mark Core)", 40, py + 26);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10.5px sans-serif';
    ctx.fillText("Decision-making is not a single snap event—it is an iterative, structured system:", 40, py + 48);

    const bullets = [
      { tag: "Intelligence:", desc: "Finding occasions for making a decision (What is the problem?).", col: "#0d9488" },
      { tag: "Design:", desc: "Finding, developing, and analyzing possible courses of action (What are options?).", col: "#f59e0b" },
      { tag: "Choice:", desc: "Selecting a particular course of action from those available (Which is best?).", col: "#10b981" },
      { tag: "Implementation:", desc: "Putting selected decision into effect and evaluating results with feedback.", col: "#e11d48" }
    ];

    bullets.forEach((b, idx) => {
      const by = py + 72 + idx * 22;
      ctx.fillStyle = b.col;
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillText(b.tag, 40, by);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.fillText(b.desc, 140, by);
    });

    // Feedback Loop arc indicator
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pw - 30, py + 140);
    ctx.quadraticCurveTo(pw / 2, py + ph + 8, 80, py + 140);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText("Closed-Loop Feedback: Iteration occurs whenever outcomes fail criteria", 130, py + ph - 8);
  }

  function drawDetailIntelligence(ctx, w, h, p) {
    const py = 105;
    const pw = w - 48;
    const ph = h - py - 20;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(24, py, pw, ph, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText("📡 Phase 1 Work Area: Environmental Scanning & Problem Detection", 40, py + 26);

    // Data sources
    const sources = ["ERP Database", "Sales Log", "Market Intelligence", "Customer Feedback"];
    sources.forEach((s, idx) => {
      const sx = 40 + idx * 145;
      const sy = py + 45;
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(sx, sy, 135, 26, 4);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9.5px sans-serif';
      ctx.fillText(s, sx + 10, sy + 17);
    });

    // Scanner beam animation
    const scanX = 40 + (pw - 80) * p;
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scanX, py + 45);
    ctx.lineTo(scanX, py + 71);
    ctx.stroke();

    // Alert Box triggered by scanning
    if (p > 0.4) {
      ctx.fillStyle = 'rgba(225, 29, 72, 0.18)';
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(40, py + 86, pw - 80, 52, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText("⚠️ PROBLEM DETECTED BY DSS EXCEPTION MONITOR:", 52, py + 106);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px monospace';
      ctx.fillText("Quarterly Revenue Deficit: -28.4% below forecast in Region-North (Threshold = -5%).", 52, py + 125);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9.5px sans-serif';
    ctx.fillText("DSS Role: Query tools, executive dashboards, and statistical variance filters detect deviations automatically.", 40, py + ph - 10);
  }

  function drawDetailDesign(ctx, w, h, p) {
    const py = 105;
    const pw = w - 48;
    const ph = h - py - 20;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(24, py, pw, ph, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText("⚙️ Phase 2 Work Area: Formulating & Simulating Strategic Alternatives", 40, py + 26);

    const alts = [
      { name: "Alternative A: Targeted Social & Search Campaign", cost: "₹1.5 Lakh", roi: "+32% Growth", risk: "Low", fit: "High" },
      { name: "Alternative B: Direct 15% Price Reduction", cost: "Margin Loss", roi: "+14% Volume", risk: "High", fit: "Low" },
      { name: "Alternative C: Regional Wholesale Incentives", cost: "₹2.2 Lakh", roi: "+24% Growth", risk: "Med", fit: "Med" }
    ];

    alts.forEach((a, idx) => {
      const ay = py + 46 + idx * 32;
      const progressThresh = 0.2 + idx * 0.25;
      const show = p >= progressThresh;

      ctx.fillStyle = show ? '#334155' : 'rgba(51, 65, 85, 0.4)';
      ctx.beginPath();
      ctx.roundRect(40, ay, pw - 80, 27, 4);
      ctx.fill();

      ctx.fillStyle = show ? '#ffffff' : '#64748b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(a.name, 50, ay + 17);

      if (show) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '9px monospace';
        ctx.fillText(`Cost: ${a.cost} | Est. ROI: ${a.roi} | Risk: ${a.risk}`, 380, ay + 17);
      }
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9.5px sans-serif';
    ctx.fillText("DSS Role: Forecasting models, linear programming, and Monte Carlo simulation estimate consequences.", 40, py + ph - 10);
  }

  function drawDetailChoice(ctx, w, h, p) {
    const py = 105;
    const pw = w - 48;
    const ph = h - py - 20;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(24, py, pw, ph, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText("🎯 Phase 3 Work Area: Multi-Criteria Selection & Sensitivity Matrix", 40, py + 26);

    // Matrix Header
    const my = py + 46;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, my, pw - 80, 22);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText("CANDIDATE ALTERNATIVE", 50, my + 15);
    ctx.fillText("ROI WEIGHT (40%)", 240, my + 15);
    ctx.fillText("RISK SCORE (30%)", 360, my + 15);
    ctx.fillText("SPEED (30%)", 480, my + 15);
    ctx.fillText("TOTAL SCORE", 570, my + 15);

    // Row 1: Option A (Selected)
    const isSelected = p > 0.4;
    ctx.fillStyle = isSelected ? 'rgba(16, 185, 129, 0.18)' : '#334155';
    ctx.strokeStyle = isSelected ? '#10b981' : '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(40, my + 26, pw - 80, 26, 4);
    ctx.fill();
    if (isSelected) ctx.stroke();

    ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText(isSelected ? "✓ Option A: Digital Campaign" : "Option A: Digital Campaign", 50, my + 43);
    ctx.fillText("36 / 40", 250, my + 43);
    ctx.fillText("28 / 30", 370, my + 43);
    ctx.fillText("27 / 30", 490, my + 43);
    ctx.fillStyle = '#10b981';
    ctx.fillText("91 / 100", 580, my + 43);

    // Row 2: Option B
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(40, my + 56, pw - 80, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText("Option B: Price Reduction", 50, my + 72);
    ctx.fillText("16 / 40", 250, my + 72);
    ctx.fillText("12 / 30", 370, my + 72);
    ctx.fillText("29 / 30", 490, my + 72);
    ctx.fillText("57 / 100", 580, my + 72);

    if (isSelected) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText("🏆 RATIONAL CHOICE: Option A selected with highest multi-attribute utility value (91/100).", 40, py + ph - 12);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px sans-serif';
      ctx.fillText("DSS Role: Sensitivity analysis, What-If criteria weighting, and decision trees ensure rational choice.", 40, py + ph - 12);
    }
  }

  function drawDetailImplementation(ctx, w, h, p) {
    const py = 105;
    const pw = w - 48;
    const ph = h - py - 20;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(24, py, pw, ph, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText("🚀 Phase 4 Work Area: Execution & Continuous Closed-Loop Feedback", 40, py + 26);

    // Milestones
    const stepsList = [
      { label: "1. Budget Allocated", done: true },
      { label: "2. Marketing Team Briefed", done: true },
      { label: "3. Campaign Deployed to Production", done: p > 0.3 },
      { label: "4. Real-Time Telemetry Monitored", done: p > 0.6 }
    ];

    stepsList.forEach((s, idx) => {
      const sx = 40 + idx * 145;
      const sy = py + 46;
      ctx.fillStyle = s.done ? '#064e3b' : '#334155';
      ctx.strokeStyle = s.done ? '#10b981' : '#475569';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(sx, sy, 135, 26, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = s.done ? '#a7f3d0' : '#94a3b8';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText((s.done ? "✓ " : "○ ") + s.label, sx + 6, sy + 17);
    });

    // Dynamic Feedback Loop Arrow running across bottom back to Intelligence
    const feedbackProgress = Math.min(1, Math.max(0, (p - 0.4) / 0.6));
    const startX = pw - 20;
    const endX = 50;
    const curX = startX - (startX - endX) * feedbackProgress;
    const arcY = py + 105;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(startX, arcY);
    ctx.lineTo(curX, arcY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (feedbackProgress > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(curX, arcY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.fillText("🔄 Closed-Loop Feedback: Telemetry returns to Intelligence & Design if Variance > 5%", 60, arcY - 8);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9.5px sans-serif';
    ctx.fillText("DSS Role: Post-implementation performance tracking; triggers corrective loop if sales deviate from target.", 40, py + ph - 10);
  }

  window.kmTheater = new AnimatedVideoTheater({
    canvasId: canvasId,
    playBtnId: 'km-btn-play',
    stepIndicatorId: 'km-step-ind',
    subEnId: 'km-sub-en',
    subHiId: 'km-sub-hi',
    speedBtnId: 'km-btn-speed',
    soundBtnId: 'km-btn-sound',
    steps: steps
  });
}

// 12. Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initStudyMode();
  updateCompletionUI();
  typesetMath();

  // Auto-mount animation theaters if their canvas elements exist
  if (document.getElementById('nr-theater-canvas')) {
    setupNewtonRaphsonTheater('nr-theater-canvas');
  }
  if (document.getElementById('tcp-theater-canvas')) {
    setupTcpHandshakeTheater('tcp-theater-canvas');
  }
  if (document.getElementById('jvm-theater-canvas')) {
    setupJvmMemoryTheater('jvm-theater-canvas');
  }
  if (document.getElementById('km-theater-canvas')) {
    setupKmDecisionTheater('km-theater-canvas');
  }
});



