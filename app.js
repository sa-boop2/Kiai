/* ============================================================
   Kiai Premium - Main Application Logic
   ============================================================ */

const App = {
  // --- STATE ---
  state: {
    currentView: 'dashboard',
    currentDay: 1,
    gymSchedule: { 0: 'rest', 1: 'rest', 2: 'rest', 3: 'rest', 4: 'rest', 5: 'rest', 6: 'rest' },
    todayGymType: 'rest',
    startDate: null,
    completedDays: [],
    benchmarks: [],
    unlockedAchievements: [],
    totalTimeSeconds: 0,
    streak: 0,
    lastWorkoutDate: null,
    theme: 'dark',
    durationMultiplier: 1.0
  },

  workout: {
    data: null,
    queue: [],
    currentIndex: 0,
    timeRemaining: 0,
    elapsed: 0,
    timer: null,
    isRunning: false
  },

  // --- INITIALIZATION ---
  init() {
    this.loadState();
    if (!this.state.startDate) {
      this.state.startDate = new Date().toISOString().split('T')[0];
    }
    
    // Calculate current day based on start date
    const start = new Date(this.state.startDate);
    const now = new Date();
    start.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    this.state.currentDay = Math.max(1, Math.min(60, diffDays + 1));
    
    // Set today's gym type based on schedule
    const dayOfWeek = new Date().getDay();
    this.state.todayGymType = this.state.gymSchedule[dayOfWeek] || 'rest';

    this.applyTheme(this.state.theme);

    this.checkStreak();
    this.navigate('dashboard');
    this.saveState();
  },

  loadState() {
    const saved = localStorage.getItem('kiai_premium_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this.state, parsed);
      } catch (e) { console.error('Failed to parse state', e); }
    }
  },

  saveState() {
    localStorage.setItem('kiai_premium_state', JSON.stringify(this.state));
  },

  // --- NAVIGATION ---
  navigate(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(v => v.classList.remove('active'));
    
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
      // trigger reflow for animation
      void target.offsetWidth;
    }
    
    const navBtn = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    this.state.currentView = viewId;
    window.scrollTo(0, 0);

    // View specific logic
    if (viewId === 'dashboard') this.renderDashboard();
    if (viewId === 'workout') this.prepareWorkout();
    if (viewId === 'progress') { this.renderBenchmarkForm(); this.renderBenchmarkStats(); this.renderAchievements(); }
    if (viewId === 'library') { this.filterLibrary('wushu'); this.renderTips(); }
    if (viewId === 'settings') { this.renderSettings(); }
  },

  // --- DASHBOARD ---
  renderDashboard() {
    document.getElementById('dashCurrentDay').textContent = this.state.currentDay;
    document.getElementById('dashStreak').textContent = this.state.streak;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const isCompleted = this.state.completedDays.includes(todayStr);
    
    const heroTitle = document.getElementById('heroTitle');
    const heroBtn = document.querySelector('.hero-card .action-btn span');
    if (isCompleted) {
      heroTitle.textContent = "Workout Complete ✅";
      heroBtn.textContent = "Repeat Workout";
    } else {
      heroTitle.textContent = `Day ${this.state.currentDay} Training`;
      heroBtn.textContent = "Start Training";
    }

    // Stats
    document.getElementById('dashCompleted').textContent = this.state.completedDays.length;
    const hrs = Math.floor(this.state.totalTimeSeconds / 3600);
    document.getElementById('dashTime').textContent = `${hrs}h`;
    document.getElementById('dashBadges').textContent = this.state.unlockedAchievements.length;

    // Progress Ring
    const pct = Math.round((this.state.completedDays.length / 60) * 100);
    document.getElementById('dashProgressPct').textContent = `${pct}%`;
    const ring = document.getElementById('dashProgressRing');
    const circ = 2 * Math.PI * 40;
    ring.style.strokeDasharray = circ;
    ring.style.strokeDashoffset = circ * (1 - pct / 100);

    this.rollRandomLibrary();
  },

  rollRandomLibrary(e) {
    if (e) e.stopPropagation();
    if (!window.TIPS_DATA && !window.EXERCISES) return;
    
    // Pick randomly between a tip or a technique
    const items = [];
    if (window.TIPS_DATA) {
      window.TIPS_DATA.categories.forEach(c => {
        c.tips.forEach(t => items.push({ icon: c.icon, title: t.title, desc: t.content }));
      });
    }
    if (window.EXERCISES) {
      Object.values(window.EXERCISES).filter(ex => ex.category === 'technique').forEach(ex => {
        items.push({ icon: ex.icon, title: ex.name, desc: ex.description });
      });
    }

    if (items.length > 0) {
      const selected = items[Math.floor(Math.random() * items.length)];
      const iconEl = document.getElementById('randomLibIcon');
      const titleEl = document.getElementById('randomLibTitle');
      const descEl = document.getElementById('randomLibDesc');
      if (iconEl && titleEl && descEl) {
        iconEl.textContent = selected.icon || '💡';
        titleEl.textContent = selected.title;
        descEl.textContent = selected.desc;
        
        // Add a tiny bounce animation on refresh
        iconEl.style.transform = 'scale(0.8)';
        setTimeout(() => iconEl.style.transform = 'scale(1)', 150);
      }
    }
  },

  // --- TIMER / AUDIO ---
  initAudio() {
    try {
      if (this.audioCtx) {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        return;
      }
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        // Play a silent note to unlock on iOS
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(0);
        osc.stop(0.01);
      }
    } catch(e) { console.warn('Audio not supported', e); }
  },

  playChime() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      
      const playTone = (freq, startTime, duration) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = this.audioCtx.currentTime;
      playTone(523.25, now, 1.0); // C5
      playTone(659.25, now + 0.15, 1.5); // E5
    } catch(e) { console.warn('Audio play failed', e); }
  },

  // --- THEME ---
  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.state.theme);
    this.saveState();
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  },

  // --- MODAL ---
  openModal(title, contentHtml) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = contentHtml;
    document.getElementById('appModal').classList.add('show');
  },

  closeModal(force = false) {
    // If it's an event, verify target is the overlay
    if (force === true || (force.target && force.target.id === 'appModal')) {
      document.getElementById('appModal').classList.remove('show');
    }
  },

  // --- WORKOUT LOGIC ---
  setGym(type) {
    this.state.todayGymType = type;
    document.querySelectorAll('.seg-btn[data-gym]').forEach(b => {
      b.classList.toggle('active', b.dataset.gym === type);
    });
    this.prepareWorkout();
  },

  prepareWorkout() {
    if (!window.WORKOUTS) return;
    
    // Update gym selector UI
    document.querySelectorAll('.seg-btn[data-gym]').forEach(b => {
      b.classList.toggle('active', b.dataset.gym === this.state.todayGymType);
    });

    const dayData = window.WORKOUTS.generateDay(this.state.currentDay);
    const adaptation = window.WORKOUTS.getGymAdaptation ? window.WORKOUTS.getGymAdaptation(this.state.currentDay, this.state.todayGymType) : null;
    
    this.workout.data = dayData; // We could merge adaptation here, but for simplicity we rely on standard day generation for MVP logic.

    document.getElementById('workout-intro').style.display = 'block';
    document.getElementById('workout-active').style.display = 'none';
    document.getElementById('workout-complete').style.display = 'none';

    document.getElementById('introWorkoutTitle').textContent = `Day ${this.state.currentDay} — ${dayData.title}`;
    if (dayData.quote) document.getElementById('introQuote').textContent = dayData.quote;

    let overviewHtml = '';
    dayData.sections.forEach(s => {
      overviewHtml += `<div class="flex justify-between items-center mb-2 border-b border-white/5 pb-1"><strong class="text-main">${s.title}</strong><span class="text-secondary text-sm ml-4">${s.exercises.length} exercises</span></div>`;
    });
    document.getElementById('introOverview').innerHTML = overviewHtml;
  },

  openWorkoutBrowser() {
    if (!window.WORKOUTS) return;
    
    let listHtml = `<div class="flex flex-col gap-4" style="max-height: 60vh; overflow-y: auto;">`;
    
    window.WORKOUTS.phases.forEach(phase => {
      listHtml += `
        <div class="phase-group">
          <h4 class="text-amber-500 font-bold mb-2 border-b pb-1" style="border-color: var(--border-glass)">
            ${phase.icon} Phase ${phase.id}: ${phase.name} 
            <span class="text-xs text-secondary ml-2 font-normal">(Weeks ${phase.weeks})</span>
          </h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
      `;
      
      for (let i = phase.days[0]; i <= phase.days[1]; i++) {
        const dayData = window.WORKOUTS.generateDay(i);
        const discipline = dayData.focusDiscipline;
        listHtml += `
          <button class="action-btn outlined text-xs py-2 flex flex-col items-center justify-center h-full" onclick="App.overrideWorkoutDay(${i})">
            <strong style="font-size: 0.9rem;">Day ${i}</strong>
            <span class="text-xs text-secondary mt-1">${discipline}</span>
          </button>
        `;
      }
      listHtml += `</div></div>`;
    });
    
    listHtml += `</div>`;
    this.openModal("Browse Workouts", listHtml);
  },

  overrideWorkoutDay(day) {
    this.state.currentDay = day;
    this.workout.queue = queue;
    this.renderWorkoutOverview();
  },

  startProgressFlow() {
    this.initAudio();
    this.navigate('workout');
    document.getElementById('introWorkoutTitle').textContent = 'Daily Kiai Training';
    document.getElementById('introQuote').textContent = 'Deep Holds, Balance & Lower Back - 18 Mins';
    
    // Construct custom queue from PDF
    const flowData = [
      { id: 'pf_hip_circles', name: 'Hip Circles', category: 'Warm Up', duration: 20, icon: '🔄', targetArea: ['hips'], tips: 'Loosen the kua before loading it', instructions: ['Stand with feet shoulder-width apart.', 'Place hands on hips.', 'Slowly rotate your hips in a wide circle, imagining you are drawing a circle with your tailbone.', 'Switch directions halfway through.'] },
      { id: 'pf_leg_swings_fb', name: 'Leg Swings (Front-Back)', category: 'Warm Up', duration: 30, icon: '🦵', targetArea: ['hips'], tips: 'Keep your torso upright; don\'t bend forward to meet the leg', instructions: ['Find a wall or bar for balance.', 'Stand on one leg and let the other leg hang loose.', 'Swing the free leg forward and backward, gradually increasing the height of the swing.', 'Keep the swinging leg relaxed and straight.'] },
      { id: 'pf_leg_swings_ss', name: 'Leg Swings (Side-Side)', category: 'Warm Up', duration: 30, icon: '🦵', targetArea: ['hips'], tips: 'Open the hip on the lateral swing', instructions: ['Face a wall or bar and hold on with both hands.', 'Swing one leg across the front of your body, then swing it out to the side.', 'Allow the hip to naturally open as the leg swings out.', 'Switch legs halfway.'] },
      { id: 'pf_ankle_rolls', name: 'Ankle Rolls', category: 'Warm Up', duration: 20, icon: '🦶', targetArea: ['ankles'], tips: 'Roll through the full range of motion', instructions: ['Lift one foot slightly off the ground.', 'Slowly roll your ankle in a full circle, pointing and flexing the toes as you go.', 'Switch directions, then switch feet.'] },
      { id: 'pf_squat_hold', name: 'Squat Hold (Heels Flat)', category: 'Deep Hip & Kua', duration: 90, icon: '🧘', targetArea: ['hips'], tips: 'The single best kua opener', instructions: ['Stand with feet slightly wider than shoulder-width.', 'Drop your hips down into a deep squat, keeping your heels completely flat on the floor.', 'Keep your chest up and use your elbows to gently press your knees outward.', 'Breathe deeply and sink lower as the tension releases.'] },
      { id: 'pf_kua_circles', name: 'Kua Circles', category: 'Deep Hip & Kua', duration: 20, icon: '🌀', targetArea: ['hips'], tips: 'Keep the upper body completely still', instructions: ['Stand in a wide horse stance with knees bent softly.', 'Isolate the pelvic floor (the Kua) and make small, internal circles with your hips.', 'Do not move your head or shoulders.', 'Reverse direction halfway.'] },
      { id: 'pf_frog', name: 'Frog Stretch', category: 'Deep Hip & Kua', duration: 90, icon: '🐸', targetArea: ['adductors'], tips: 'Crucial for high side kicks', instructions: ['Start on your hands and knees.', 'Slowly slide your knees outward as far as comfortably possible.', 'Ensure your ankles are aligned behind your knees (shin parallel to the wall behind you).', 'Rest on your forearms and gently press your hips backward to deepen the stretch.'] },
      { id: 'pf_cossack', name: 'Cossack Squat Hold', category: 'Deep Hip & Kua', duration: 60, icon: '🥋', targetArea: ['hips'], tips: 'Keep the heel of the straight leg planted', instructions: ['Take a very wide stance.', 'Shift your weight entirely to one side, bending that knee deeply while keeping the other leg perfectly straight.', 'Keep the heel of the bent leg flat on the ground.', 'Hold the depth, chest up, and breathe.'] },
      { id: 'pf_pigeon', name: 'Pigeon Pose', category: 'Posterior Chain & Kick Range', duration: 75, icon: '🐦', targetArea: ['hips'], tips: 'Keep your hips completely square to the floor', instructions: ['Start in a plank position.', 'Bring your right knee forward and place it behind your right wrist, positioning your shin across the mat.', 'Extend your left leg straight back behind you.', 'Keep your hips square to the ground and slowly lower your upper body down over your front leg.', 'Hold the stretch, breathe deeply, and switch sides halfway.'] },
      { id: 'pf_deep_ham', name: 'Deep Standing Hamstring', category: 'Posterior Chain & Kick Range', duration: 60, icon: '🧍', targetArea: ['hamstrings'], tips: 'Fold at the hips, not the lower back', instructions: ['Place one heel on an elevated surface (like a chair or step) with the leg completely straight.', 'Keep your standing leg slightly bent.', 'Hinge forward from your hips, keeping your chest proud and your back flat.', 'Reach toward your toes and hold the deep stretch.'] },
      { id: 'pf_pancake', name: 'Pancake Stretch', category: 'Posterior Chain & Kick Range', duration: 90, icon: '🥞', targetArea: ['hips', 'hamstrings'], tips: 'Rotate your pelvis forward (anterior pelvic tilt)', instructions: ['Sit on the floor and open your legs as wide as possible into a straddle.', 'Engage your quads to keep your legs straight and toes pointing up.', 'Hinge forward at the hips, aiming to touch your chest to the floor.', 'Use your hands to crawl forward and hold the maximum depth.'] },
      { id: 'pf_bow_hold', name: 'Bow Stance Hold (Deep)', category: 'Stance Depth', duration: 120, icon: '🏹', targetArea: ['legs'], tips: '10-15% lower than your normal training stance', instructions: ['Step forward into a long lunging stance (Gong Bu).', 'Bend the front knee to 90 degrees (thigh parallel to the floor).', 'Lock the back leg completely straight with the foot angled slightly out.', 'Sink your hips as low as possible and hold the isometric tension.'] },
      { id: 'pf_horse_hold', name: 'Horse Stance Hold (Deep)', category: 'Stance Depth', duration: 120, icon: '🐎', targetArea: ['legs'], tips: 'Thighs must be perfectly parallel to the floor', instructions: ['Step into a very wide stance with toes pointing forward or slightly outward.', 'Drop your hips straight down until your thighs are parallel to the floor.', 'Tuck your tailbone slightly, keep your back perfectly straight, and push your knees out.', 'Endure the burn and hold the posture without rising.'] },
      { id: 'pf_calf', name: 'Wall Calf Stretch', category: 'Stance Depth', duration: 45, icon: '🧱', targetArea: ['calves'], tips: 'Keep the back knee locked straight', instructions: ['Stand facing a wall and place your hands on it for support.', 'Step one foot far back, keeping the heel pressed firmly into the floor.', 'Lean your weight forward into the wall to stretch the calf of the back leg.', 'Hold, then switch sides.'] },
      { id: 'pf_slow_kick', name: 'Slow-Motion Kicking', category: 'Balance & Stability', duration: 60, icon: '🦿', targetArea: ['balance', 'legs'], tips: 'Take exactly 10 full seconds to chamber, extend, and retract', instructions: ['Stand firmly on one leg, gripping the floor with your toes for stability.', 'Take 3 seconds to slowly lift and chamber your kicking knee.', 'Take 4 seconds to slowly extend the kick to full extension, maintaining perfect posture.', 'Take 3 seconds to slowly retract and lower the leg.', 'Switch legs halfway.'] },
      { id: 'pf_weight_shift', name: 'Weight Shifts in Horse Stance', category: 'Balance & Stability', duration: 45, icon: '⚖️', targetArea: ['legs', 'balance'], tips: 'Keep your head at exactly the same altitude', instructions: ['Sink into a deep horse stance.', 'Slowly shift your body weight entirely to your left leg, straightening your right leg into a bow stance without raising your hips.', 'Shift smoothly back through the center and over to the right leg.', 'Keep your head level as if moving under a low ceiling.'] },
      { id: 'pf_cat_cow', name: 'Cat-Cow', category: 'Lower Back', duration: 45, icon: '🐈', targetArea: ['spine'], tips: 'Move vertebrae by vertebrae', instructions: ['Start on all fours with wrists under shoulders and knees under hips.', 'Inhale as you arch your back, dropping your belly and lifting your head (Cow).', 'Exhale as you round your spine toward the ceiling, tucking your chin to your chest (Cat).', 'Flow smoothly between the two postures.'] },
      { id: 'pf_knee_chest', name: 'Knee to Chest Stretch', category: 'Lower Back', duration: 45, icon: '🦵', targetArea: ['lower back'], tips: 'Keep your opposite leg completely flat on the floor', instructions: ['Lie flat on your back on the floor.', 'Bring one knee up toward your chest, clasping your hands just below your kneecap.', 'Gently pull the knee closer to your chest while actively pressing the other leg down flat against the floor.', 'Hold the stretch, breathe deeply into your lower belly, and switch legs halfway.'] },
      { id: 'pf_thread_needle', name: 'Thread the Needle', category: 'Spine, Shoulders & Cool Down', duration: 45, icon: '🪡', targetArea: ['shoulders', 'spine'], tips: 'Press the back of your resting arm into the floor', instructions: ['Start on all fours with your wrists under your shoulders and knees under your hips.', 'Reach your right arm underneath your body and across to the left side.', 'Lower your right shoulder and the right side of your head to the floor.', 'Keep your hips high and square to the ceiling.', 'Hold the stretch, feeling it in your upper back and shoulder, then switch sides.'] },
      { id: 'pf_chest_open', name: 'Doorway Chest Opener', category: 'Spine, Shoulders & Cool Down', duration: 30, icon: '🚪', targetArea: ['chest', 'shoulders'], tips: 'Do not force the stretch, let gravity assist', instructions: ['Stand in a doorway with one forearm resting against the doorframe at shoulder height.', 'Gently turn your chest away from the doorway until you feel a deep stretch in your pectoral and front shoulder.', 'Hold the stretch, breathe deeply, and switch sides.'] },
      { id: 'pf_breathing', name: 'Deep Breathing Reset', category: 'Spine, Shoulders & Cool Down', duration: 30, icon: '🫁', targetArea: ['lungs', 'mind'], tips: 'Expand your stomach, not your chest', instructions: ['Stand naturally or sit in a comfortable position.', 'Place one hand on your lower belly (Dantian).', 'Inhale deeply through your nose for 4 seconds, feeling your belly push out against your hand.', 'Exhale slowly through your mouth for 6 seconds, letting your belly sink back in.'] }
    ];
    
    this.workout.queue = flowData.map(ex => ({
      sectionTitle: ex.category,
      fullEx: {
        name: ex.name,
        duration: ex.duration,
        description: ex.category,
        tips: ex.tips,
        icon: ex.icon,
        targetArea: ex.targetArea,
        instructions: ex.instructions
      }
    }));
    
    // Build overview HTML manually
    let overviewHtml = '';
    const sectionCounts = {};
    this.workout.queue.forEach(item => {
      sectionCounts[item.sectionTitle] = (sectionCounts[item.sectionTitle] || 0) + 1;
    });
    Object.keys(sectionCounts).forEach(sec => {
      overviewHtml += `<div class="flex justify-between items-center mb-2 border-b border-white/5 pb-1"><strong class="text-main">${sec}</strong><span class="text-secondary text-sm ml-4">${sectionCounts[sec]} exercises</span></div>`;
    });
    document.getElementById('introOverview').innerHTML = overviewHtml;
    
    // Set a flag so startWorkout knows NOT to overwrite the queue
    this.workout.isCustomQueue = true;
  },

  startWorkout() {
    this.initAudio();
    document.getElementById('workout-intro').style.display = 'none';
    document.getElementById('workout-active').style.display = 'block';
    
    if (!this.workout.isCustomQueue) {
      this.workout.queue = [];
      this.workout.data.sections.forEach(sec => {
        sec.exercises.forEach(ex => {
          const fullEx = window.EXERCISES[ex.id];
          if (fullEx) {
            this.workout.queue.push({ ...ex, fullEx, sectionTitle: sec.title });
          }
        });
      });
    }
    
    // Reset flag for next time
    this.workout.isCustomQueue = false;

    this.workout.currentIndex = 0;
    this.workout.elapsed = 0;
    this.workout.totalDuration = this.workout.queue.reduce((acc, curr) => acc + (curr.duration || curr.fullEx.duration), 0);
    
    this.renderCurrentExercise(true); // Auto-start the first exercise
  },

  renderCurrentExercise(autoStart = false) {
    if (this.workout.currentIndex >= this.workout.queue.length) {
      this.finishWorkout();
      return;
    }

    const item = this.workout.queue[this.workout.currentIndex];
    const baseDur = item.duration || item.fullEx.duration;
    // Apply duration multiplier
    const dur = Math.max(1, Math.round(baseDur * (this.state.durationMultiplier || 1.0)));
    
    document.getElementById('playerSectionTitle').textContent = item.sectionTitle;
    document.getElementById('exIcon').textContent = item.fullEx.icon || '🥋';
    document.getElementById('exName').textContent = item.fullEx.name;
    document.getElementById('exDesc').textContent = item.fullEx.description || '';
    
    const badgeContainer = document.getElementById('exTargetBadges');
    if (item.fullEx.targetArea) {
      badgeContainer.innerHTML = item.fullEx.targetArea.map(t => `<span style="padding: 2px 8px; font-size: 0.7rem; border-radius: 99px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-glass); text-transform: capitalize;">${t}</span>`).join('');
    } else {
      badgeContainer.innerHTML = '';
    }
    
    const instContainer = document.getElementById('exInstructions');
    instContainer.style.display = 'none';
    if (item.fullEx.instructions) {
      instContainer.innerHTML = `<ol style="list-style-type: decimal; padding-left: 20px;">` + item.fullEx.instructions.map(i => `<li style="margin-bottom: 4px;">${i}</li>`).join('') + `</ol>`;
    } else {
      instContainer.innerHTML = '';
    }
    
    const tipContainer = document.getElementById('exTip');
    if (item.fullEx.tips) {
      tipContainer.innerHTML = `💡 <i>${item.fullEx.tips}</i>`;
    } else {
      tipContainer.innerHTML = '';
    }
    
    document.getElementById('exDurBadge').textContent = `${dur}s`;
    
    this.workout.timeRemaining = dur;
    this.updateTimerUI();
    
    // Play button state
    this.workout.isRunning = false;
    document.getElementById('playPauseBtn').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    
    this.renderUpNext();

    if (autoStart) {
      this.toggleTimer();
    }
  },

  renderUpNext() {
    const list = document.getElementById('upNextList');
    let html = '';
    for (let i = this.workout.currentIndex + 1; i < Math.min(this.workout.currentIndex + 4, this.workout.queue.length); i++) {
      const it = this.workout.queue[i];
      html += `<div class="flex justify-between items-center py-2 border-b border-white/10">
        <span>${it.fullEx.icon} ${it.fullEx.name}</span>
        <span class="text-secondary text-sm">${it.duration || it.fullEx.duration}s</span>
      </div>`;
    }
    list.innerHTML = html;
  },

  toggleTimer() {
    this.initAudio();
    if (this.workout.isRunning) {
      clearInterval(this.workout.timer);
      this.workout.isRunning = false;
      document.getElementById('playPauseBtn').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    } else {
      this.workout.isRunning = true;
      document.getElementById('playPauseBtn').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
      this.workout.timer = setInterval(() => {
        this.workout.timeRemaining--;
        this.workout.elapsed++;
        this.updateTimerUI();
        
        // Progress bar
        const pct = (this.workout.elapsed / this.workout.totalDuration) * 100;
        document.getElementById('playerTotalProgress').style.width = `${pct}%`;

        if (this.workout.timeRemaining <= 0) {
          this.playChime();
          this.skipExercise();
          return;
        }
      }, 1000);
    }
  },

  updateTimerUI() {
    const t = this.workout.timeRemaining;
    const m = Math.floor(t / 60);
    const s = t % 60;
    document.getElementById('timerClock').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    
    const ring = document.getElementById('timerRing');
    const baseDur = this.workout.queue[this.workout.currentIndex].duration || this.workout.queue[this.workout.currentIndex].fullEx.duration;
    const dur = Math.max(1, Math.round(baseDur * (this.state.durationMultiplier || 1.0)));
    const circ = 565; // 2 * PI * 90
    ring.style.strokeDashoffset = circ * (1 - t / dur);
  },

  skipExercise() {
    const wasRunning = this.workout.isRunning;
    if (this.workout.timer) clearInterval(this.workout.timer);
    this.workout.currentIndex++;
    this.renderCurrentExercise(wasRunning || this.workout.timeRemaining <= 0); // If it finished naturally, auto-play next
  },

  prevExercise() {
    const wasRunning = this.workout.isRunning;
    if (this.workout.timer) clearInterval(this.workout.timer);
    if (this.workout.currentIndex > 0) this.workout.currentIndex--;
    this.renderCurrentExercise(wasRunning);
  },

  finishWorkout() {
    this.workout.isRunning = false;
    if (this.workout.timer) clearInterval(this.workout.timer);
    
    document.getElementById('workout-active').style.display = 'none';
    document.getElementById('workout-complete').style.display = 'block';
    
    const timeSpent = Math.floor(this.workout.elapsed / 60);
    document.getElementById('cTime').textContent = `${timeSpent}m`;
    document.getElementById('cEx').textContent = this.workout.queue.length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (!this.state.completedDays.includes(todayStr)) {
      this.state.completedDays.push(todayStr);
      this.updateStreak(todayStr);
    }
    
    document.getElementById('cStreak').textContent = this.state.streak;
    this.state.totalTimeSeconds += this.workout.elapsed;
    this.saveState();
    this.checkAchievements();
  },

  rateWorkout(rating) {
    if (rating === 'easy') {
      this.state.durationMultiplier = parseFloat((this.state.durationMultiplier + 0.1).toFixed(2));
      this.showToast('📈', 'Leveled Up!', 'Future workouts will be 10% longer.');
    } else if (rating === 'hard') {
      this.state.durationMultiplier = Math.max(0.5, parseFloat((this.state.durationMultiplier - 0.1).toFixed(2)));
      this.showToast('📉', 'Scaled Down', 'Future workouts will be 10% shorter.');
    } else {
      this.showToast('✅', 'Perfect', 'Keeping the current difficulty.');
    }
    this.saveState();
    this.navigate('dashboard');
  },

  // --- STREAK & ACHIEVEMENTS ---
  checkAchievements() {
    if (!window.ACHIEVEMENTS) return;
    let newlyUnlocked = [];
    window.ACHIEVEMENTS.forEach(a => {
      if (!this.state.unlockedAchievements.includes(a.id)) {
        let conditionMet = false;
        const type = a.condition.type;
        const val = a.condition.value;
        
        if (type === 'workouts_completed' && this.state.completedDays.length >= val) conditionMet = true;
        if (type === 'streak' && this.state.streak >= val) conditionMet = true;
        if (type === 'day_reached' && this.state.completedDays.length >= val) conditionMet = true;
        if (type === 'discipline_sessions' && this.state.completedDays.length >= val.count * 5) conditionMet = true;
        if (type === 'total_time' && this.state.totalTimeSeconds >= val) conditionMet = true;

        if (conditionMet) {
          this.state.unlockedAchievements.push(a.id);
          newlyUnlocked.push(a);
        }
      }
    });
    
    if (newlyUnlocked.length > 0) {
      this.saveState();
      this.showToast('🏆', 'Achievement Unlocked!', newlyUnlocked[0].name);
      if (this.state.currentView === 'progress') this.renderAchievements();
    }
  },
  checkStreak() {
    if (!this.state.lastWorkoutDate) return;
    const last = new Date(this.state.lastWorkoutDate);
    const now = new Date();
    last.setHours(0,0,0,0); now.setHours(0,0,0,0);
    const diff = Math.floor((now - last) / 86400000);
    if (diff > 1) {
      this.state.streak = 0;
      this.saveState();
    }
  },

  updateStreak(todayStr) {
    if (this.state.lastWorkoutDate) {
      const last = new Date(this.state.lastWorkoutDate);
      const now = new Date(todayStr);
      const diff = Math.floor((now - last) / 86400000);
      if (diff === 1) this.state.streak++;
      else if (diff > 1) this.state.streak = 1;
    } else {
      this.state.streak = 1;
    }
    this.state.lastWorkoutDate = todayStr;
  },

  showToast(icon, title, desc) {
    document.getElementById('toastIcon').textContent = icon;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastDesc').textContent = desc;
    const toast = document.getElementById('toast');
    toast.classList.remove('translate-y-[150%]');
    setTimeout(() => {
      toast.classList.add('translate-y-[150%]');
    }, 4000);
  },

  // --- PROGRESS ---
  renderBenchmarkForm() {
    if (!window.BENCHMARK_DEFINITIONS) return;
    const form = document.getElementById('benchmarkForm');
    form.innerHTML = window.BENCHMARK_DEFINITIONS.map(b => {
      let inputHtml = '';
      if (b.type === 'level') {
        inputHtml = `
          <div class="flex flex-col w-full gap-2 mt-2">
            <input type="range" id="inp_${b.id}" min="0" max="${b.options.length - 1}" value="0" class="w-full" oninput="document.getElementById('lbl_${b.id}').textContent = window.BENCHMARK_DEFINITIONS.find(d=>d.id==='${b.id}').options[this.value]">
            <div class="text-amber-500 text-sm font-bold text-center" id="lbl_${b.id}">${b.options[0]}</div>
          </div>
        `;
      } else {
        inputHtml = `
          <div class="flex items-center gap-2 mt-2">
            <input type="number" id="inp_${b.id}" class="glass-input w-24 p-2 text-center" placeholder="0">
            <span class="text-sm text-secondary">${b.unit}</span>
          </div>
        `;
      }
      return `
        <div class="flex flex-col p-3 rounded" style="background: var(--bg-input); border: 1px solid var(--border-glass);">
          <div>
            <strong>${b.icon} ${b.name}</strong>
          </div>
          ${inputHtml}
        </div>
      `;
    }).join('');
  },

  saveBenchmarks() {
    if (!window.BENCHMARK_DEFINITIONS) return;
    const entry = { date: new Date().toISOString().split('T')[0], values: {} };
    let savedAny = false;
    window.BENCHMARK_DEFINITIONS.forEach(b => {
      const el = document.getElementById(`inp_${b.id}`);
      if (el && el.value) {
        entry.values[b.id] = el.value;
        savedAny = true;
        el.value = '';
      }
    });
    if (savedAny) {
      this.state.benchmarks.push(entry);
      this.saveState();
      this.renderBenchmarkStats();
      this.showToast('📈', 'Progress Saved', 'Keep pushing your limits!');
    }
  },

  renderBenchmarkStats() {
    if (!window.BENCHMARK_DEFINITIONS) return;
    const list = document.getElementById('benchmarkStats');
    if (this.state.benchmarks.length === 0) {
      list.innerHTML = `<div class="text-secondary p-4 text-center">No data recorded yet.</div>`;
      return;
    }
    
    const latest = this.state.benchmarks[this.state.benchmarks.length - 1].values;
    list.innerHTML = window.BENCHMARK_DEFINITIONS.map(b => {
      let displayValue = latest[b.id] || '--';
      if (b.type === 'level' && latest[b.id] !== undefined) {
        displayValue = b.options[parseInt(latest[b.id])];
      } else if (latest[b.id] !== undefined) {
        displayValue += ` <span class="text-sm text-secondary">${b.unit}</span>`;
      }
      return `
      <div class="flex flex-col p-3 border-b mb-1" style="border-color: var(--border-glass)">
        <span class="text-secondary text-sm">${b.icon} ${b.name}</span>
        <strong class="text-lg text-amber-500 mt-1">${displayValue}</strong>
      </div>
      `;
    }).join('');
  },

  renderAchievements() {
    if (!window.ACHIEVEMENTS) return;
    const list = document.getElementById('achievementsList');
    list.innerHTML = window.ACHIEVEMENTS.map(a => {
      const unlocked = this.state.unlockedAchievements.includes(a.id);
      return `
        <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
          <div class="text-3xl mb-2" style="${unlocked ? 'text-shadow: 0 0 10px rgba(255,255,255,0.5);' : ''}">${a.icon}</div>
          <div class="font-bold text-sm leading-tight mb-1" style="${unlocked ? 'color: #f59e0b;' : ''}">${a.name}</div>
          <div class="text-xs text-secondary">${a.description}</div>
        </div>
      `;
    }).join('');
  },

  // --- LIBRARY ---
  setLibraryTab(tab) {
    document.getElementById('lib-techniques').style.display = tab === 'techniques' ? 'block' : 'none';
    document.getElementById('lib-tips').style.display = tab === 'tips' ? 'block' : 'none';
    document.querySelectorAll('#libraryToggle .seg-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.toLowerCase().includes(tab));
    });
  },

  filterLibrary(discipline) {
    document.querySelectorAll('#discFilters .badge').forEach(b => {
      b.classList.toggle('active', b.getAttribute('onclick').includes(discipline));
    });
    
    if (!window.EXERCISES) return;
    const cards = document.getElementById('techCards');
    cards.innerHTML = Object.values(window.EXERCISES)
      .filter(ex => ex.category === 'technique' && ex.discipline === discipline)
      .map(ex => `
        <div class="glass-card p-4 hover:border-amber-500/50 transition-colors cursor-pointer" onclick="App.openTechniqueModal('${ex.id}')">
          <div class="text-4xl mb-2">${ex.icon}</div>
          <h4 class="font-bold mb-1">${ex.name}</h4>
          <p class="text-sm text-secondary line-clamp-3">${ex.description}</p>
          <div class="text-xs text-amber-500 mt-2 font-bold uppercase tracking-wide opacity-80 hover:opacity-100">Click for details →</div>
        </div>
      `).join('');
  },

  openTechniqueModal(id) {
    if (!window.EXERCISES) return;
    const ex = window.EXERCISES[id];
    if (!ex) return;
    
    let html = `
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4 border-b pb-4" style="border-color: var(--border-glass)">
          <div class="text-5xl" style="text-shadow: 0 0 15px rgba(255,255,255,0.2)">${ex.icon}</div>
          <div>
            <h3 class="text-xl text-amber-500 font-bold mb-1">${ex.name}</h3>
            <span class="text-xs uppercase tracking-widest text-secondary" style="background: var(--bg-input); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-glass);">${ex.discipline}</span>
          </div>
        </div>
        
        <div class="text-sm leading-relaxed text-secondary">${ex.description}</div>
        
        ${ex.instructions ? `
          <div class="mt-2">
            <h4 class="font-bold text-main mb-2 border-b pb-1" style="border-color: var(--border-glass)">How to Execute Properly</h4>
            <ol class="list-decimal pl-5 text-sm text-secondary flex flex-col gap-2">
              ${ex.instructions.map(i => `<li>${i}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        
        ${ex.tips ? `
          <div class="p-3 rounded mt-2" style="border: 1px solid rgba(245, 158, 11, 0.3); background: linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%);">
            <strong class="text-amber-500 text-sm block mb-1">💡 Pro Tip</strong>
            <p class="text-xs text-secondary">${ex.tips}</p>
          </div>
        ` : ''}
      </div>
    `;
    
    this.openModal("Technique Details", html);
  },

  renderTips() {
    if (!window.TIPS_DATA) return;
    document.getElementById('tipsAccordion').innerHTML = window.TIPS_DATA.categories.map(cat => `
      <div class="glass-card p-4">
        <h3 class="mb-3">${cat.icon} ${cat.category}</h3>
        <div class="flex flex-col gap-3">
          ${cat.tips.map(t => `
            <div class="p-3 bg-white/5 rounded border border-white/10">
              <strong class="block text-sm text-amber-500 mb-1">${t.title}</strong>
              <p class="text-sm text-secondary">${t.content}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  // --- SETTINGS ---
  renderSettings() {
    document.getElementById('startDateInp').value = this.state.startDate;
    
    const multDisp = document.getElementById('multiplierDisplay');
    if (multDisp) multDisp.textContent = `${(this.state.durationMultiplier || 1.0).toFixed(2)}x`;
    
    const container = document.getElementById('settingsGymSchedule');
    if (!container) return;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    container.innerHTML = days.map((d, i) => {
      const current = this.state.gymSchedule[i] || 'rest';
      return `
        <div class="flex flex-col gap-1 p-2 rounded" style="background: var(--bg-input); border: 1px solid var(--border-glass);">
          <label class="text-xs font-bold text-center">${d}</label>
          <select class="glass-input text-xs p-1" style="width: 100%; appearance: none; text-align: center;" onchange="App.updateGymSchedule(${i}, this.value)">
            <option style="color: black;" value="rest" ${current === 'rest' ? 'selected' : ''}>Rest / None</option>
            <option style="color: black;" value="upper-a" ${current === 'upper-a' ? 'selected' : ''}>Upper Body</option>
            <option style="color: black;" value="lower-a" ${current === 'lower-a' ? 'selected' : ''}>Lower Body</option>
          </select>
        </div>
      `;
    }).join('');
  },

  updateGymSchedule(dayIndex, value) {
    this.state.gymSchedule[dayIndex] = value;
    this.saveState();
    if (dayIndex === new Date().getDay()) {
      this.state.todayGymType = value;
    }
  },

  updateDates() {
    const val = document.getElementById('startDateInp').value;
    if (val) {
      this.state.startDate = val;
      this.saveState();
      this.showToast('✅', 'Date Saved', 'Program start date updated.');
      
      const start = new Date(val);
      start.setHours(0,0,0,0);
      const now = new Date();
      now.setHours(0,0,0,0);
      this.state.currentDay = Math.max(1, Math.min(60, Math.floor((now - start) / 86400000) + 1));
      if (this.state.currentView === 'dashboard') this.renderDashboard();
    }
  },

  resetMultiplier() {
    this.state.durationMultiplier = 1.0;
    this.saveState();
    this.renderSettings();
    this.showToast('🔄', 'Multiplier Reset', 'Timers are back to 1.0x baseline.');
  },

  exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "kiai_backup.json");
    dlAnchorElem.click();
  },

  importData(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          Object.assign(this.state, parsed);
          this.saveState();
          this.showToast('📥', 'Data Imported', 'Successfully restored your progress.');
          this.navigate('dashboard');
        } catch (err) {
          alert('Invalid backup file.');
        }
      };
      reader.readAsText(file);
    }
  },

  resetData() {
    if (confirm("Are you sure? This will permanently delete all progress, streaks, and benchmarks.")) {
      localStorage.removeItem('kiai_premium_state');
      location.reload();
    }
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Global audio unlocker for strict mobile browsers
const unlockAudio = () => {
  App.initAudio();
  document.removeEventListener('touchstart', unlockAudio);
  document.removeEventListener('click', unlockAudio);
};
document.addEventListener('touchstart', unlockAudio);
document.addEventListener('click', unlockAudio);
