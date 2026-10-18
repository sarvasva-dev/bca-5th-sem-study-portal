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

// 7. Interactive Animated Video Theater Engine with Sarvam AI Voice Sync
class AnimatedVideoTheater {
  constructor(config) {
    this.canvas = document.getElementById(config.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.steps = config.steps || [];
    this.currentStep = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.progress = 0;
    this.animId = null;
    this.soundEnabled = true;
    this.currentAudio = null;

    // UI elements
    this.playBtn = document.getElementById(config.playBtnId);
    this.stepIndicator = document.getElementById(config.stepIndicatorId);
    this.subEnEl = document.getElementById(config.subEnId);
    this.subHiEl = document.getElementById(config.subHiId);
    this.speedBtn = document.getElementById(config.speedBtnId);
    this.soundBtn = document.getElementById(config.soundBtnId);

    this.setupCanvas();
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
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.updateUI();
    this.playStep(this.currentStep);
  }

  playStep(stepIndex) {
    if (!this.isPlaying) return;
    this.currentStep = stepIndex;
    this.progress = 0;
    this.updateUI();
    this.stopCurrentAudio();

    const step = this.steps[stepIndex];
    if (this.soundEnabled && step && step.audioSrc) {
      const audio = new Audio(step.audioSrc);
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
            this.pause();
          }
        }, 800 / this.playbackSpeed);
      };

      audio.play().catch((err) => {
        console.warn('Audio autoplay prevented, using timer fallback:', err);
        this.runTimerFallback();
      });
    } else {
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
  const root = Math.sqrt(5); // ~2.236

  const steps = [
    {
      title: "Problem Setup & Continuous Function Curve",
      audioSrc: "audio/nr_step0.wav",
      subEn: "<strong>Objective:</strong> Find the positive root of $f(x) = x^2 - 5 = 0$ (i.e. $\\sqrt{5} \\approx 2.2361$). The green curve represents $y = f(x)$ intersecting the x-axis at $\\alpha$.",
      subHi: "<strong>Hindi Samjhaun:</strong> Hume $x^2 - 5 = 0$ ka positive root $\\sqrt{5}$ nikalna hai. Green curve $y = f(x)$ hai jo x-axis ko red dot $\\alpha$ par cut karta hai.",
      draw: (ctx, w, h, p) => {
        drawAxes(ctx, w, h);
        drawCurve(ctx, w, h, f);
        drawRoot(ctx, w, h, root);
      }
    },
    {
      title: "Initial Guess $x_0 = 3.2$ & Function Point",
      audioSrc: "audio/nr_step1.wav",
      subEn: "<strong>Initial Guess:</strong> We choose $x_0 = 3.2$. Projecting vertically up gives the curve point $(x_0, f(x_0)) = (3.2, 5.24)$.",
      subHi: "<strong>Hindi Samjhaun:</strong> Pehla guess $x_0 = 3.2$ liya. Yahan se upar curve par point $(x_0, f(x_0))$ locate hua.",
      draw: (ctx, w, h, p) => {
        drawAxes(ctx, w, h);
        drawCurve(ctx, w, h, f);
        drawRoot(ctx, w, h, root);
        drawPointAndProjection(ctx, w, h, 3.2, f(3.2), "x₀ = 3.2", "#f59e0b", p);
      }
    },
    {
      title: "Iteration 1: Tangent Descent to $x_1 = 2.381$",
      audioSrc: "audio/nr_step2.wav",
      subEn: "<strong>Tangent Line Descent:</strong> The tangent at $(x_0, f(x_0))$ has slope $f'(x_0) = 6.4$. Following this tangent down hits the x-axis at $x_1 = 3.2 - \\frac{5.24}{6.4} = \\mathbf{2.381}$.",
      subHi: "<strong>Hindi Samjhaun:</strong> $(x_0, f(x_0))$ se tangent draw hui. Tangent line tezi se neeche aakar x-axis ko $x_1 = 2.381$ par cut karti hai!",
      draw: (ctx, w, h, p) => {
        drawAxes(ctx, w, h);
        drawCurve(ctx, w, h, f);
        drawRoot(ctx, w, h, root);
        drawPointAndProjection(ctx, w, h, 3.2, f(3.2), "x₀ = 3.2", "#f59e0b", 1);
        const x1 = 3.2 - f(3.2) / fPrime(3.2);
        drawTangent(ctx, w, h, 3.2, f(3.2), x1, "#f59e0b", p);
        if (p > 0.8) {
          drawAxisPoint(ctx, w, h, x1, "x₁ = 2.381", "#10b981");
        }
      }
    },
    {
      title: "Iteration 2: Quadratic Convergence ($p=2$) to $x_2 = 2.239$",
      audioSrc: "audio/nr_step3.wav",
      subEn: "<strong>Quadratic Convergence in Action:</strong> From $x_1 = 2.381$, we project up and cast the second tangent. It strikes at $x_2 = \\mathbf{2.239}$, virtually identical to true root $\\alpha = 2.236$ in just 2 steps!",
      subHi: "<strong>Hindi Samjhaun:</strong> Dusri iteration me tangent $x_1$ se seedha $x_2 = 2.239$ par aati hai! Sirf 2 steps me accuracy double ho gayi!",
      draw: (ctx, w, h, p) => {
        drawAxes(ctx, w, h);
        drawCurve(ctx, w, h, f);
        drawRoot(ctx, w, h, root);
        const x1 = 3.2 - f(3.2) / fPrime(3.2);
        drawPointAndProjection(ctx, w, h, 3.2, f(3.2), "x₀", "#94a3b8", 1);
        drawTangent(ctx, w, h, 3.2, f(3.2), x1, "#94a3b8", 1);
        drawAxisPoint(ctx, w, h, x1, "x₁", "#f59e0b");

        drawPointAndProjection(ctx, w, h, x1, f(x1), "", "#f59e0b", p);
        const x2 = x1 - f(x1) / fPrime(x1);
        drawTangent(ctx, w, h, x1, f(x1), x2, "#10b981", p);
        if (p > 0.8) {
          drawAxisPoint(ctx, w, h, x2, "x₂ = 2.239", "#10b981");
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

// 11. Global Initialization
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
});


