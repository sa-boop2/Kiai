/**
 * workouts.js — 60-Day Martial Arts Preparation Workout Generator
 *
 * Generates structured ~30-minute daily sessions across four progressive
 * phases, rotating through five martial-arts disciplines (Wushu, Muay Thai,
 * Tai Chi, Sanda, Shaolin).
 *
 * Depends on: exercises.js (must be loaded first so window.EXERCISES exists)
 * Exposes:    window.WORKOUTS
 */

(function () {
  'use strict';

  // ────────────────────────────────────────────────────────────────────────
  // Phases
  // ────────────────────────────────────────────────────────────────────────
  var phases = [
    { id: 1, name: 'Foundation',          weeks: '1-2', days: [1, 14],  description: 'Build your mobility base',    color: '#3b82f6', icon: '🏗️' },
    { id: 2, name: 'Range Development',   weeks: '3-4', days: [15, 28], description: 'Extend your flexibility',     color: '#8b5cf6', icon: '🌊' },
    { id: 3, name: 'Progressive Overload', weeks: '5-6', days: [29, 42], description: 'Load and strengthen',         color: '#f59e0b', icon: '⚡' },
    { id: 4, name: 'Integration',         weeks: '7-8', days: [43, 60], description: 'Apply everything',            color: '#ef4444', icon: '🔥' }
  ];

  // ────────────────────────────────────────────────────────────────────────
  // Discipline rotation (5-day cycle)
  // ────────────────────────────────────────────────────────────────────────
  var disciplines = ['Wushu', 'Muay Thai', 'Tai Chi', 'Sanda', 'Shaolin'];

  function getDiscipline(dayNumber) {
    return disciplines[(dayNumber - 1) % disciplines.length];
  }

  // ────────────────────────────────────────────────────────────────────────
  // Exercise pools per section, per phase
  // ────────────────────────────────────────────────────────────────────────

  // --- WARMUP ---
  var warmupPools = {
    1: ['jumping_jacks', 'hip_circles', 'arm_circles', 'ankle_rotations'],
    2: ['jumping_jacks', 'hip_circles', 'arm_circles', 'ankle_rotations', 'high_knees', 'butt_kicks'],
    3: ['jumping_jacks', 'hip_circles', 'arm_circles', 'ankle_rotations', 'high_knees', 'butt_kicks', 'jump_rope_sim', 'torso_twists'],
    4: ['jumping_jacks', 'high_knees', 'butt_kicks', 'jump_rope_sim', 'torso_twists', 'light_jog', 'shoulder_rolls', 'hip_circles']
  };

  var warmupCounts = { 1: 3, 2: 4, 3: 4, 4: 4 };

  // --- DYNAMIC ---
  var dynamicPools = {
    1: ['leg_swings_front', 'leg_swings_side', 'hip_cars', 'knee_hugs'],
    2: ['leg_swings_front', 'leg_swings_side', 'hip_cars', 'knee_hugs', 'cossack_squats', 'walking_lunges', 'worlds_greatest'],
    3: ['leg_swings_front', 'leg_swings_side', 'hip_cars', 'cossack_squats', 'walking_lunges', 'worlds_greatest', 'inchworms', 'scorpion_stretch'],
    4: ['leg_swings_front', 'leg_swings_side', 'hip_cars', 'cossack_squats', 'walking_lunges', 'worlds_greatest', 'inchworms', 'scorpion_stretch', 'quad_pulls']
  };

  var dynamicCounts = { 1: 3, 2: 4, 3: 5, 4: 5 };

  // --- TECHNIQUE per discipline ---
  var techniquePools = {
    'Wushu': {
      1: ['horse_stance', 'bow_stance', 'front_stretch_kick'],
      2: ['horse_stance', 'bow_stance', 'empty_stance', 'front_stretch_kick', 'crescent_kick_out'],
      3: ['horse_stance', 'bow_stance', 'empty_stance', 'crouch_stance', 'front_stretch_kick', 'crescent_kick_out', 'crescent_kick_in'],
      4: ['horse_stance', 'bow_stance', 'empty_stance', 'crouch_stance', 'front_stretch_kick', 'crescent_kick_out', 'crescent_kick_in', 'stance_transitions']
    },
    'Muay Thai': {
      1: ['mt_guard', 'mt_jab_cross', 'mt_teep'],
      2: ['mt_guard', 'mt_jab_cross', 'mt_roundhouse', 'mt_teep', 'mt_check'],
      3: ['mt_guard', 'mt_jab_cross', 'mt_roundhouse', 'mt_teep', 'mt_knee_strike', 'mt_elbow_strike', 'mt_check'],
      4: ['mt_guard', 'mt_jab_cross', 'mt_roundhouse', 'mt_teep', 'mt_knee_strike', 'mt_elbow_strike', 'mt_check', 'mt_shadowbox']
    },
    'Tai Chi': {
      1: ['tc_breathing', 'tc_opening', 'tc_cloud_hands'],
      2: ['tc_breathing', 'tc_opening', 'tc_cloud_hands', 'tc_walking', 'tc_brush_knee'],
      3: ['tc_breathing', 'tc_opening', 'tc_cloud_hands', 'tc_walking', 'tc_brush_knee', 'tc_body_vibration'],
      4: ['tc_breathing', 'tc_opening', 'tc_cloud_hands', 'tc_walking', 'tc_brush_knee', 'tc_body_vibration']
    },
    'Sanda': {
      1: ['sd_footwork', 'sd_jab_cross_hook'],
      2: ['sd_footwork', 'sd_jab_cross_hook', 'sd_combo_kick', 'sd_pivot_drill'],
      3: ['sd_footwork', 'sd_jab_cross_hook', 'sd_combo_kick', 'sd_pivot_drill', 'sd_shadow_spar'],
      4: ['sd_footwork', 'sd_jab_cross_hook', 'sd_combo_kick', 'sd_pivot_drill', 'sd_shadow_spar']
    },
    'Shaolin': {
      1: ['sl_five_stances', 'sl_front_kick'],
      2: ['sl_five_stances', 'sl_front_kick', 'sl_side_kick', 'sl_joint_rotations'],
      3: ['sl_five_stances', 'sl_front_kick', 'sl_side_kick', 'sl_joint_rotations'],
      4: ['sl_five_stances', 'sl_front_kick', 'sl_side_kick', 'sl_joint_rotations']
    }
  };

  var techniqueCounts = { 1: 2, 2: 3, 3: 3, 4: 4 };

  // --- DEEP STRETCH ---
  var deepStretchPools = {
    1: ['butterfly_stretch', 'frog_stretch', 'pigeon_pose', 'seated_forward_fold', 'deep_squat_hold'],
    2: ['butterfly_stretch', 'frog_stretch', 'pigeon_pose', 'seated_forward_fold', 'couch_stretch', 'side_split_hold', 'front_split_hold', 'standing_pike', 'pnf_hamstring'],
    3: ['butterfly_stretch', 'frog_stretch', 'pigeon_pose', 'couch_stretch', 'side_split_hold', 'front_split_hold', 'pancake_stretch', 'standing_pike', 'lizard_pose', 'pnf_hamstring', 'pnf_adductor', 'loaded_goblet_squat', 'wall_split'],
    4: ['butterfly_stretch', 'frog_stretch', 'pigeon_pose', 'couch_stretch', 'side_split_hold', 'front_split_hold', 'pancake_stretch', 'standing_pike', 'lizard_pose', 'pnf_hamstring', 'pnf_adductor', 'loaded_goblet_squat', 'wall_split', 'deep_squat_hold']
  };

  var deepStretchCounts = { 1: 4, 2: 5, 3: 5, 4: 6 };

  // --- LOWER BACK ---
  var lowerBackPools = {
    1: ['mcgill_curlup', 'side_plank', 'bird_dog'],
    2: ['mcgill_curlup', 'side_plank', 'bird_dog', 'hip_bridge', 'dead_bug'],
    3: ['mcgill_curlup', 'side_plank', 'bird_dog', 'superman_hold', 'cat_cow', 'hip_bridge'],
    4: ['mcgill_curlup', 'side_plank', 'bird_dog', 'hip_bridge', 'dead_bug', 'cat_cow', 'child_pose', 'superman_hold']
  };

  var lowerBackCounts = { 1: 3, 2: 4, 3: 4, 4: 4 };

  // --- COOLDOWN ---
  var cooldownPools = {
    1: ['seated_twist', 'final_breathing'],
    2: ['seated_twist', 'lying_twist', 'final_breathing', 'neck_stretches'],
    3: ['seated_twist', 'lying_twist', 'final_breathing', 'wrist_stretches', 'neck_stretches'],
    4: ['seated_twist', 'lying_twist', 'final_breathing', 'neck_stretches', 'wrist_stretches', 'savasana']
  };

  var cooldownCounts = { 1: 2, 2: 3, 3: 3, 4: 3 };

  // ────────────────────────────────────────────────────────────────────────
  // Duration budgets per section (seconds) — tuned to ≈1800s total
  // ────────────────────────────────────────────────────────────────────────
  var sectionDurations = {
    1: { warmup: 180, dynamic: 240, technique: 300, 'deep-stretch': 660, 'lower-back': 240, cooldown: 180 },
    2: { warmup: 180, dynamic: 240, technique: 330, 'deep-stretch': 660, 'lower-back': 210, cooldown: 180 },
    3: { warmup: 180, dynamic: 240, technique: 360, 'deep-stretch': 660, 'lower-back': 180, cooldown: 180 },
    4: { warmup: 180, dynamic: 240, technique: 360, 'deep-stretch': 660, 'lower-back': 180, cooldown: 180 }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Motivational quotes
  // ────────────────────────────────────────────────────────────────────────
  var quotes = [
    // Bruce Lee
    '"I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times." — Bruce Lee',
    '"The successful warrior is the average man, with laser-like focus." — Bruce Lee',
    '"Absorb what is useful, discard what is useless, and add what is specifically your own." — Bruce Lee',
    '"Do not pray for an easy life, pray for the strength to endure a difficult one." — Bruce Lee',
    '"Knowing is not enough, we must apply. Willing is not enough, we must do." — Bruce Lee',

    // Miyamoto Musashi
    '"There is nothing outside of yourself that can ever enable you to get better, stronger, richer, quicker, or smarter. Everything is within." — Miyamoto Musashi',
    '"Today is victory over yourself of yesterday; tomorrow is your victory over lesser men." — Miyamoto Musashi',
    '"Think lightly of yourself and deeply of the world." — Miyamoto Musashi',
    '"The ultimate aim of martial arts is not having to use them." — Miyamoto Musashi',

    // Sun Tzu
    '"Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win." — Sun Tzu',
    '"In the midst of chaos, there is also opportunity." — Sun Tzu',

    // Ip Man
    '"A relaxed mind is a creative mind." — Ip Man',
    '"Wing Chun is like water — it finds the path of least resistance." — Ip Man',

    // Chinese Proverbs
    '"A journey of a thousand miles begins with a single step." — Chinese Proverb',
    '"The best time to plant a tree was twenty years ago. The second best time is now." — Chinese Proverb',
    '"Fall seven times, stand up eight." — Chinese Proverb',
    '"Patience is the calm acceptance that things can happen in a different order than the one you have in mind." — Chinese Proverb',

    // Muay Thai sayings
    '"The art of eight limbs demands the discipline of a single heart." — Muay Thai Proverb',
    '"Nak Muay are forged in sweat, tempered by pain, and polished by persistence." — Muay Thai Saying',

    // Tai Chi
    '"Stillness in motion, motion in stillness — this is the way of the internal arts." — Traditional Tai Chi Saying',
    '"Softness overcomes hardness; water carves through stone." — Tai Chi Principle',

    // Shaolin
    '"Kung Fu lives in everything we do. It lives in how we put on a jacket, how we take off a jacket." — Shaolin Proverb',
    '"Train both body and mind; one without the other is a warrior incomplete." — Shaolin Saying',

    // General martial arts
    '"A black belt is a white belt who never quit." — Unknown',
    '"The more you sweat in training, the less you bleed in combat." — Richard Marcinko'
  ];

  // ────────────────────────────────────────────────────────────────────────
  // Utility helpers
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Return the phase object that contains `dayNumber`.
   */
  function getPhase(dayNumber) {
    for (var i = 0; i < phases.length; i++) {
      if (dayNumber >= phases[i].days[0] && dayNumber <= phases[i].days[1]) {
        return phases[i];
      }
    }
    return phases[phases.length - 1]; // fallback
  }

  /**
   * Pick `count` items from `pool` using a rotating offset so that
   * consecutive days don't get the same subset.
   */
  function rotateSelect(pool, count, dayNumber) {
    if (count >= pool.length) return pool.slice();
    var offset = (dayNumber - 1) % pool.length;
    var result = [];
    for (var i = 0; i < count; i++) {
      result.push(pool[(offset + i) % pool.length]);
    }
    return result;
  }

  /**
   * Distribute `totalSeconds` roughly evenly across `exerciseCount` items.
   * Returns an array of integers summing to `totalSeconds`.
   */
  function distributeDuration(totalSeconds, exerciseCount) {
    if (exerciseCount === 0) return [];
    var base = Math.floor(totalSeconds / exerciseCount);
    var remainder = totalSeconds - base * exerciseCount;
    var durations = [];
    for (var i = 0; i < exerciseCount; i++) {
      durations.push(base + (i < remainder ? 1 : 0));
    }
    return durations;
  }

  /**
   * Build an exercise list: [{id, duration, sets}]
   */
  function buildExercises(ids, totalDuration) {
    var durations = distributeDuration(totalDuration, ids.length);
    return ids.map(function (id, idx) {
      return { id: id, duration: durations[idx], sets: 1 };
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // Templates (static reference data for the UI, keyed by section type)
  // ────────────────────────────────────────────────────────────────────────
  var templates = {
    warmup:        { title: '🔥 Warm-Up',            type: 'warmup' },
    dynamic:       { title: '🌊 Dynamic Stretching',  type: 'dynamic' },
    technique:     { title: '🥋 Technique Practice',  type: 'technique' },
    'deep-stretch':{ title: '🧘 Deep Stretching',     type: 'deep-stretch' },
    'lower-back':  { title: '🛡️ Lower Back Care',     type: 'lower-back' },
    cooldown:      { title: '❄️ Cool Down',           type: 'cooldown' }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Discipline-specific titles for the day card
  // ────────────────────────────────────────────────────────────────────────
  var disciplineTitles = {
    'Wushu':      ['Wushu Stances', 'Wushu Fundamentals', 'Wushu Power', 'Wushu Flow'],
    'Muay Thai':  ['Muay Thai Basics', 'Muay Thai Strikes', 'Muay Thai Combos', 'Muay Thai Power'],
    'Tai Chi':    ['Tai Chi Flow', 'Tai Chi Meditation', 'Tai Chi Breath', 'Tai Chi Movement'],
    'Sanda':      ['Sanda Footwork', 'Sanda Combos', 'Sanda Strategy', 'Sanda Agility'],
    'Shaolin':    ['Shaolin Foundations', 'Shaolin Kicks', 'Shaolin Iron Body', 'Shaolin Spirit']
  };

  function getDayTitle(phase, dayNumber, discipline) {
    var dayInPhase = dayNumber - phase.days[0] + 1;
    var titles = disciplineTitles[discipline] || [discipline];
    var titleIdx = (dayNumber - 1) % titles.length;
    return phase.name + ' Day ' + dayInPhase + ' — ' + titles[titleIdx];
  }

  // ────────────────────────────────────────────────────────────────────────
  // Main generator
  // ────────────────────────────────────────────────────────────────────────

  function generateDay(dayNumber) {
    dayNumber = Math.max(1, Math.min(60, Math.round(dayNumber)));

    var phase       = getPhase(dayNumber);
    var phaseId     = phase.id;
    var discipline  = getDiscipline(dayNumber);
    var durations   = sectionDurations[phaseId];

    // Select exercises for each section
    var warmupIds      = rotateSelect(warmupPools[phaseId],      warmupCounts[phaseId],      dayNumber);
    var dynamicIds     = rotateSelect(dynamicPools[phaseId],     dynamicCounts[phaseId],     dayNumber);
    var deepStretchIds = rotateSelect(deepStretchPools[phaseId], deepStretchCounts[phaseId], dayNumber);
    var lowerBackIds   = rotateSelect(lowerBackPools[phaseId],   lowerBackCounts[phaseId],   dayNumber);
    var cooldownIds    = rotateSelect(cooldownPools[phaseId],    cooldownCounts[phaseId],    dayNumber);

    // Technique – select from the day's discipline pool
    var techPool  = techniquePools[discipline][phaseId] || techniquePools[discipline][1];
    var techCount = Math.min(techniqueCounts[phaseId], techPool.length);
    var techIds   = rotateSelect(techPool, techCount, dayNumber);

    // Build sections
    var sections = [
      {
        type: 'warmup',
        title: templates.warmup.title,
        duration: durations.warmup,
        exercises: buildExercises(warmupIds, durations.warmup)
      },
      {
        type: 'dynamic',
        title: templates.dynamic.title,
        duration: durations.dynamic,
        exercises: buildExercises(dynamicIds, durations.dynamic)
      },
      {
        type: 'technique',
        title: templates.technique.title,
        duration: durations.technique,
        exercises: buildExercises(techIds, durations.technique)
      },
      {
        type: 'deep-stretch',
        title: templates['deep-stretch'].title,
        duration: durations['deep-stretch'],
        exercises: buildExercises(deepStretchIds, durations['deep-stretch'])
      },
      {
        type: 'lower-back',
        title: templates['lower-back'].title,
        duration: durations['lower-back'],
        exercises: buildExercises(lowerBackIds, durations['lower-back'])
      },
      {
        type: 'cooldown',
        title: templates.cooldown.title,
        duration: durations.cooldown,
        exercises: buildExercises(cooldownIds, durations.cooldown)
      }
    ];

    // Pick a quote — deterministic per day so reloads are consistent
    var quoteIndex = (dayNumber * 7 + 3) % quotes.length;

    return {
      day: dayNumber,
      phase: phase,
      title: getDayTitle(phase, dayNumber, discipline),
      focusDiscipline: discipline,
      quote: quotes[quoteIndex],
      sections: sections
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // Gym adaptation
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Returns a modifications descriptor that the UI can apply on top of
   * a generated day when the user has a gym session on the same day.
   *
   * @param {number} dayNumber  1-60
   * @param {string} gymType    'upper-a' | 'upper-b' | 'lower-a' | 'lower-b' | 'rest'
   * @returns {object}          { type, description, sectionOverrides }
   */
  function getGymAdaptation(dayNumber, gymType) {
    var workout = generateDay(dayNumber);

    var result = {
      type: gymType,
      description: '',
      sectionOverrides: {}
    };

    var upperMobilityReplacements = ['arm_circles', 'shoulder_rolls', 'torso_twists', 'wrist_stretches'];

    if (gymType === 'lower-a' || gymType === 'lower-b') {
      // ── Lower-body gym day ──
      // Legs are already taxed → reduce split work, add upper mobility
      result.description = 'Lower-body gym day: reduced leg stretching intensity, added upper-body mobility.';

      var originalDeep = workout.sections.filter(function (s) { return s.type === 'deep-stretch'; })[0];
      if (originalDeep) {
        var legStretchIds = [
          'side_split_hold', 'front_split_hold', 'wall_split',
          'frog_stretch', 'pigeon_pose', 'couch_stretch'
        ];
        var modifiedExercises = [];
        var replacedCount = 0;
        var replacementIdx = 0;

        originalDeep.exercises.forEach(function (ex) {
          if (legStretchIds.indexOf(ex.id) !== -1 && replacedCount < 2) {
            // Replace with upper-body mobility
            modifiedExercises.push({
              id: upperMobilityReplacements[replacementIdx % upperMobilityReplacements.length],
              duration: ex.duration,
              sets: 1
            });
            replacedCount++;
            replacementIdx++;
          } else if (legStretchIds.indexOf(ex.id) !== -1) {
            // Halve duration of remaining split holds
            modifiedExercises.push({
              id: ex.id,
              duration: Math.round(ex.duration / 2),
              sets: ex.sets
            });
          } else {
            modifiedExercises.push(ex);
          }
        });

        // Recalculate section duration
        var totalDur = modifiedExercises.reduce(function (sum, e) { return sum + e.duration; }, 0);
        result.sectionOverrides['deep-stretch'] = {
          exercises: modifiedExercises,
          duration: totalDur
        };
      }

    } else if (gymType === 'upper-a' || gymType === 'upper-b') {
      // ── Upper-body gym day ──
      // Legs are fresh → ideal for leg flexibility work, no modifications needed
      result.description = 'Upper-body gym day: ideal for full leg flexibility protocol. No modifications needed.';

    } else if (gymType === 'rest') {
      // ── Rest day ──
      // Full comprehensive session; add 30s to each deep stretch hold
      result.description = 'Rest day: extended deep stretch holds for maximum flexibility gains.';

      var deepSection = workout.sections.filter(function (s) { return s.type === 'deep-stretch'; })[0];
      if (deepSection) {
        var extendedExercises = deepSection.exercises.map(function (ex) {
          return {
            id: ex.id,
            duration: ex.duration + 30,
            sets: ex.sets
          };
        });
        var extendedDuration = extendedExercises.reduce(function (sum, e) { return sum + e.duration; }, 0);
        result.sectionOverrides['deep-stretch'] = {
          exercises: extendedExercises,
          duration: extendedDuration
        };
      }
    }

    return result;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────────────────────────────────────

  window.WORKOUTS = {
    phases: phases,
    templates: templates,
    generateDay: generateDay,
    getGymAdaptation: getGymAdaptation
  };

})();
