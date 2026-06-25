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
    durationMultiplier: 1.0,
    masteryStances: 0,
    masteryBalance: 0
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
    this.enrichLibraryData();
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

  enrichLibraryData() {
    if (!window.EXERCISES) return;
    
    // 1. Assign subcategories to existing exercises
    Object.values(window.EXERCISES).forEach(ex => {
      if (ex.subcategory) return;
      const n = (ex.name + ' ' + (ex.id||'') + ' ' + (ex.description||'')).toLowerCase();
      if (ex.category === 'warmup' || ex.category === 'dynamic' || ex.category === 'deep-stretch' || ex.category === 'lower-back') {
        ex.subcategory = 'conditioning';
      } else if (ex.category === 'cooldown') {
        ex.subcategory = 'breathing';
      } else {
        if (n.includes('stance') || n.includes('hold') || n.includes('mapu') || n.includes('gongbu') || n.includes('kiba') || n.includes('horse')) ex.subcategory = 'stance';
        else if (n.includes('kick') || n.includes('chagi') || n.includes('geri')) ex.subcategory = 'kick';
        else if (n.includes('throw') || n.includes('sweep') || n.includes('takedown') || n.includes('shuai') || n.includes('judo') || n.includes('gari')) ex.subcategory = 'throw';
        else if (n.includes('armbar') || n.includes('triangle') || n.includes('choke') || n.includes('guard') || n.includes('ground') || n.includes('pin') || n.includes('mount')) ex.subcategory = 'ground';
        else if (n.includes('sword') || n.includes('staff') || n.includes('spear') || n.includes('dao') || n.includes('jian') || n.includes('weapon') || n.includes('stick') || n.includes('nunchaku') || n.includes('kama') || n.includes('shinai') || n.includes('bokken')) ex.subcategory = 'weapon';
        else if (n.includes('form') || n.includes('kata') || n.includes('poomsae') || n.includes('taolu') || n.includes('pattern')) ex.subcategory = 'form';
        else if (n.includes('block') || n.includes('parry') || n.includes('sau') || n.includes('uke') || n.includes('deflect')) ex.subcategory = 'block';
        else if (n.includes('step') || n.includes('footwork') || n.includes('pivot') || n.includes('shift') || n.includes('move')) ex.subcategory = 'footwork';
        else if (n.includes('breath') || n.includes('qigong') || n.includes('meditat')) ex.subcategory = 'breathing';
        else ex.subcategory = 'strike';
      }
    });

    // 2. Inject comprehensive catalog of techniques for all 18 disciplines
    const extraTechs = [
      // KARATE
      { id:'kar_oizuki', name:'Oi-Zuki (Lunge Punch)', discipline:'karate', subcategory:'strike', duration:30, difficulty:1, icon:'👊', description:'A fundamental stepping punch executing with full hip rotation into Zenkutsu-Dachi.', tips:'Drive forward from your rear leg and snap your drawing arm (hikite) back.' },
      { id:'kar_gyakuzuki', name:'Gyaku-Zuki (Reverse Punch)', discipline:'karate', subcategory:'strike', duration:30, difficulty:1, icon:'🥋', description:'Powerful punch thrown from the rear hand while standing in a forward stance.', tips:'Coordinate the snap of your hips exactly with the impact of the fist.' },
      { id:'kar_maegeri', name:'Mae Geri (Front Snap Kick)', discipline:'karate', subcategory:'kick', duration:30, difficulty:1, icon:'🦶', description:'Linear front kick striking with the ball of the foot (koshi).', tips:'Chamber your knee high before snapping the leg out and re-chambering immediately.' },
      { id:'kar_mawashigeri', name:'Mawashi Geri (Roundhouse Kick)', discipline:'karate', subcategory:'kick', duration:45, difficulty:2, icon:'🌀', description:'Circular kick striking with the instep or ball of the foot.', tips:'Pivot firmly on your support foot to open your hips.' },
      { id:'kar_yokogeri', name:'Yoko Geri Kekomi (Side Thrust Kick)', discipline:'karate', subcategory:'kick', duration:45, difficulty:2, icon:'⚡', description:'Driving side kick striking with the heel or blade of the foot (sokuto).', tips:'Push your hips outward through the target.' },
      { id:'kar_shutouchi', name:'Shuto Uchi (Knife Hand Strike)', discipline:'karate', subcategory:'strike', duration:30, difficulty:2, icon:'✋', description:'Slashing strike using the outer fleshy edge of the palm.', tips:'Relax your shoulder and snap your wrist upon impact.' },
      { id:'kar_ageuke', name:'Age Uke (Rising Block)', discipline:'karate', subcategory:'block', duration:30, difficulty:1, icon:'🛡️', description:'Upward deflection protecting the head and face from descending strikes.', tips:'Deflect at an angle rather than meeting force directly.' },
      { id:'kar_zenkutsu', name:'Zenkutsu-Dachi (Front Stance)', discipline:'karate', subcategory:'stance', duration:60, difficulty:1, icon:'🧍', description:'Long, deep forward stance with 60% of weight on the front bent leg.', tips:'Keep your rear leg completely straight and rear heel glued to the floor.' },
      { id:'kar_kiba', name:'Kiba-Dachi (Horse Stance)', discipline:'karate', subcategory:'stance', duration:60, difficulty:1, icon:'🏇', description:'Wide straddle stance with feet parallel and knees pushed outward.', tips:'Tuck your tailbone and keep your torso upright.' },
      { id:'kar_heian1', name:'Heian Shodan (Kata 1)', discipline:'karate', subcategory:'form', duration:90, difficulty:2, icon:'📜', description:'The first foundational kata introducing basic blocks, punches, and turns.', tips:'Focus on rhythm, eye contact (embusen), and sharp transitions.' },

      // TAEKWONDO
      { id:'tkd_apchagi', name:'Ap Chagi (Front Snap Kick)', discipline:'taekwondo', subcategory:'kick', duration:30, difficulty:1, icon:'🦶', description:'Fast snapping front kick aimed at the solar plexus or chin.', tips:'Fold your knee tightly before and after the strike.' },
      { id:'tkd_dollyo', name:'Dollyo Chagi (Roundhouse Kick)', discipline:'taekwondo', subcategory:'kick', duration:30, difficulty:1, icon:'🌪️', description:'Signature Taekwondo roundhouse kick whipped from the hip.', tips:'Turn your supporting foot 180 degrees away from the target.' },
      { id:'tkd_yeopchagi', name:'Yeop Chagi (Side Kick)', discipline:'taekwondo', subcategory:'kick', duration:45, difficulty:2, icon:'⚡', description:'Linear thrust kick driving the heel into the target.', tips:'Sight your target over your shoulder and align your hip, knee, and heel.' },
      { id:'tkd_dwichagi', name:'Dwi Chagi (Back Kick)', discipline:'taekwondo', subcategory:'kick', duration:45, difficulty:3, icon:'🔄', description:'Explosive spinning straight back kick catching advancing opponents.', tips:'Look over your shoulder and kick straight back—do not swing it wide.' },
      { id:'tkd_dwihuryeo', name:'Dwi Huryeo Chagi (Spin Hook Kick)', discipline:'taekwondo', subcategory:'kick', duration:60, difficulty:3, icon:'🌀', description:'Spinning 360-degree whipping heel kick to the head.', tips:'Let the momentum of your head turn pull your whipping leg through.' },
      { id:'tkd_naeryeo', name:'Naeryeo Chagi (Axe Kick)', discipline:'taekwondo', subcategory:'kick', duration:45, difficulty:2, icon:'🪓', description:'High soaring leg dropped straight down with heel impact on the collarbone or face.', tips:'Bring your leg up high from the outside or inside before dropping gravity.' },
      { id:'tkd_narae', name:'Narae Chagi (Double Roundhouse)', discipline:'taekwondo', subcategory:'kick', duration:45, difficulty:3, icon:'🦋', description:'Rapid aerial alternating roundhouse kicks executed mid-air.', tips:'Stay light on your toes and switch hips instantaneously.' },
      { id:'tkd_apseogi', name:'Ap Seogi (Walking Stance)', discipline:'taekwondo', subcategory:'stance', duration:45, difficulty:1, icon:'🚶', description:'Natural upright stepping stance used in basic poomsae.', tips:'Maintain natural shoulder width for effortless mobility.' },
      { id:'tkd_kyorugi', name:'Kyorugi Jase (Sparring Stance)', discipline:'taekwondo', subcategory:'stance', duration:60, difficulty:1, icon:'🤺', description:'Bladed, bouncing stance optimized for lightning-fast kick entries.', tips:'Keep your weight lightly on the balls of both feet.' },
      { id:'tkd_taegeuk1', name:'Taegeuk Il Jang (Poomsae 1)', discipline:'taekwondo', subcategory:'form', duration:90, difficulty:1, icon:'☯️', description:'First official WT pattern representing Heaven and Light (Keon).', tips:'Breathe out sharply on every strike and block.' },

      // WING CHUN
      { id:'wc_chainpunch', name:'Lien Wan Kuen (Chain Punches)', discipline:'wingchun', subcategory:'strike', duration:45, difficulty:2, icon:'🥊', description:'Rapid-fire centerline vertical punches cycling one over the other.', tips:'Keep elbows heavy and tracking inward along your vertical centerline.' },
      { id:'wc_tansau', name:'Tan Sau (Palm-Up Dispersing Hand)', discipline:'wingchun', subcategory:'block', duration:30, difficulty:1, icon:'🫴', description:'Wedge-like deflection redirecting incoming straight force.', tips:'Do not chase the opponent\'s hand; hold your structural centerline angle.' },
      { id:'wc_bongsau', name:'Bong Sau (Wing Arm)', discipline:'wingchun', subcategory:'block', duration:30, difficulty:2, icon:'🦅', description:'Rolling elbow deflection used when centerline structure is collapsed.', tips:'Keep your wrist relaxed and elbow higher than your wrist.' },
      { id:'wc_paksau', name:'Pak Sau (Slapping Deflection)', discipline:'wingchun', subcategory:'block', duration:30, difficulty:1, icon:'👏', description:'Quick lateral palm slap clearing an obstructing limb.', tips:'Parry just enough to clear the line; immediately follow with a strike.' },
      { id:'wc_ygkym', name:'Yee Jee Kim Yeung Ma (Stance)', discipline:'wingchun', subcategory:'stance', duration:90, difficulty:1, icon:'🐐', description:'Foundational goat-clamping training stance locking knees inward.', tips:'Sink your hips forward and squeeze inner thighs to build rooting.' },
      { id:'wc_chisao', name:'Chi Sao Drill (Sticky Hands)', discipline:'wingchun', subcategory:'conditioning', duration:60, difficulty:3, icon:'🤲', description:'Tactile sensitivity exercise maintaining constant rolling contact.', tips:'Listen to pressure changes with your skin rather than your eyes.' },
      { id:'wc_siunimtao', name:'Siu Nim Tao (Little Idea Form)', discipline:'wingchun', subcategory:'form', duration:120, difficulty:1, icon:'🧘', description:'First unarmed form practicing stationary structure and elbow energy.', tips:'Perform the first third in extreme slow motion to cultivate energy.' },
      { id:'wc_fakkuen', name:'Fak Sau (Whisking Hand)', discipline:'wingchun', subcategory:'strike', duration:30, difficulty:2, icon:'🪒', description:'Horizontal chopping strike to the neck or throat.', tips:'Whip from the elbow joint with sudden relaxation.' },

      // KRAV MAGA
      { id:'km_palmstrike', name:'Aggressive Palm Strike', discipline:'kravmaga', subcategory:'strike', duration:30, difficulty:1, icon:'🖐️', description:'Devastating close-range thrust driving the heel of palm into nose/chin.', tips:'Keep fingers curled back to avoid jamming them.' },
      { id:'km_hammerfist', name:'Downward Hammer Fist', discipline:'kravmaga', subcategory:'strike', duration:30, difficulty:1, icon:'🔨', description:'Natural pounding strike utilizing the bottom edge of the clenched fist.', tips:'Drop your entire body weight into the strike.' },
      { id:'km_groinkick', name:'Front Kick to Groin', discipline:'kravmaga', subcategory:'kick', duration:30, difficulty:1, icon:'💥', description:'Fast whipping kick driving shin or instep upward into vulnerable targets.', tips:'Kick straight up between the legs with zero telegraphing.' },
      { id:'km_360defense', name:'360 Degree Defense', discipline:'kravmaga', subcategory:'block', duration:45, difficulty:2, icon:'🛡️', description:'Instinctive perimeter parrying system against circular attacks.', tips:'Meet incoming limbs at a 90-degree angle with aggressive forward motion.' },
      { id:'km_knifedefense', name:'Bursting Knife Parry', discipline:'kravmaga', subcategory:'block', duration:60, difficulty:3, icon:'🔪', description:'Explosive redirect and control against overhead or thrusting weapon attacks.', tips:'Redirect the weapon hand while simultaneously counter-attacking.' },
      { id:'km_bearhug', name:'Bear Hug Escape', discipline:'kravmaga', subcategory:'ground', duration:45, difficulty:2, icon:'🐻', description:'Rapid base-dropping and space-creating sequence to break body locks.', tips:'Drop your center of gravity instantly and create space with elbow strikes.' },
      { id:'km_chokedefense', name:'Pluck & Counter Choke Defense', discipline:'kravmaga', subcategory:'block', duration:45, difficulty:1, icon:'🪝', description:'Hooking thumbs under attacker\'s hands while driving knees forward.', tips:'Pluck violently at the thumbs while dropping your chin.' },
      { id:'km_combatives', name:'Combatives Stress Drill', discipline:'kravmaga', subcategory:'conditioning', duration:60, difficulty:3, icon:'🔥', description:'Continuous non-stop striking flow combining elbows, knees, and palms.', tips:'Breathe aggressively and push through fatigue.' },

      // HAPKIDO
      { id:'hp_sonmok', name:'Sonmok Sool (Wrist Lock Escapes)', discipline:'hapkido', subcategory:'ground', duration:45, difficulty:2, icon:'🔗', description:'Circular joint manipulation turning attacker\'s grip against their own wrist.', tips:'Move your entire body around the wrist joint rather than twisting arms.' },
      { id:'hp_nakbeop', name:'Nakbeop (Soft Breakfalls)', discipline:'hapkido', subcategory:'conditioning', duration:60, difficulty:1, icon:'🍂', description:'Rolling and slapping techniques to dissipate impact when thrown.', tips:'Tuck your chin firmly and slap the mat fractions of a second before landing.' },
      { id:'hp_deonjigi', name:'Deonjigi (Hip Throw Entry)', discipline:'hapkido', subcategory:'throw', duration:45, difficulty:3, icon:'🤸', description:'Blending with advancing momentum to unbalance and throw.', tips:'Step deep under the opponent\'s center of gravity.' },
      { id:'hp_jointflow', name:'Joint Lock Flow Drill', discipline:'hapkido', subcategory:'ground', duration:60, difficulty:3, icon:'🔄', description:'Seamless transition from wrist lock to elbow lock to shoulder pin.', tips:'Maintain constant tension on the trapped joints during transitions.' },
      { id:'hp_spinheel', name:'Dwi-Dora Chagi (Spin Heel)', discipline:'hapkido', subcategory:'kick', duration:45, difficulty:3, icon:'🌪️', description:'Low sweeping spinning heel kick targeting opponent\'s support knee or calves.', tips:'Keep your torso upright and sweep parallel to the floor.' },
      { id:'hp_kamae', name:'Hapkido Defensive Kamae', discipline:'hapkido', subcategory:'stance', duration:45, difficulty:1, icon:'🧘‍♂️', description:'Balanced circular guard inviting attacks to be redirected.', tips:'Keep hands open and relaxed ready to seize or deflect.' },

      // SILAT
      { id:'sil_kudakuda', name:'Kuda-Kuda Rendah (Low Stance)', discipline:'silat', subcategory:'stance', duration:60, difficulty:2, icon:'🐅', description:'Deep predatory tiger stance coiled for sudden lunges.', tips:'Keep your weight grounded and spine supple.' },
      { id:'sil_sapu', name:'Sapu Luar (Outside Sweep)', discipline:'silat', subcategory:'throw', duration:45, difficulty:3, icon:'🧹', description:'Reaping footwork catching the opponent\'s ankle just as weight shifts onto it.', tips:'Coordinate the low leg reap with an upper body push in the opposite direction.' },
      { id:'sil_sikut', name:'Sikut (Smashing Elbow)', discipline:'silat', subcategory:'strike', duration:30, difficulty:2, icon:'💥', description:'Short-range descending or horizontal elbow cuts.', tips:'Step in close and use the tip of the bone like a blade.' },
      { id:'sil_langkah', name:'Langkah Tiga (Triangle Stepping)', discipline:'silat', subcategory:'footwork', duration:60, difficulty:2, icon:'📐', description:'Geometric geometric footwork patterns navigating angles of attack and evasion.', tips:'Glide your feet lightly along the floor without bouncing.' },
      { id:'sil_kuncian', name:'Kuncian (Ground Entanglements)', discipline:'silat', subcategory:'ground', duration:60, difficulty:3, icon:'🕸️', description:'Leg and arm scissor entanglements pinning opponents to the earth.', tips:'Use your legs like extra arms to trap opponent\'s base.' },
      { id:'sil_jurus1', name:'Jurus Foundation Flow', discipline:'silat', subcategory:'form', duration:90, difficulty:2, icon:'🌀', description:'Traditional solo rhythmic fighting sequence combining parries and sweeps.', tips:'Connect each movement like flowing water turning into crashing waves.' },

      // KENDO
      { id:'ken_men', name:'Men Uchi (Head Cut)', discipline:'kendo', subcategory:'weapon', duration:45, difficulty:1, icon:'⚔️', description:'Straight overhead bamboo sword (shinai) strike to the center of helmet.', tips:'Squeeze the hilt with your left pinky and ring finger upon impact (tenouchi).' },
      { id:'ken_kote', name:'Kote Uchi (Wrist Cut)', discipline:'kendo', subcategory:'weapon', duration:45, difficulty:2, icon:'🗡️', description:'Sharp precise downward cut to the opponent\'s right gauntlet.', tips:'Drop your blade tip sharply onto the target with a crisp snap.' },
      { id:'ken_do', name:'Do Uchi (Torso Cut)', discipline:'kendo', subcategory:'weapon', duration:45, difficulty:2, icon:'⚡', description:'Diagonal slashing cut across the opponent\'s breastplate.', tips:'Step slightly diagonally to clear the centerline as you slice.' },
      { id:'ken_chudan', name:'Chudan-no-Kamae (Center Guard)', discipline:'kendo', subcategory:'stance', duration:90, difficulty:1, icon:'🧘', description:'The fundamental water guard aiming blade tip directly at opponent\'s throat.', tips:'Keep your left hand centered directly in front of your navel.' },
      { id:'ken_fumikomi', name:'Fumikomi-Ashi (Stamping Footwork)', discipline:'kendo', subcategory:'footwork', duration:60, difficulty:2, icon:'👣', description:'Explosive leaping front foot stamp synchronized perfectly with blade impact.', tips:'Land flat on the right sole producing a loud resounding percussion.' },
      { id:'ken_kirikaeshi', name:'Kirikaeshi (Continuous Cutting)', discipline:'kendo', subcategory:'conditioning', duration:90, difficulty:3, icon:'🔥', description:'Rhythmic alternating left and right diagonal head cuts developing stamina.', tips:'Use large overhead shoulder motions and shout spirited Kiai.' },

      // BOXING
      { id:'box_jab', name:'Crisp Lead Jab', discipline:'boxing', subcategory:'strike', duration:30, difficulty:1, icon:'🥊', description:'The most important weapon in combat sports; straight lead hand snap.', tips:'Keep your rear guard glued to your chin and snap shoulder forward.' },
      { id:'box_cross', name:'Rear Power Cross', discipline:'boxing', subcategory:'strike', duration:30, difficulty:1, icon:'💥', description:'Straight rear hand punch thrown with explosive hip and back foot rotation.', tips:'Pivot your rear heel out and extend full reach without leaning over front knee.' },
      { id:'box_leadhook', name:'Lead Check Hook', discipline:'boxing', subcategory:'strike', duration:30, difficulty:2, icon:'🪝', description:'Compact 90-degree circular punch pivoting on lead foot.', tips:'Keep your lead elbow parallel to the floor and turn torso as a solid unit.' },
      { id:'box_uppercut', name:'Rear Uppercut', discipline:'boxing', subcategory:'strike', duration:30, difficulty:2, icon:'🚀', description:'Upward driving punch launched from the legs under opponent\'s guard.', tips:'Dip slightly at the knees and drive upward through hips.' },
      { id:'box_12combo', name:'Jab - Cross (1-2 Combo)', discipline:'boxing', subcategory:'strike', duration:45, difficulty:1, icon:'⚡', description:'The classic fundamental boxing combination.', tips:'Retract the jab straight back along the exact line the cross advances.' },
      { id:'box_slip', name:'Slip & Counter Drill', discipline:'boxing', subcategory:'block', duration:60, difficulty:2, icon:'🛡️', description:'Subtle head movement slipping outside straight punches immediately firing counters.', tips:'Slip by bending at the waist and knees—only move head a few inches.' },
      { id:'box_bobweave', name:'Bob & Weave Under Hooks', discipline:'boxing', subcategory:'footwork', duration:60, difficulty:2, icon:'〰️', description:'U-shaped ducking footwork rolling underneath swinging punches.', tips:'Bend your knees to change level rather than bowing your waist.' },
      { id:'box_pendulum', name:'Pendulum Step Footwork', discipline:'boxing', subcategory:'footwork', duration:60, difficulty:1, icon:'👣', description:'Rhythmic bouncing forward and backward distance management.', tips:'Stay lightly on the balls of your feet keeping stance width constant.' },

      // EXTRA FOR OTHER DISCIPLINES
      { id:'bjj_armbar', name:'Juji-Gatame (Armbar from Guard)', discipline:'bjj', subcategory:'ground', duration:60, difficulty:2, icon:'🦾', description:'Classic submission isolating arm between legs and hyperextending elbow joint.', tips:'Pinch knees tightly together and control thumb pointing up.' },
      { id:'bjj_triangle', name:'Sankaku-Jime (Triangle Choke)', discipline:'bjj', subcategory:'ground', duration:60, difficulty:3, icon:'📐', description:'Stranglehold trapping opponent\'s neck and one arm inside figure-4 legs.', tips:'Cut the angle perpendicular to attacker to lock the choke tightly.' },
      { id:'bjj_rnc', name:'Mata Leão (Rear Naked Choke)', discipline:'bjj', subcategory:'ground', duration:45, difficulty:2, icon:'🦁', description:'The king of submissions applied from back mount sliding forearm under chin.', tips:'Hide your choking hand behind opponent\'s head—do not squeeze with biceps alone.' },
      { id:'jud_osoto', name:'Osoto Gari (Major Outer Reap)', discipline:'judo', subcategory:'throw', duration:45, difficulty:2, icon:'🥋', description:'Driving opponent backward onto heels while sweeping support leg from outside.', tips:'Pull opponent\'s sleeve tightly to your chest destroying their balance (kuzushi).' },
      { id:'jud_seoi', name:'Morote Seoi Nage (Shoulder Throw)', discipline:'judo', subcategory:'throw', duration:45, difficulty:3, icon:'🤸', description:'Turning turning your back underneath opponent\'s center loading them onto shoulders.', tips:'Squat low below their belt line and pull forward continuously.' },
      { id:'jud_uchimata', name:'Uchi Mata (Inner Thigh Throw)', discipline:'judo', subcategory:'throw', duration:60, difficulty:3, icon:'🚀', description:'Reaping upward between opponent\'s thighs while lifting and turning.', tips:'Drive your sweeping leg high like a pendulum.' },
      { id:'cap_ginga', name:'Ginga (Foundational Rocking)', discipline:'capoeira', subcategory:'footwork', duration:60, difficulty:1, icon:'💃', description:'Continuous rhythmic triangular stepping keeping capoeirista in constant fluid motion.', tips:'Protect your face with your lead arm switching naturally with every step.' },
      { id:'cap_meialua', name:'Meia Lua de Compasso', discipline:'capoeira', subcategory:'kick', duration:45, difficulty:2, icon:'🌙', description:'Iconic spinning heel kick placing hands on floor for tremendous velocity.', tips:'Look between your legs at the target while whipping heel around.' },
      { id:'cap_au', name:'Aú (Cartwheel Evasion)', discipline:'capoeira', subcategory:'footwork', duration:45, difficulty:1, icon:'🤸', description:'Acrobatic cartwheel used to escape traps or enter sweeping attacks.', tips:'Keep your eyes fixed on your opponent throughout the inverted rotation.' },
      { id:'sj_baoshuai', name:'Bao Tui Shuai (Double Leg Takedown)', discipline:'shuaijiao', subcategory:'throw', duration:45, difficulty:2, icon:'🤼', description:'Shooting shooting deep driving shoulder into waist while lifting legs.', tips:'Keep head tight to opponent\'s ribs and drive across.' },
      { id:'sj_gouchan', name:'Gou Chan (Inner Hooking Sweep)', discipline:'shuaijiao', subcategory:'throw', duration:45, difficulty:3, icon:'🪝', description:'Hooking inside ankle while driving upper body backward.', tips:'Root your standing leg firmly.' },
      { id:'aik_tenkan', name:'Tenkan (180 Degree Turning Pivot)', discipline:'aikido', subcategory:'footwork', duration:45, difficulty:1, icon:'🌀', description:'Blending pivot stepping behind advancing attacker to redirect momentum.', tips:'Keep your posture erect and turn around your stable center.' },
      { id:'aik_shiho', name:'Shihonage (Four Direction Throw)', discipline:'aikido', subcategory:'throw', duration:60, difficulty:2, icon:'🍃', description:'Folding opponent\'s arm back over their own shoulder creating inescapable spiral.', tips:'Raise their wrist high like drawing a sword before stepping underneath.' },
      { id:'sha_5animals', name:'Wu Xing Fist (Five Animals Basics)', discipline:'shaolin', subcategory:'form', duration:120, difficulty:3, icon:'🐉', description:'Channeling the spirit and mechanics of Dragon, Tiger, Leopard, Snake, and Crane.', tips:'Express fierce intent with eyes and explosive muscle contraction.' },
      { id:'sha_ironforearm', name:'Tie Bi Gong (Iron Forearm Conditioning)', discipline:'shaolin', subcategory:'conditioning', duration:60, difficulty:2, icon:'🦾', description:'Rhythmic striking of forearms together to cultivate bone density and Qi.', tips:'Start gently and breathe out sharply upon every contact.' },
      { id:'san_sidekick', name:'Sanda Ceping Tui (Intercepting Side Kick)', discipline:'sanda', subcategory:'kick', duration:45, difficulty:2, icon:'⚡', description:'Fast jamming side kick stopping advancing rushers dead in their tracks.', tips:'Lift knee straight to chest before thrusting heel outward.' },
      { id:'san_kuashuai', name:'Kua Shuai (Catch Kick Hip Throw)', discipline:'sanda', subcategory:'throw', duration:45, difficulty:3, icon:'🤸', description:'Catching opponent\'s roundhouse kick stepping deep across hip to dump them.', tips:'Clamp the caught leg tightly under armpit before turning hips.' },
      { id:'tai_cloudhands', name:'Yun Shou (Cloud Hands Flow)', discipline:'taichi', subcategory:'form', duration:90, difficulty:1, icon:'☁️', description:'Gentle continuous meditative waist turning moving hands like floating clouds.', tips:'Let your waist lead the hands; shoulders stay completely sunken.' },
      { id:'tai_fajin', name:'Fa Jin (Explosive Energy Release)', discipline:'taichi', subcategory:'strike', duration:45, difficulty:4, icon:'💥', description:'Sudden discharge of internal power generated from the earth through relaxed joints.', tips:'Store energy like a compressed spring then release instantaneously.' }
    ];

    const customInst = {
      kar_oizuki: ['Step forward deep into Zenkutsu-Dachi.', 'Drive your rear hip straight along the centerline.', 'Strike straight out at solar plexus level while snapping Hikite back.'],
      kar_gyakuzuki: ['Maintain strong rooted posture in front stance.', 'Explosively rotate your hips forward from rear leg.', 'Extend punch cleanly turning palm down at impact.'],
      kar_maegeri: ['Lift your chambering knee high above waist.', 'Snap lower leg out striking with ball of foot (Koshi).', 'Instantaneously retract heel back to chamber before landing.'],
      kar_mawashigeri: ['Pivot 180 degrees on ball of supporting foot.', 'Whip knee around horizontally parallel to floor.', 'Extend lower leg striking with instep and snap back immediately.'],
      kar_yokogeri: ['Chamber knee tightly across chest pointing heel at target.', 'Thrust hips outward driving heel and blade of foot straight through.', 'Hold full extension momentarily before snapping knee back.'],
      kar_shutouchi: ['Chamber knife hand near opposite ear with palm facing out.', 'Slice diagonally outward rotating wrist sharply upon impact.', 'Keep shoulders sunken and relaxed.'],
      kar_ageuke: ['Cross blocking forearm across chest at shoulder level.', 'Drive forearm upward rotating wrist outward above forehead.', 'Deflect incoming downward force at a 45-degree angle.'],
      kar_zenkutsu: ['Step forward bending front knee until front toe is obscured.', 'Lock rear leg completely straight with heel pressed into floor.', 'Keep hips square and posture erect.'],
      kar_kiba: ['Set feet twice shoulder-width apart with outer edges parallel.', 'Sink hips low until thighs are nearly parallel to mat.', 'Push knees firmly outward and tuck tailbone forward.'],
      kar_heian1: ['Begin in Musubi-Dachi bowing cleanly.', 'Step left into downward block with crisp rhythm.', 'Snap head turns clearly before moving into each stepping strike.'],
      tkd_apchagi: ['Fold knee tightly directly toward chest.', 'Extend lower leg snapping ball of foot straight into target.', 'Re-fold knee completely before returning to stance.'],
      tkd_dollyo: ['Pivot support foot completely away from target.', 'Turn hips over whipping roundhouse kick from outside.', 'Strike cleanly with instep keeping guard tight.'],
      tkd_yeopchagi: ['Chamber leg pulling knee across body sighting over shoulder.', 'Drive straight out aligning shoulder, hip, knee, and heel.', 'Push through target with bottom edge of heel.'],
      tkd_dwichagi: ['Spin head and shoulders looking straight back.', 'Thrust kicking leg straight back like a mule kick.', 'Keep torso low and recover instantly into guard.'],
      tkd_dwihuryeo: ['Perform full 360-degree spin whipping leg across horizontal plane.', 'Hook heel sharply through target zone at peak velocity.', 'Let momentum carry you back into balanced guard.'],
      tkd_naeryeo: ['Raise kicking leg soaring high above opponent head level.', 'Pull down forcefully driving heel onto collarbone or face.', 'Land softly with knees bent to absorb impact.'],
      tkd_narae: ['Launch first roundhouse kick mid-air.', 'Switch hips instantaneously before landing to fire second kick.', 'Stay light on balls of feet maintaining cadence.'],
      tkd_apseogi: ['Step naturally forward one walking step length.', 'Maintain shoulder-width horizontal separation.', 'Keep weight evenly distributed 50-50 on both legs.'],
      tkd_kyorugi: ['Adopt bladed side-facing posture on balls of feet.', 'Maintain light rhythmic bouncing cadence.', 'Keep lead hand low to parry kicks and rear hand high at chin.'],
      tkd_taegeuk1: ['Inhale calmly before snapping first block.', 'Coordinate breathing exhale with every sharp strike.', 'Maintain exact footwork pattern along Keon diagram.'],
      wc_chainpunch: ['Launch vertical fist centerline punches cycling one over the other.', 'Keep elbows heavy pointing down toward ground.', 'Whip from triceps maintaining continuous forward pressure.'],
      wc_tansau: ['Extend forearm forward along centerline with palm up.', 'Form a rigid wedge angle from elbow to wrist.', 'Deflect incoming force outward without chasing hands.'],
      wc_bongsau: ['Roll elbow upward and forward while relaxing wrist down.', 'Keep elbow positioned higher than wrist.', 'Pivot from waist to disperse heavy incoming straight force.'],
      wc_paksau: ['Slap incoming limb laterally using crisp palm deflection.', 'Parry just enough to clear centerline.', 'Simultaneously counter-strike straight down open gap.'],
      wc_ygkym: ['Stand with feet shoulder width and toes turned inward.', 'Clamp knees toward each other creating triangular rooting.', 'Tuck pelvis forward keeping upper body completely relaxed.'],
      wc_chisao: ['Maintain constant rolling contact with partner forearms.', 'Listen to tactile pressure changes through skin.', 'Flow into gaps whenever partner forward pressure collapses.'],
      wc_siunimtao: ['Stand motionless in YGKYM isolating upper body energy.', 'Execute third section Tan Sau with slow meditative tension.', 'Focus entirely on cultivating immovable elbow structure.'],
      wc_fakkuen: ['Whip horizontal chopping hand outward from elbow.', 'Strike with outer edge of palm toward throat.', 'Relax wrist completely until exact microsecond of impact.'],
      km_palmstrike: ['Thrust base of palm forcefully straight into attacker nose or chin.', 'Keep fingers curled back tightly to avoid jamming.', 'Follow through aggressively driving attacker backward.'],
      km_hammerfist: ['Raise clenched fist high bringing downward pounding force.', 'Strike with bottom meaty edge of fist.', 'Drop entire body weight into the strike.'],
      km_groinkick: ['Whip lead or rear shin straight upward between attacker legs.', 'Strike with instep or lower shin directly into groin.', 'Recover leg instantly to avoid being grabbed.'],
      km_360defense: ['Meet circular incoming attacks at a sharp 90-degree angle.', 'Burst forward aggressively closing distance inside strike.', 'Simultaneously deliver counter punches with free hand.'],
      km_knifedefense: ['Redirect weapon hand outward using explosive forearm parry.', 'Burst inside weapon arc controlling attacker wrist.', 'Deliver continuous combative strikes to terminate threat.'],
      km_bearhug: ['Drop center of gravity instantly widening base.', 'Create space driving violent elbow strikes into attacker ribs.', 'Turn inside hold and finish with knee strikes.'],
      km_chokedefense: ['Pluck violently outward at attacker thumbs at your throat.', 'Tuck chin deep into chest to protect airway.', 'Drive aggressive counter knee straight into midsection.'],
      km_combatives: ['Chain non-stop aggressive strikes combining elbows, palms, knees.', 'Push relentlessly forward overwhelming target.', 'Maintain fierce combative mindset breathing out sharply.'],
      hp_sonmok: ['Relax trapped wrist moving entire body around grip.', 'Trace circular escape path against attacker thumb opening.', 'Immediately apply counter wrist-lock or unbalancing pressure.'],
      hp_nakbeop: ['Tuck chin tightly avoiding head contact with mat.', 'Slap mat forcefully with palms and forearms before landing.', 'Dissipate falling momentum smoothly across rounded back.'],
      hp_deonjigi: ['Blend smoothly with advancing opponent forward momentum.', 'Step deep underneath their center lowering hips.', 'Rotate waist violently wheeling opponent over hip.'],
      hp_jointflow: ['Maintain constant pain compliance pressure on trapped joint.', 'Transition seamlessly from wrist-bend to elbow-armbar.', 'Keep posture upright and rooted during transitions.'],
      hp_spinheel: ['Drop torso slightly whipping straight leg low across floor.', 'Sweep back of heel through opponent calves or support ankle.', 'Maintain continuous momentum returning cleanly to guard.'],
      hp_kamae: ['Keep hands open and supple in circular guard.', 'Maintain weight lightly centered ready to pivot.', 'Project calm alertness inviting incoming force to be redirected.'],
      sil_kudakuda: ['Sink deep into wide low stance like a coiled tiger.', 'Keep center of gravity close to earth with spine supple.', 'Distribute weight firmly ready for sudden lunges.'],
      sil_sapu: ['Hook opponent lead ankle from outside with sole.', 'Reap leg violently backward just as opponent shifts weight.', 'Simultaneously push upper body in opposite direction.'],
      sil_sikut: ['Step in close range folding arm into tight horizontal elbow.', 'Drive tip of elbow bone like a heavy blade into target.', 'Engage core rotation to generate maximum blunt force.'],
      sil_langkah: ['Step along triangular floor patterns navigating off-line angles.', 'Glide soles lightly over mat without bouncing head level.', 'Position body outside opponent weapons corridor.'],
      sil_kuncian: ['Entangle fallen opponent limbs using leg scissors and arm wraps.', 'Pin their center of gravity immovably against ground.', 'Apply leverage against elbow or shoulder joints.'],
      sil_jurus1: ['Execute solo preset fighting sequence with rhythmic grace.', 'Transition between low evasion sweeps and explosive strikes.', 'Coordinate breathing with every sudden change in tempo.'],
      ken_men: ['Raise Shinai cleanly overhead above center line.', 'Step forward explosively delivering downward cut to helmet top.', 'Squeeze hilt with pinky and ring fingers upon crisp impact.'],
      ken_kote: ['Target opponent right wrist gauntlet with descending strike.', 'Drop blade tip quickly with concise snap of wrists.', 'Step forward sharply maintaining upright balanced posture.'],
      ken_do: ['Slice diagonally across opponent torso breastplate.', 'Step slightly off-center to right clearing blade path.', 'Draw blade cleanly through target without stopping momentum.'],
      ken_chudan: ['Position Shinai tip pointing directly at opponent throat.', 'Keep left hand centered roughly one fist from navel.', 'Project calm immovable mental presence (Kigamae).'],
      ken_fumikomi: ['Stomp lead right foot flat onto floor with resounding percussion.', 'Synchronize foot impact exactly with blade striking target.', 'Pull rear foot forward instantaneously to maintain seamless base.'],
      ken_kirikaeshi: ['Deliver continuous alternating left and right diagonal head cuts.', 'Use wide overhead shoulder motions shouting spirited Kiai.', 'Advance and retreat with smooth sliding footwork.'],
      box_jab: ['Snap lead fist straight out from guard turning palm down.', 'Keep rear hand glued firmly to jawline.', 'Retract punch along exact same linear path instantaneously.'],
      box_cross: ['Pivot rear foot and hip driving rear shoulder forward.', 'Extend rear punch straight down centerline with full reach.', 'Keep chin tucked behind lead shoulder throughout extension.'],
      box_leadhook: ['Pivot lead foot and hip whipping arm in tight 90-degree arc.', 'Keep elbow parallel to mat and torso rotating as one unit.', 'Stop punch sharply right in front of opposite jawline.'],
      box_uppercut: ['Dip slightly at knees loading weight onto support leg.', 'Drive fist straight upward launching power from hips and legs.', 'Keep free hand high protecting chin against counters.'],
      box_12combo: ['Fire crisp lead jab snapping head back.', 'Immediately follow with power cross rotating rear hip.', 'Ensure jab retracts at exact speed cross advances.'],
      box_slip: ['Slightly bend knees and waist slipping head outside punch line.', 'Let incoming punch graze harmlessly past ear.', 'Immediately load weight onto support leg to fire counter.'],
      box_bobweave: ['Bend deep at knees ducking in smooth U-shaped trajectory.', 'Slip underneath swinging hook coming up cleanly on opposite side.', 'Keep eyes on opponent and hands high at cheeks.'],
      box_pendulum: ['Bounce rhythmically forward and backward on balls of feet.', 'Maintain constant boxing stance width managing distance.', 'Stay light ready to dart in or dart out instantaneously.'],
      bjj_armbar: ['Pivot hips perpendicular trapping opponent arm between thighs.', 'Clamp knees tightly together isolating elbow joint.', 'Control wrist with thumb pointing up and lift hips.'],
      bjj_triangle: ['Shoot one leg over opponent shoulder trapping neck and one arm.', 'Lock figure-4 configuration placing shin behind opposite knee.', 'Cut angle perpendicular and pull head down to strangle.'],
      bjj_rnc: ['Slide choking forearm deep under chin from back mount.', 'Lock hands grabbing opposite biceps placing palm behind head.', 'Expand chest and squeeze elbows together.'],
      jud_osoto: ['Step outside opponent right foot pulling sleeve to chest.', 'Drive chest forward loading opponent weight onto heel.', 'Reap their right leg forcefully backward with hamstring.'],
      jud_seoi: ['Squat low turning back completely underneath opponent center.', 'Pull opponent sleeve and lapel forward loading onto back.', 'Spring legs upward extending arms to wheel over shoulder.'],
      jud_uchimata: ['Pull opponent forward and off balance onto toes.', 'Step in deep driving sweeping leg upward between thighs.', 'Tilt torso forward lifting leg high like a soaring pendulum.'],
      cap_ginga: ['Step continuously in rhythmic triangular rocking pattern.', 'Keep lead arm raised protecting face switching naturally.', 'Maintain fluid continuous motion staying light on balls of feet.'],
      cap_meialua: ['Step across planting both hands firmly onto floor.', 'Whip straight heel in rapid spinning circular trajectory.', 'Keep eyes sighted on opponent between legs throughout spin.'],
      cap_au: ['Kick legs up into fluid lateral acrobatic cartwheel.', 'Keep torso arched facing opponent throughout inverted movement.', 'Land softly in low escape stance ready to counter.'],
      sj_baoshuai: ['Change level shooting deep driving shoulder into midsection.', 'Wrap arms tightly around both thighs locking grip behind knees.', 'Drive legs forward driving opponent flat onto back.'],
      sj_gouchan: ['Hook inside of opponent lead ankle with foot.', 'Drive upper body backward while kicking heel forward.', 'Destroy vertical base with sudden shearing force.'],
      aik_tenkan: ['Blend with advancing attacker stepping off-line to outside.', 'Pivot 180 degrees on lead foot swinging rear leg around.', 'Redirect attacker forward momentum smoothly along circular arc.'],
      aik_shiho: ['Catch attacker wrist raising arm high like drawing a sword.', 'Step completely underneath raised arm pivoting hips 180 degrees.', 'Cut both hands straight down driving opponent into pin.'],
      sha_5animals: ['Adopt fierce mindset channeling Dragon, Tiger, Leopard, Snake, Crane.', 'Execute Tiger claw strikes with explosive dynamic contraction.', 'Express deep internal calm during Crane transitions.'],
      sha_ironforearm: ['Strike inner and outer forearms together in steady cadence.', 'Exhale sharply with loud Kiai upon every physical contact.', 'Gradually increase striking intensity to build Qi.'],
      san_sidekick: ['Chamber lead knee high as advancing rusher closes distance.', 'Thrust side kick straight into midsection stopping rusher dead.', 'Retract kicking leg instantly maintaining balanced guard.'],
      san_kuashuai: ['Catch incoming roundhouse kick under armpit.', 'Step deep across opponent supporting hip destroying balance.', 'Wheel torso forward dumping opponent hard onto mat.'],
      tai_cloudhands: ['Rotate waist slowly shifting weight smoothly from leg to leg.', 'Float palms across horizontal plane like drifting clouds.', 'Keep shoulders completely sunken and breath meditative.'],
      tai_fajin: ['Store internal Qi sinking weight into rooted legs like compressed spring.', 'Coordinate sudden hip rotation with explosive forward discharge.', 'Release power instantaneously through relaxed striking palms.']
    };

    extraTechs.forEach(t => {
      if (!window.EXERCISES[t.id]) {
        window.EXERCISES[t.id] = {
          id: t.id,
          name: t.name,
          category: 'technique',
          discipline: t.discipline,
          subcategory: t.subcategory,
          duration: t.duration,
          sets: 1,
          reps: null,
          description: t.description,
          instructions: customInst[t.id] || [ `Form solid structure in ${t.discipline || 'martial arts'} guard.`, `Execute ${t.name} with sharp focus.`, `Return immediately to balanced posture.` ],
          tips: t.tips,
          difficulty: t.difficulty,
          targetArea: ['martial arts', t.subcategory],
          icon: t.icon
        };
      }
    });

    if (window.EXERCISES) {
      Object.values(window.EXERCISES).forEach(ex => {
        if (ex.instructions && ex.instructions.join('').includes('Maintain proper stance and balance')) {
          ex.instructions = [ `Form solid structure in ${ex.discipline || 'martial arts'} guard.`, `Execute ${ex.name} with precise focus.`, `Return immediately to balanced posture.` ];
        }
      });
    }

    if (window.EXTRA_TECHNIQUES && window.EXERCISES) {
      window.EXTRA_TECHNIQUES.forEach(t => {
        if (!window.EXERCISES[t.id]) {
          window.EXERCISES[t.id] = t;
        }
      });
    }
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
    if (viewId === 'progress') { this.renderMasteryAnalytics(); this.renderBenchmarkForm(); this.renderBenchmarkStats(); this.renderAchievements(); }
    if (viewId === 'library') { this.initLibrary(); }
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
      heroTitle.textContent = "Training Complete ✅";
      heroBtn.textContent = "Repeat Training";
    } else {
      heroTitle.textContent = "Daily Kiai Training";
      heroBtn.textContent = "Start Training";
    }

    // Stats
    document.getElementById('dashCompleted').textContent = this.state.completedDays.length;
    const hrs = Math.floor(this.state.totalTimeSeconds / 3600);
    document.getElementById('dashTime').textContent = `${hrs}h`;
    document.getElementById('dashBadges').textContent = this.state.unlockedAchievements.length;

    // Progress Ring
    const pct = Math.round((this.state.completedDays.length / 60) * 100);
    document.getElementById('dashProgressPct').textContent = `${Math.min(100, pct)}%`;
    const ring = document.getElementById('dashProgressRing');
    const circ = 2 * Math.PI * 40;
    ring.style.strokeDasharray = circ;
    ring.style.strokeDashoffset = circ * (1 - Math.min(100, pct) / 100);

    // Dashboard Rank Display
    this.updateDashRank();

    this.rollRandomLibrary();
  },

  updateDashRank() {
    const workouts = this.state.completedDays ? this.state.completedDays.length : 0;
    let rankName = 'White Belt Initiate', beltIcon = '\u{1F331}', lvl = 1, nextReq = 3;
    let xpPct = (workouts / 3) * 100;
    if (workouts >= 30) {
      rankName = 'Grandmaster of Kiai'; beltIcon = '\u{1F409}'; lvl = 5; nextReq = 60; xpPct = 100;
    } else if (workouts >= 15) {
      rankName = 'Blue Crane Master'; beltIcon = '\u{1F985}'; lvl = 4; nextReq = 30; xpPct = ((workouts - 15) / 15) * 100;
    } else if (workouts >= 7) {
      rankName = 'Green Dragon Adept'; beltIcon = '\u{1F405}'; lvl = 3; nextReq = 15; xpPct = ((workouts - 7) / 8) * 100;
    } else if (workouts >= 3) {
      rankName = 'Yellow Belt Disciple'; beltIcon = '\u{1F94B}'; lvl = 2; nextReq = 7; xpPct = ((workouts - 3) / 4) * 100;
    }
    const iconEl = document.getElementById('dashRankIcon');
    const titleEl = document.getElementById('dashRankTitle');
    const subEl = document.getElementById('dashRankSub');
    const fillEl = document.getElementById('dashRankFill');
    if (iconEl) iconEl.textContent = beltIcon;
    if (titleEl) titleEl.textContent = rankName;
    if (subEl) subEl.textContent = workouts >= 30 ? 'Level 5 \u2022 MAX RANK' : `Level ${lvl} \u2022 ${workouts} / ${nextReq} sessions`;
    if (fillEl) fillEl.style.width = `${Math.min(100, Math.max(5, xpPct))}%`;
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

  playTransitionTone() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, this.audioCtx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.15); // A4
      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.5);
    } catch(e) {}
  },

  playTick() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.06);
    } catch(e) {}
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

  closeModal(force = true) {
    if (force === true || force === false || force === undefined || (force.target && force.target.id === 'appModal')) {
      const modalEl = document.getElementById('appModal');
      if (modalEl) modalEl.classList.remove('show');
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

    this.startProgressFlow(false);
  },

  loadStandardProgram() {
    if (!window.WORKOUTS) return;
    
    document.querySelectorAll('.seg-btn[data-gym]').forEach(b => {
      b.classList.toggle('active', b.dataset.gym === this.state.todayGymType);
    });

    const dayData = window.WORKOUTS.generateDay(this.state.currentDay);
    this.workout.data = dayData;

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
    this.workout.isCustomQueue = false;
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

  startProgressFlow(autoNav = true) {
    if (autoNav) {
      this.initAudio();
      this.navigate('workout');
    }
    document.getElementById('workout-intro').style.display = 'block';
    document.getElementById('workout-active').style.display = 'none';
    document.getElementById('workout-complete').style.display = 'none';
    
    document.getElementById('introWorkoutTitle').textContent = 'Daily Kiai Training';
    document.getElementById('introQuote').textContent = 'Deep Holds, Balance & Lower Back - 25 Mins';
    
    // Construct custom queue from PDF
    const flowData = [
      // 1. Hip Circles (30s)
      { id: 'pf_hip_circles', name: 'Hip Circles', category: 'Warm Up', duration: 30, icon: '🔄', targetArea: ['hips'], tips: 'Loosen the kua before loading it', instructions: ['Stand with feet shoulder-width apart.', 'Place hands on hips.', 'Slowly rotate your hips in a wide circle, imagining you are drawing a circle with your tailbone.', 'Switch directions halfway through.'] },
      { isRest: true, name: 'Rest — Prepare for Leg Swings', category: 'Transition', duration: 4, icon: '🧘', tips: 'Take a deep breath' },

      // 2. Leg Swings Front-Back (20s Left / 4s Switch / 20s Right)
      { id: 'pf_leg_swings_fb_l', name: 'Leg Swings (Front-Back) — Left Leg', category: 'Warm Up', duration: 20, icon: '🦵', targetArea: ['hips'], tips: 'Keep your torso upright; swing left leg smoothly', instructions: ['Balance on right leg (use a wall if needed).', 'Swing left leg forward and backward.', 'Keep swinging leg relaxed.'] },
      { isRest: true, name: 'Rest — Switch to Right Leg', category: 'Side Switch', duration: 4, icon: '🔄', tips: 'Plant left foot firmly and prepare right leg' },
      { id: 'pf_leg_swings_fb_r', name: 'Leg Swings (Front-Back) — Right Leg', category: 'Warm Up', duration: 20, icon: '🦵', targetArea: ['hips'], tips: 'Keep your torso upright; swing right leg smoothly', instructions: ['Balance on left leg.', 'Swing right leg forward and backward.', 'Keep swinging leg relaxed.'] },
      { isRest: true, name: 'Rest — Prepare for Lateral Swings', category: 'Transition', duration: 4, icon: '🧘', tips: 'Breathe smoothly' },

      // 3. Leg Swings Side-Side (20s Left / 4s Switch / 20s Right)
      { id: 'pf_leg_swings_ss_l', name: 'Leg Swings (Side-Side) — Left Leg', category: 'Warm Up', duration: 20, icon: '🦵', targetArea: ['hips'], tips: 'Allow left hip to naturally open across and out', instructions: ['Face a wall or bar holding with both hands.', 'Swing left leg across your front, then out to side.'] },
      { isRest: true, name: 'Rest — Switch to Right Leg', category: 'Side Switch', duration: 4, icon: '🔄', tips: 'Plant left foot and prepare right leg' },
      { id: 'pf_leg_swings_ss_r', name: 'Leg Swings (Side-Side) — Right Leg', category: 'Warm Up', duration: 20, icon: '🦵', targetArea: ['hips'], tips: 'Allow right hip to naturally open across and out', instructions: ['Face a wall or bar holding with both hands.', 'Swing right leg across your front, then out to side.'] },
      { isRest: true, name: 'Rest — Prepare for Ankle Rolls', category: 'Transition', duration: 4, icon: '🧘', tips: 'Relax your shoulders' },

      // 4. Ankle Rolls (20s)
      { id: 'pf_ankle_rolls', name: 'Ankle Rolls (Both Sides)', category: 'Warm Up', duration: 20, icon: '🦶', targetArea: ['ankles'], tips: 'Roll through full range of motion, 10s per ankle', instructions: ['Lift one foot slightly off ground.', 'Roll ankle in full circles.', 'Switch feet halfway.'] },
      { isRest: true, name: 'Rest — Prepare for Squat Hold', category: 'Transition', duration: 10, icon: '🧘', tips: 'Set feet slightly wider than shoulder-width' },

      // 5. Squat Hold (90s)
      { id: 'pf_squat_hold', name: 'Squat Hold (Heels Flat)', category: 'Deep Hip & Kua', duration: 90, icon: '🧘', targetArea: ['hips'], tips: 'The single best kua opener', instructions: ['Drop your hips into a deep squat.', 'Keep heels flat on floor.', 'Use elbows to gently press knees out.'] },
      { isRest: true, name: 'Rest — Prepare for Kua Circles', category: 'Transition', duration: 10, icon: '🧘', tips: 'Rise slowly to horse stance width' },

      // 6. Kua Circles (20s)
      { id: 'pf_kua_circles', name: 'Kua Circles', category: 'Deep Hip & Kua', duration: 20, icon: '🌀', targetArea: ['hips'], tips: 'Keep upper body completely still', instructions: ['Stand in a wide horse stance with knees bent softly.', 'Make small internal circles with your pelvis.'] },
      { isRest: true, name: 'Rest — Prepare for Frog Stretch', category: 'Transition', duration: 10, icon: '🧘', tips: 'Lower down gently to floor mat' },

      // 7. Frog Stretch (90s)
      { id: 'pf_frog', name: 'Frog Stretch', category: 'Deep Hip & Kua', duration: 90, icon: '🐸', targetArea: ['adductors'], tips: 'Crucial for high side kicks', instructions: ['On hands and knees, slide knees outward as far as comfortable.', 'Rest on forearms and gently press hips backward.'] },
      { isRest: true, name: 'Rest — Prepare for Cossack Hold', category: 'Transition', duration: 10, icon: '🧘', tips: 'Rise up and take a very wide stance' },

      // 8. Cossack Squat Hold (45s Left / 6s Switch / 45s Right)
      { id: 'pf_cossack_l', name: 'Cossack Squat Hold — Left Side', category: 'Deep Hip & Kua', duration: 45, icon: '🥋', targetArea: ['hips'], tips: 'Sink deep into left knee; straight right leg heel planted', instructions: ['Take a wide stance.', 'Shift weight entirely to left side, bending left knee deeply.', 'Keep right leg straight with heel flat on ground.'] },
      { isRest: true, name: 'Rest — Switch to Right Side', category: 'Side Switch', duration: 6, icon: '🔄', tips: 'Shift weight smoothly through center to right' },
      { id: 'pf_cossack_r', name: 'Cossack Squat Hold — Right Side', category: 'Deep Hip & Kua', duration: 45, icon: '🥋', targetArea: ['hips'], tips: 'Sink deep into right knee; straight left leg heel planted', instructions: ['Take a wide stance.', 'Shift weight entirely to right side, bending right knee deeply.', 'Keep left leg straight with heel flat on ground.'] },
      { isRest: true, name: 'Rest — Prepare for Pigeon Pose', category: 'Transition', duration: 10, icon: '🧘', tips: 'Transition down to plank position' },

      // 9. Pigeon Pose (35s Left / 6s Switch / 35s Right)
      { id: 'pf_pigeon_l', name: 'Pigeon Pose — Left Leg Forward', category: 'Posterior Chain & Kick Range', duration: 35, icon: '🐦', targetArea: ['hips'], tips: 'Keep hips completely square to floor over left shin', instructions: ['Bring left knee forward behind left wrist across mat.', 'Extend right leg straight back.', 'Lower upper body down over front leg.'] },
      { isRest: true, name: 'Rest — Switch to Right Leg Forward', category: 'Side Switch', duration: 6, icon: '🔄', tips: 'Step back to plank and bring right shin forward' },
      { id: 'pf_pigeon_r', name: 'Pigeon Pose — Right Leg Forward', category: 'Posterior Chain & Kick Range', duration: 35, icon: '🐦', targetArea: ['hips'], tips: 'Keep hips completely square to floor over right shin', instructions: ['Bring right knee forward behind right wrist across mat.', 'Extend left leg straight back.', 'Lower upper body down over front leg.'] },
      { isRest: true, name: 'Rest — Prepare for Standing Hamstring', category: 'Transition', duration: 10, icon: '🧘', tips: 'Rise up and find an elevated step or chair' },

      // 10. Deep Standing Hamstring (60s Left / 6s Switch / 60s Right)
      { id: 'pf_deep_ham_l', name: 'Deep Standing Hamstring — Left Leg', category: 'Posterior Chain & Kick Range', duration: 60, icon: '🧍', targetArea: ['hamstrings'], tips: 'Hinge forward at hips over straight left leg', instructions: ['Place left heel on elevated surface with leg straight.', 'Hinge forward from hips, keeping back flat.', 'Reach toward left toes.'] },
      { isRest: true, name: 'Rest — Switch to Right Leg', category: 'Side Switch', duration: 6, icon: '🔄', tips: 'Switch feet on elevated surface' },
      { id: 'pf_deep_ham_r', name: 'Deep Standing Hamstring — Right Leg', category: 'Posterior Chain & Kick Range', duration: 60, icon: '🧍', targetArea: ['hamstrings'], tips: 'Hinge forward at hips over straight right leg', instructions: ['Place right heel on elevated surface with leg straight.', 'Hinge forward from hips, keeping back flat.', 'Reach toward right toes.'] },
      { isRest: true, name: 'Rest — Prepare for Pancake Stretch', category: 'Transition', duration: 10, icon: '🧘', tips: 'Sit on floor mat in wide straddle' },

      // 11. Pancake Stretch (60s)
      { id: 'pf_pancake', name: 'Pancake Stretch', category: 'Posterior Chain & Kick Range', duration: 60, icon: '🥞', targetArea: ['hips', 'hamstrings'], tips: 'Rotate pelvis forward (anterior pelvic tilt)', instructions: ['Sit on floor with legs wide in straddle.', 'Engage quads to keep legs straight.', 'Crawl hands forward aiming chest to floor.'] },
      { isRest: true, name: 'Rest — Prepare for Bow Stance', category: 'Transition', duration: 10, icon: '🧘', tips: 'Rise up to lunging Gong Bu stance' },

      // 12. Bow Stance Hold (60s Left / 6s Switch / 60s Right)
      { id: 'pf_bow_hold_l', name: 'Bow Stance Hold — Left Leg Forward', category: 'Stance Depth', duration: 60, icon: '🏹', targetArea: ['legs'], trackType: 'stance', tips: 'Left thigh parallel to floor; right back leg locked straight', instructions: ['Step left foot forward into deep lunge.', 'Bend left knee to 90 degrees.', 'Lock right back leg perfectly straight.'] },
      { isRest: true, name: 'Rest — Switch to Right Leg Forward', category: 'Side Switch', duration: 6, icon: '🔄', tips: 'Pivot smoothly to face opposite direction' },
      { id: 'pf_bow_hold_r', name: 'Bow Stance Hold — Right Leg Forward', category: 'Stance Depth', duration: 60, icon: '🏹', targetArea: ['legs'], trackType: 'stance', tips: 'Right thigh parallel to floor; left back leg locked straight', instructions: ['Step right foot forward into deep lunge.', 'Bend right knee to 90 degrees.', 'Lock left back leg perfectly straight.'] },
      { isRest: true, name: 'Rest — Prepare for Horse Stance', category: 'Transition', duration: 10, icon: '🧘', tips: 'Step out into very wide horse stance' },

      // 13. Horse Stance Hold (90s)
      { id: 'pf_horse_hold', name: 'Horse Stance Hold (Deep)', category: 'Stance Depth', duration: 90, icon: '🐎', targetArea: ['legs'], trackType: 'stance', tips: 'Thighs must be perfectly parallel to floor', instructions: ['Wide stance with toes pointing forward.', 'Drop hips straight down until thighs parallel floor.', 'Keep back straight and push knees out.'] },
      { isRest: true, name: 'Rest — Prepare for Wall Calf Stretch', category: 'Transition', duration: 10, icon: '🧘', tips: 'Shake out legs and face a wall' },

      // 14. Wall Calf Stretch (30s Left / 6s Switch / 30s Right)
      { id: 'pf_calf_l', name: 'Wall Calf Stretch — Left Calf', category: 'Stance Depth', duration: 30, icon: '🧱', targetArea: ['calves'], tips: 'Step left foot far back with heel pressed down', instructions: ['Face wall with hands supporting.', 'Step left foot far back, pressing heel firmly into floor.', 'Lean weight forward into wall.'] },
      { isRest: true, name: 'Rest — Switch to Right Calf', category: 'Side Switch', duration: 6, icon: '🔄', tips: 'Step left foot forward and right foot far back' },
      { id: 'pf_calf_r', name: 'Wall Calf Stretch — Right Calf', category: 'Stance Depth', duration: 30, icon: '🧱', targetArea: ['calves'], tips: 'Step right foot far back with heel pressed down', instructions: ['Face wall with hands supporting.', 'Step right foot far back, pressing heel firmly into floor.', 'Lean weight forward into wall.'] },
      { isRest: true, name: 'Rest — Prepare for Eyes-Closed Kicking', category: 'Transition', duration: 10, icon: '🧘', tips: 'Find balance on flat floor' },

      // 15. Slow Motion Kicking (Eyes Closed) (45s Left / 6s Switch / 45s Right)
      { id: 'pf_slow_kick_l', name: 'Slow-Motion Kicking (Eyes Closed) — Left Leg', category: 'Balance & Stability', duration: 45, icon: '🦿', targetArea: ['balance', 'legs'], trackType: 'stability', tips: 'CLOSE YOUR EYES. Take 10s per slow kick cycle', instructions: ['Stand firmly on right leg.', 'Close your eyes completely to challenge internal proprioception.', 'Take 3s to lift left knee, 4s to slowly extend kick, 3s to retract.'] },
      { isRest: true, name: 'Rest — Switch to Right Leg', category: 'Side Switch', duration: 6, icon: '🔄', tips: 'Open eyes briefly, plant left foot, close eyes' },
      { id: 'pf_slow_kick_r', name: 'Slow-Motion Kicking (Eyes Closed) — Right Leg', category: 'Balance & Stability', duration: 45, icon: '🦿', targetArea: ['balance', 'legs'], trackType: 'stability', tips: 'CLOSE YOUR EYES. Take 10s per slow kick cycle', instructions: ['Stand firmly on left leg.', 'Close your eyes completely.', 'Take 3s to lift right knee, 4s to slowly extend kick, 3s to retract.'] },
      { isRest: true, name: 'Rest — Prepare for Weight Shifts', category: 'Transition', duration: 10, icon: '🧘', tips: 'Step into deep horse stance' },

      // 16. Weight Shifts in Horse Stance (30s)
      { id: 'pf_weight_shift', name: 'Weight Shifts in Horse Stance', category: 'Balance & Stability', duration: 30, icon: '⚖️', targetArea: ['legs', 'balance'], tips: 'Keep head at exactly same altitude', instructions: ['Sink into deep horse stance.', 'Shift weight entirely to left leg straightening right leg.', 'Smoothly shift back through center over to right leg.'] },
      { isRest: true, name: 'Rest — Prepare for Cat-Cow', category: 'Transition', duration: 10, icon: '🧘', tips: 'Lower down to all fours on mat' },

      // 17. Cat-Cow (45s)
      { id: 'pf_cat_cow', name: 'Cat-Cow', category: 'Lower Back', duration: 45, icon: '🐈', targetArea: ['spine'], tips: 'Move vertebrae by vertebrae', instructions: ['On all fours, inhale arching back (Cow).', 'Exhale rounding spine to ceiling (Cat).'] },
      { isRest: true, name: 'Rest — Prepare for Knee to Chest', category: 'Transition', duration: 10, icon: '🧘', tips: 'Roll over flat onto your back' },

      // 18. Knee to Chest Stretch (30s Left / 6s Switch / 30s Right)
      { id: 'pf_knee_chest_l', name: 'Knee to Chest — Left Knee', category: 'Lower Back', duration: 30, icon: '🦵', targetArea: ['lower back'], tips: 'Pull left knee tight; actively press right leg flat to floor', instructions: ['Lie on back.', 'Pull left knee to chest with clasped hands.', 'Keep right leg pressed straight down against mat.'] },
      { isRest: true, name: 'Rest — Switch to Right Knee', category: 'Side Switch', duration: 6, icon: '🔄', tips: 'Extend left leg flat down and lift right knee' },
      { id: 'pf_knee_chest_r', name: 'Knee to Chest — Right Knee', category: 'Lower Back', duration: 30, icon: '🦵', targetArea: ['lower back'], tips: 'Pull right knee tight; actively press left leg flat to floor', instructions: ['Lie on back.', 'Pull right knee to chest with clasped hands.', 'Keep left leg pressed straight down against mat.'] },
      { isRest: true, name: 'Rest — Prepare for Thread the Needle', category: 'Transition', duration: 10, icon: '🧘', tips: 'Roll up to all fours position' },

      // 19. Thread the Needle (30s Left / 6s Switch / 30s Right)
      { id: 'pf_thread_needle_l', name: 'Thread the Needle — Reach Left Arm', category: 'Spine, Shoulders & Cool Down', duration: 30, icon: '🪡', targetArea: ['shoulders', 'spine'], tips: 'Reach left arm under body across to right side floor', instructions: ['On all fours, reach left arm underneath torso to right side.', 'Rest left shoulder and head on floor.'] },
      { isRest: true, name: 'Rest — Switch to Reach Right Arm', category: 'Side Switch', duration: 6, icon: '🔄', tips: 'Return to all fours and prepare right arm' },
      { id: 'pf_thread_needle_r', name: 'Thread the Needle — Reach Right Arm', category: 'Spine, Shoulders & Cool Down', duration: 30, icon: '🪡', targetArea: ['shoulders', 'spine'], tips: 'Reach right arm under body across to left side floor', instructions: ['On all fours, reach right arm underneath torso to left side.', 'Rest right shoulder and head on floor.'] },
      { isRest: true, name: 'Rest — Prepare for Doorway Chest Opener', category: 'Transition', duration: 4, icon: '🧘', tips: 'Stand up and walk to a doorway' },

      // 20. Doorway Chest Opener (20s Left / 4s Switch / 20s Right)
      { id: 'pf_chest_open_l', name: 'Doorway Chest Opener — Left Arm', category: 'Spine, Shoulders & Cool Down', duration: 20, icon: '🚪', targetArea: ['chest', 'shoulders'], tips: 'Place left forearm on doorframe and turn chest away', instructions: ['Rest left forearm against doorframe at shoulder height.', 'Gently turn chest away until deep pectoral stretch is felt.'] },
      { isRest: true, name: 'Rest — Switch to Right Arm', category: 'Side Switch', duration: 4, icon: '🔄', tips: 'Turn around and place right forearm on doorframe' },
      { id: 'pf_chest_open_r', name: 'Doorway Chest Opener — Right Arm', category: 'Spine, Shoulders & Cool Down', duration: 20, icon: '🚪', targetArea: ['chest', 'shoulders'], tips: 'Place right forearm on doorframe and turn chest away', instructions: ['Rest right forearm against doorframe at shoulder height.', 'Gently turn chest away until deep pectoral stretch is felt.'] },
      { isRest: true, name: 'Rest — Prepare for Final Breathing', category: 'Transition', duration: 4, icon: '🧘', tips: 'Step away from door and stand centered' },

      // 21. Deep Breathing Reset (20s)
      { id: 'pf_breathing', name: 'Deep Breathing Reset', category: 'Spine, Shoulders & Cool Down', duration: 20, icon: '🫁', targetArea: ['lungs', 'mind'], tips: 'Expand stomach on inhale (4s), slow exhale (6s)', instructions: ['Hand on lower belly (Dantian).', 'Inhale deeply through nose 4s.', 'Exhale slowly through mouth 6s.'] }
    ];
    
    this.workout.queue = flowData.map(ex => ({
      sectionTitle: ex.category,
      duration: ex.duration,
      isRest: ex.isRest || false,
      trackType: ex.trackType || null,
      fullEx: {
        name: ex.name,
        duration: ex.duration,
        description: ex.isRest ? 'Transition & Setup' : ex.category,
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
      if (!item.isRest) {
        sectionCounts[item.sectionTitle] = (sectionCounts[item.sectionTitle] || 0) + 1;
      }
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
    this.workout.elapsedMs = 0;
    this.workout.totalDuration = this.workout.queue.reduce((acc, curr) => acc + (curr.duration || curr.fullEx.duration), 0);
    this.workout.totalDurationMs = this.workout.totalDuration * 1000;
    
    this.renderCurrentExercise(true); // Auto-start the first exercise
  },

  renderCurrentExercise(autoStart = false) {
    if (this.workout.currentIndex >= this.workout.queue.length) {
      this.finishWorkout();
      return;
    }

    const item = this.workout.queue[this.workout.currentIndex];
    const baseDur = item.duration || item.fullEx.duration;
    const dur = item.isRest ? baseDur : Math.max(1, Math.round(baseDur * (this.state.durationMultiplier || 1.0)));
    if (item.isRest) this.playTransitionTone();
    
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
    
    this.workout.currentDur = dur;
    this.workout.timeRemaining = dur;
    this.workout.timeRemainingMs = dur * 1000;
    this.workout.lastDisplayedSec = dur;
    this.updateTimerUI();
    
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.fullEx.name,
        artist: 'Daily Kiai Training',
        album: `${dur}s Focus`
      });
    }
    
    // Play button state
    this.workout.isRunning = false;
    document.getElementById('playPauseBtn').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    
    const trackerContainer = document.getElementById('performanceTrackerContainer');
    if (trackerContainer) {
      if (item.trackType === 'stance') {
        const loggedVal = (this.workout.performanceLogs && this.workout.performanceLogs[item.fullEx.name]) || '0';
        trackerContainer.innerHTML = `
          <div class="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left animate-fade-in">
            <label class="block text-amber-400 font-semibold text-xs uppercase tracking-wider mb-2">🔥 Stance Tracker — Performance Log:</label>
            <select class="w-full bg-black/80 text-white border border-white/20 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 cursor-pointer" onchange="App.logPerformance('${item.fullEx.name.replace(/'/g, "\\'")}', this.value)">
              <option value="0" ${loggedVal === '0' ? 'selected' : ''}>✨ 0 fails (Held unbroken! Pure Kiai)</option>
              <option value="1" ${loggedVal === '1' ? 'selected' : ''}>1 time failed / stood up</option>
              <option value="2" ${loggedVal === '2' ? 'selected' : ''}>2 times failed / stood up</option>
              <option value="3+" ${loggedVal === '3+' ? 'selected' : ''}>3+ times failed / stood up</option>
            </select>
          </div>
        `;
      } else if (item.trackType === 'stability') {
        const loggedVal = (this.workout.performanceLogs && this.workout.performanceLogs[item.fullEx.name]) || '0';
        trackerContainer.innerHTML = `
          <div class="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-left animate-fade-in">
            <label class="block text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-2">🦿 Balance Tracker — Performance Log:</label>
            <select class="w-full bg-black/80 text-white border border-white/20 rounded-lg p-2.5 text-sm outline-none focus:border-cyan-500 cursor-pointer" onchange="App.logPerformance('${item.fullEx.name.replace(/'/g, "\\'")}', this.value)">
              <option value="0" ${loggedVal === '0' ? 'selected' : ''}>✨ 0 fails (Rock solid balance!)</option>
              <option value="1" ${loggedVal === '1' ? 'selected' : ''}>1 time touched down</option>
              <option value="2" ${loggedVal === '2' ? 'selected' : ''}>2 times touched down</option>
              <option value="3+" ${loggedVal === '3+' ? 'selected' : ''}>3+ times touched down</option>
            </select>
          </div>
        `;
      } else {
        trackerContainer.innerHTML = '';
      }
    }

    this.renderUpNext();

    if (autoStart) {
      this.toggleTimer();
    }
  },

  logPerformance(exName, val) {
    if (!this.workout.performanceLogs) this.workout.performanceLogs = {};
    this.workout.performanceLogs[exName] = val;
  },

  renderUpNext() {
    const list = document.getElementById('upNextList');
    let html = '';
    let count = 0;
    for (let i = this.workout.currentIndex + 1; i < this.workout.queue.length && count < 3; i++) {
      const it = this.workout.queue[i];
      if (it.isRest) continue;
      count++;
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
      if (this.workout.timer) clearInterval(this.workout.timer);
      this.workout.timer = null;
      this.workout.isRunning = false;
      document.getElementById('playPauseBtn').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
      const keeper = document.getElementById('bgSleepKeeper');
      if (keeper) keeper.pause();
    } else {
      if (this.workout.timer) clearInterval(this.workout.timer);
      this.workout.isRunning = true;
      document.getElementById('playPauseBtn').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
      const keeper = document.getElementById('bgSleepKeeper');
      if (keeper) keeper.play().catch(e => console.log('Keep-alive audio error:', e));
      
      this.workout.timer = setInterval(() => {
        this.workout.timeRemainingMs -= 100;
        this.workout.elapsedMs = (this.workout.elapsedMs || 0) + 100;
        this.workout.timeRemaining = Math.max(0, Math.ceil(this.workout.timeRemainingMs / 1000));
        this.workout.elapsed = Math.floor(this.workout.elapsedMs / 1000);
        this.updateTimerUI();
        
        // Progress bar
        const pct = (this.workout.elapsed / (this.workout.totalDuration || 1)) * 100;
        const progEl = document.getElementById('playerTotalProgress');
        if (progEl) progEl.style.width = `${pct}%`;

        const currentSec = this.workout.timeRemaining;
        if (currentSec !== this.workout.lastDisplayedSec) {
          if (currentSec <= 3 && currentSec > 0) {
            this.playTick();
          }
          this.workout.lastDisplayedSec = currentSec;
        }

        if (this.workout.timeRemainingMs <= 0) {
          const nextItem = this.workout.queue[this.workout.currentIndex + 1];
          if (!nextItem || !nextItem.isRest) {
            this.playChime();
          }
          this.skipExercise();
          return;
        }
      }, 100);
    }
  },

  updateTimerUI() {
    const dur = this.workout.currentDur || 1;
    const remMs = this.workout.timeRemainingMs !== undefined ? this.workout.timeRemainingMs : dur * 1000;
    const t = Math.max(0, Math.ceil(remMs / 1000));
    const m = Math.floor(t / 60);
    const s = t % 60;
    const clk = document.getElementById('timerClock');
    if (clk) clk.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    
    const ring = document.getElementById('timerRing');
    if (ring) {
      const circ = 565; // 2 * PI * 90
      const progressRatio = Math.max(0, Math.min(1, remMs / (dur * 1000)));
      ring.style.strokeDashoffset = circ * (1 - progressRatio);
    }
  },

  skipExercise() {
    const wasRunning = this.workout.isRunning;
    if (this.workout.timer) clearInterval(this.workout.timer);
    this.workout.timer = null;
    this.workout.currentIndex++;
    this.renderCurrentExercise(wasRunning || (this.workout.timeRemainingMs !== undefined && this.workout.timeRemainingMs <= 0)); // If finished naturally, auto-play next
  },

  prevExercise() {
    const wasRunning = this.workout.isRunning;
    if (this.workout.timer) clearInterval(this.workout.timer);
    this.workout.timer = null;
    if (this.workout.currentIndex > 0) this.workout.currentIndex--;
    this.renderCurrentExercise(wasRunning);
  },

  finishWorkout() {
    this.workout.isRunning = false;
    if (this.workout.timer) clearInterval(this.workout.timer);
    this.workout.timer = null;
    const keeper = document.getElementById('bgSleepKeeper');
    if (keeper) keeper.pause();
    
    document.getElementById('workout-active').style.display = 'none';
    document.getElementById('workout-complete').style.display = 'block';
    
    const timeSpent = Math.floor(this.workout.elapsed / 60);
    document.getElementById('cTime').textContent = `${timeSpent}m`;
    document.getElementById('cEx').textContent = this.workout.queue.filter(it => !it.isRest).length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (!this.state.completedDays.includes(todayStr)) {
      this.state.completedDays.push(todayStr);
      this.updateStreak(todayStr);
    }
    
    document.getElementById('cStreak').textContent = this.state.streak;
    this.state.totalTimeSeconds += this.workout.elapsed;
    this.saveState();
    this.checkAchievements();

    const perfContainer = document.getElementById('performanceSummaryContainer');
    if (perfContainer) {
      const logs = this.workout.performanceLogs || {};
      const keys = Object.keys(logs);
      if (keys.length > 0) {
        keys.forEach(k => {
          if (logs[k] === '0') {
            if (k.includes('Stance')) this.state.masteryStances = (this.state.masteryStances || 0) + 1;
            if (k.includes('Kicking')) this.state.masteryBalance = (this.state.masteryBalance || 0) + 1;
          }
        });

        perfContainer.innerHTML = `
          <div class="glass-card p-6 border border-amber-500/30 rounded-2xl bg-black/40 mt-6">
            <h3 class="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">🏆 Stance & Stability Summary</h3>
            <div class="flex flex-col gap-2.5">
              ` + keys.map(k => `
                <div class="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                  <span class="text-white font-medium">${k}</span>
                  <span class="badge ${logs[k] === '0' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-amber-500 text-amber-400 bg-amber-500/10'} px-3 py-1 rounded-full text-xs">
                    ${logs[k] === '0' ? '✨ Unbroken (0 fails)!' : `${logs[k]} fail(s)`}
                  </span>
                </div>
              `).join('') + `
            </div>
          </div>
        `;
      } else {
        perfContainer.innerHTML = '';
      }
    }
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
  renderMasteryAnalytics() {
    const workouts = this.state.completedDays ? this.state.completedDays.length : 0;
    let rankName = 'White Belt Initiate';
    let beltIcon = '🌱';
    let lvl = 1;
    let nextReq = 3;
    let xpPct = (workouts / 3) * 100;

    if (workouts >= 30) {
      rankName = 'Grandmaster of Kiai'; beltIcon = '🐉'; lvl = 5; nextReq = 60; xpPct = 100;
    } else if (workouts >= 15) {
      rankName = 'Blue Crane Master'; beltIcon = '🦅'; lvl = 4; nextReq = 30; xpPct = ((workouts - 15) / 15) * 100;
    } else if (workouts >= 7) {
      rankName = 'Green Dragon Adept'; beltIcon = '🐅'; lvl = 3; nextReq = 15; xpPct = ((workouts - 7) / 8) * 100;
    } else if (workouts >= 3) {
      rankName = 'Yellow Belt Disciple'; beltIcon = '🥋'; lvl = 2; nextReq = 7; xpPct = ((workouts - 3) / 4) * 100;
    }

    const beltEl = document.getElementById('progBeltTitle');
    if (beltEl) beltEl.textContent = rankName;
    const iconEl = document.getElementById('progBeltIcon');
    if (iconEl) iconEl.textContent = beltIcon;
    const lvlEl = document.getElementById('progLevelNum');
    if (lvlEl) lvlEl.textContent = lvl;
    const xpText = document.getElementById('progXpText');
    if (xpText) xpText.textContent = workouts >= 30 ? 'MAX LEVEL UNLOCKED' : `${workouts} / ${nextReq} Sessions`;
    const xpFill = document.getElementById('progXpFill');
    if (xpFill) xpFill.style.width = `${Math.min(100, Math.max(5, xpPct))}%`;

    const pureSt = document.getElementById('statPureStances');
    if (pureSt) pureSt.textContent = this.state.masteryStances || 0;
    const pureBal = document.getElementById('statPureBalance');
    if (pureBal) pureBal.textContent = this.state.masteryBalance || 0;
    const totMins = document.getElementById('statTotalMins');
    if (totMins) totMins.textContent = `${Math.floor((this.state.totalTimeSeconds || 0) / 60)}m`;
    const strDays = document.getElementById('statStreakDays');
    if (strDays) strDays.textContent = this.state.streak || 0;

    // Solo Technique Repertoire Analytics
    const sSess = document.getElementById('progSoloSessions');
    if (sSess) sSess.textContent = this.state.soloPracticesCompleted || 0;
    const sUniq = document.getElementById('progSoloUnique');
    if (sUniq) sUniq.textContent = (this.state.soloMasteredTechs || []).length;
    const sFlaw = document.getElementById('progSoloFlawless');
    if (sFlaw) sFlaw.textContent = this.state.soloCleanForms || 0;
    const sStr = document.getElementById('progSoloStrikes');
    if (sStr) sStr.textContent = this.state.soloTotalReps || 0;

    const bList = document.getElementById('progSoloBadgeList');
    if (bList) {
      const mastered = this.state.soloMasteredTechs || [];
      if (mastered.length > 0) {
        bList.innerHTML = mastered.map(id => {
          const ex = window.EXERCISES?.[id];
          return `<span class="badge" style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.35); color:#fef08a; padding:0.25rem 0.65rem; border-radius:6px; font-size:0.75rem; font-weight:600; display:inline-flex; align-items:center; gap:4px;">${ex?.icon || '🥋'} ${ex?.name || id}</span>`;
        }).join('');
      } else {
        bList.innerHTML = `<span class="text-xs text-muted italic">No solo moves mastered yet. Launch studio to earn badges!</span>`;
      }
    }

    const uCount = document.getElementById('unlockedCount');
    if (uCount && window.ACHIEVEMENTS) uCount.textContent = this.state.unlockedAchievements ? this.state.unlockedAchievements.length : 0;
  },

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
  _currentSubcat: 'all',
  _currentLibTab: 'arts',

  initLibrary() {
    this.setLibraryTab('arts');
  },

  setLibraryTab(tab) {
    this._currentLibTab = tab;
    ['lib-arts', 'lib-art-detail', 'lib-techniques', 'lib-knowledge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.querySelectorAll('#libraryTabs .library-tab-btn').forEach(b => {
      b.classList.remove('active');
    });
    const tabs = document.querySelectorAll('#libraryTabs .library-tab-btn');
    if (tab === 'arts') {
      document.getElementById('lib-arts').style.display = 'block';
      if (tabs[0]) tabs[0].classList.add('active');
      this.renderLibraryArts();
    } else if (tab === 'techniques') {
      document.getElementById('lib-techniques').style.display = 'block';
      if (tabs[1]) tabs[1].classList.add('active');
      this.populateDisciplineDropdown();
      this.filterTechniquesBySubcat('all');
    } else if (tab === 'knowledge') {
      document.getElementById('lib-knowledge').style.display = 'block';
      if (tabs[2]) tabs[2].classList.add('active');
      this.renderKnowledge();
    }
    // Clear search
    const searchInput = document.getElementById('librarySearchInput');
    if (searchInput) searchInput.value = '';
  },

  renderLibraryArts(filterQuery) {
    if (!window.MARTIAL_ARTS) return;
    const grid = document.getElementById('artsGrid');
    let arts = Object.values(window.MARTIAL_ARTS);
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      arts = arts.filter(a => a.name.toLowerCase().includes(q) || a.origin.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q)));
    }
    if (arts.length === 0) {
      grid.innerHTML = '<div class="library-empty"><div class="library-empty-icon">🔍</div><div class="library-empty-text">No martial arts found</div></div>';
      return;
    }
    // Count techniques per discipline
    const techCounts = {};
    if (window.EXERCISES) {
      Object.values(window.EXERCISES).forEach(ex => {
        if (ex.category === 'technique') techCounts[ex.discipline] = (techCounts[ex.discipline] || 0) + 1;
      });
    }
    grid.innerHTML = arts.map(art => {
      const typeColors = { striking: '#ef4444', grappling: '#3b82f6', hybrid: '#8b5cf6', weapons: '#f59e0b', internal: '#10b981' };
      const tc = typeColors[art.type] || '#888';
      const count = techCounts[art.id] || 0;
      return `
        <div class="art-card" onclick="App.openArtDetail('${art.id}')" style="border-color: ${art.color}20;">
          <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:${art.color};border-radius:4px 0 0 4px;"></div>
          <div class="art-card-header">
            <div class="art-card-icon" style="border-color: ${art.color}40;">${art.icon}</div>
            <div class="art-card-info">
              <div class="art-card-name">${art.name}</div>
              <div class="art-card-origin">${art.origin ? art.origin.split('—')[0].replace('🌍','').trim() : ''}</div>
            </div>
          </div>
          <div class="art-card-footer">
            <span class="art-type-badge" style="color: ${tc}; border-color: ${tc}40; background: ${tc}15;">${art.type}</span>
            <span class="meta-badge">${count} techniques</span>
            ${art.weapons && art.weapons.length > 0 ? `<span class="meta-badge">\u2694\ufe0f ${art.weapons.length} weapons</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  openArtDetail(artId) {
    if (!window.MARTIAL_ARTS) return;
    const art = window.MARTIAL_ARTS[artId];
    if (!art) return;
    document.getElementById('lib-arts').style.display = 'none';
    document.getElementById('lib-art-detail').style.display = 'block';

    const techniques = window.EXERCISES ? Object.values(window.EXERCISES).filter(ex => ex.category === 'technique' && ex.discipline === artId) : [];
    const container = document.getElementById('artDetailContent');

    container.innerHTML = `
      <div class="art-detail-view">
        <button class="art-detail-back" onclick="App.setLibraryTab('arts')">&larr; Back to Martial Arts Catalog</button>
        
        <!-- Hero Header -->
        <div class="art-detail-header" style="background: linear-gradient(135deg, ${art.color}35 0%, ${art.color}08 100%); border: 1px solid ${art.color}50; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <div class="art-detail-title-row" style="display:flex; align-items:center; gap: 1.2rem;">
            <div class="art-detail-icon" style="font-size: 3.2rem; background: rgba(0,0,0,0.3); width: 80px; height: 80px; display:flex; align-items:center; justify-content:center; border-radius: 20px; border: 2px solid ${art.color}60;">${art.icon}</div>
            <div>
              <div class="art-detail-name" style="font-size: 1.8rem; font-weight: 800; color: #fff;">${art.name}</div>
              <div class="art-detail-origin" style="color: ${art.color}; font-weight: 600; font-size: 0.9rem; margin-top: 0.2rem;">${art.origin ? art.origin.split('—')[0] : ''} • <span style="text-transform: uppercase;">${art.type}</span></div>
            </div>
          </div>
        </div>

        <!-- 1. Origin, Development & History -->
        <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.5rem; margin-bottom: 1.25rem;">
          <div class="art-section-title" style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 1rem; display:flex; align-items:center; gap:0.5rem;">🌍 Origin, Historical Development & Modern Application</div>
          
          ${art.origin ? `
            <div style="margin-bottom: 1.2rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:${art.color}; font-weight:800; letter-spacing:0.06em; margin-bottom:0.35rem;">📍 Geographic & Cultural Origin</div>
              <div style="font-size: 0.9rem; color: #e2e8f0; line-height: 1.8;">
                ${art.origin.split('\n\n').map(p => `<p style="margin-bottom: 0.75rem; margin-top:0;">${p}</p>`).join('')}
              </div>
            </div>
          ` : ''}

          ${art.history ? `
            <div style="margin-bottom: 1.2rem; padding-top: 1.1rem; border-top: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size:0.75rem; text-transform:uppercase; color:#38bdf8; font-weight:800; letter-spacing:0.06em; margin-bottom:0.35rem;">📜 Historical Lineage & Evolution</div>
              <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.8;">
                ${art.history.split('\n\n').map(p => `<p style="margin-bottom: 0.75rem; margin-top:0;">${p}</p>`).join('')}
              </div>
            </div>
          ` : ''}

          ${art.description ? `
            <div style="margin-bottom: 1.2rem; padding-top: 1.1rem; border-top: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size:0.75rem; text-transform:uppercase; color:#f43f5e; font-weight:800; letter-spacing:0.06em; margin-bottom:0.35rem;">🥊 Combat Philosophy & Modern Practice</div>
              <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.8;">
                ${art.description.split('\n\n').map(p => `<p style="margin-bottom: 0.75rem; margin-top:0;">${p}</p>`).join('')}
              </div>
            </div>
          ` : ''}

          ${art.purpose ? `
            <div style="background: rgba(255,255,255,0.03); padding: 0.9rem; border-left: 3px solid ${art.color}; border-radius: 8px; margin-top: 0.5rem;">
              <strong style="color:#fff; font-size:0.88rem;">Primary Purpose 🎯:</strong> <span style="color:var(--text-muted); font-size: 0.86rem; line-height: 1.6;">${art.purpose}</span>
            </div>
          ` : ''}
        </div>

        <!-- 2. Core Philosophy & Principles -->
        ${art.corePrinciples && art.corePrinciples.length > 0 ? `
          <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div class="art-section-title" style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">🧠 Core Philosophy & Principles</div>
            <div class="art-traits-list" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
              ${art.corePrinciples.map(p => `
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 0.75rem; display:flex; align-items:flex-start; gap:0.6rem;">
                  <span style="color:${art.color}; font-weight:bold;">❖</span>
                  <span style="font-size: 0.83rem; color: #e2e8f0; line-height:1.4;">${p}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 3. Combat Effectiveness Grid -->
        ${art.effectiveness ? `
          <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div class="art-section-title" style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">⚔️ Combat Effectiveness & Fitness Profile</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.8rem;">
              <div style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 10px; padding: 0.9rem;">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#E74C3C; font-weight:700;">🛡️ Street Self-Defense</div>
                <div style="font-size: 0.84rem; color:#fff; margin-top:0.3rem;">${art.effectiveness.selfDefense || art.effectiveness.street || 'High'}</div>
              </div>
              <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); border-radius: 10px; padding: 0.9rem;">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#2ECC71; font-weight:700;">🥊 Modern MMA Translation</div>
                <div style="font-size: 0.84rem; color:#fff; margin-top:0.3rem;">${art.effectiveness.mma || 'High'}</div>
              </div>
              <div style="background: rgba(241, 196, 15, 0.1); border: 1px solid rgba(241, 196, 15, 0.3); border-radius: 10px; padding: 0.9rem;">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#F1C40F; font-weight:700;">💪 Physical Fitness Conditioning</div>
                <div style="font-size: 0.84rem; color:#fff; margin-top:0.3rem;">${art.effectiveness.fitness || 'Elite'}</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 4. Technique Repertoire Overview -->
        ${art.techniquesOverview ? `
          <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div class="art-section-title" style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">🥋 Technical Arsenal Breakdown</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem;">
              ${Object.entries(art.techniquesOverview).map(([key, val]) => val ? `
                <div style="background:rgba(0,0,0,0.2); border-left:3px solid ${art.color}; padding:0.7rem; border-radius:4px;">
                  <span style="font-size:0.75rem; text-transform:uppercase; color:${art.color}; font-weight:bold;">${key}</span>
                  <p style="font-size:0.82rem; color:#cbd5e1; margin-top:0.2rem; line-height:1.4;">${val}</p>
                </div>
              ` : '').join('')}
            </div>
          </div>
        ` : ''}

        <!-- 5. Live Practice Hub Techniques -->
        <div class="art-section" style="background: linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(0,0,0,0.3) 100%); border: 1px solid rgba(212,175,55,0.35); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div class="art-section-title" style="font-size: 1.15rem; font-weight: 800; color: #FFD700; margin-bottom: 0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <span>⚔️ Interactive Technique Practice (${techniques.length})</span>
            <span style="font-size:0.75rem; font-weight:normal; color:#cbd5e1;">Click any move to launch Live Practice Hub</span>
          </div>
          ${techniques.length > 0 ? `
            <div class="art-tech-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:0.75rem;">
              ${techniques.map(t => `
                <div class="art-tech-item" onclick="App.openTechniqueModal('${t.id}')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); padding:0.8rem; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:0.7rem; transition: all 0.2s;">
                  <span class="art-tech-icon" style="font-size:1.5rem;">${t.icon}</span>
                  <div>
                    <div class="art-tech-name" style="font-weight:700; font-size:0.88rem; color:#fff;">${t.name}</div>
                    <div style="font-size:0.72rem; color:var(--text-muted); text-transform:capitalize;">${t.subcategory || 'move'} • ${t.duration}s</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `<p style="font-size:0.85rem; color:var(--text-muted);">No interactive live studio moves registered for this discipline yet.</p>`}
        </div>

        <!-- 6. Training Methodology & Competition -->
        ${art.trainingMethods ? `
          <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div class="art-section-title" style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">💪 Training Methods & Competition</div>
            <ul style="padding-left:1.2rem; margin-bottom: 0.8rem;">
              ${art.trainingMethods.map(m => `<li style="font-size:0.84rem; color:#cbd5e1; margin-bottom:0.4rem; line-height:1.5;">${m}</li>`).join('')}
            </ul>
            ${art.competition ? `<div style="font-size:0.84rem; color:var(--text-muted); background:rgba(0,0,0,0.25); padding:0.8rem; border-radius:6px; border-top: 1px solid rgba(255,255,255,0.05);"><strong>🏆 Ruleset:</strong> ${art.competition}</div>` : ''}
          </div>
        ` : ''}

        <!-- 7. Ranking System -->
        ${art.rankingSystem && art.rankingSystem.ranks ? `
          <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div class="art-section-title" style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">🎖️ Ranking & Progression (${art.rankingSystem.type})</div>
            <div class="rank-list" style="display:flex; flex-wrap:wrap; gap:0.6rem;">
              ${art.rankingSystem.ranks.map(r => {
                const isDark = (r.color === '#1A1A2E' || r.color === '#000000' || r.color === '#111111');
                const borderColor = isDark ? '#64748b' : (r.color || '#fff');
                return `
                <div class="rank-badge" style="color: #f8fafc; border: 1px solid ${borderColor}60; background: rgba(255,255,255,0.06); padding: 0.45rem 0.85rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600; display:flex; align-items:center; gap:0.5rem;">
                  <span class="rank-dot" style="background: ${r.color || '#fff'}; width:10px; height:10px; border-radius:50%; display:inline-block; border: 1px solid rgba(255,255,255,0.35);"></span>
                  ${r.name}
                </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 8. Traditional Weapons -->
        ${art.weapons && art.weapons.length > 0 ? `
          <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem;">
            <div class="art-section-title" style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">🗡️ Traditional Weaponry</div>
            <div class="weapon-list" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem;">
              ${art.weapons.map(w => `
                <div class="weapon-card" style="background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); padding:0.8rem; border-radius:8px;">
                  <div style="font-size:1.6rem;">${w.icon}</div>
                  <div style="font-weight:700; font-size:0.9rem; color:#fff; margin-top:0.3rem;">${w.name}</div>
                  <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem;">${w.description}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 9. Criticisms & Notable Masters -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem; margin-bottom:1.5rem;">
          ${art.criticisms ? `
            <div class="art-section" style="background: rgba(231,76,60,0.08); border: 1px solid rgba(231,76,60,0.25); border-radius: 14px; padding: 1.25rem; margin:0;">
              <div class="art-section-title" style="font-size: 1rem; font-weight: 700; color: #E74C3C; margin-bottom: 0.6rem;">⚠️ Common Criticisms</div>
              <ul style="padding-left:1.2rem; margin:0;">
                ${art.criticisms.map(c => `<li style="font-size:0.82rem; color:#fca5a5; margin-bottom:0.3rem;">${c}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${art.famousPractitioners ? `
            <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin:0;">
              <div class="art-section-title" style="font-size: 1rem; font-weight: 700; color: #FFD700; margin-bottom: 0.6rem;">⭐ Famous Practitioners</div>
              <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                ${art.famousPractitioners.map(p => `<span style="background:rgba(255,215,0,0.12); border:1px solid rgba(255,215,0,0.3); color:#fef08a; padding:0.3rem 0.65rem; border-radius:6px; font-size:0.78rem; font-weight:600;">${p}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 10. Best For & Related Arts -->
        ${art.bestFor || art.relatedArts ? `
          <div class="art-section" style="background: var(--bg-card-glass); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.5rem; display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
            ${art.bestFor ? `<div style="background:rgba(0,0,0,0.2); padding:0.8rem; border-radius:8px;"><div style="font-size:0.75rem; text-transform:uppercase; color:#a855f7; font-weight:bold; margin-bottom:0.25rem;">🎯 Ideal Practitioner Profile</div><p style="color:#cbd5e1; font-size:0.84rem; margin:0; line-height:1.55;">${art.bestFor}</p></div>` : ''}
            ${art.relatedArts && art.relatedArts.length > 0 ? `<div style="background:rgba(0,0,0,0.2); padding:0.8rem; border-radius:8px;"><div style="font-size:0.75rem; text-transform:uppercase; color:#06b6d4; font-weight:bold; margin-bottom:0.35rem;">🔗 Sister & Related Styles</div><div style="display:flex; flex-wrap:wrap; gap:0.4rem;">${art.relatedArts.map(ra => `<span style="background:rgba(6,182,212,0.15); border:1px solid rgba(6,182,212,0.3); color:#a5f3fc; padding:0.2rem 0.55rem; border-radius:4px; font-size:0.76rem; font-weight:500;">${ra}</span>`).join('')}</div></div>` : ''}
          </div>
        ` : ''}

      </div>
    `;
    window.scrollTo(0, 0);
  },

  populateDisciplineDropdown() {
    const select = document.getElementById('techDisciplineFilter');
    if (!select || !window.MARTIAL_ARTS) return;
    select.innerHTML = '<option value="all">All Martial Arts</option>' +
      Object.values(window.MARTIAL_ARTS).map(a => `<option value="${a.id}">${a.icon} ${a.name}</option>`).join('');
  },

  filterTechniquesBySubcat(subcat) {
    this._currentSubcat = subcat;
    // Update active chip
    document.querySelectorAll('#subcategoryFilters .filter-chip').forEach(b => {
      const btnSubcat = b.getAttribute('onclick').match(/'([^']+)'/)?.[1];
      b.classList.toggle('active', btnSubcat === subcat);
    });
    if (!window.EXERCISES) return;
    const discipline = document.getElementById('techDisciplineFilter')?.value || 'all';
    let techniques = Object.values(window.EXERCISES).filter(ex => ex.category === 'technique');
    if (subcat !== 'all') techniques = techniques.filter(ex => ex.subcategory === subcat);
    if (discipline !== 'all') techniques = techniques.filter(ex => ex.discipline === discipline);
    // Sort by discipline then name
    techniques.sort((a, b) => a.discipline.localeCompare(b.discipline) || a.name.localeCompare(b.name));
    const countEl = document.getElementById('techCountDisplay');
    if (countEl) countEl.textContent = `${techniques.length} technique${techniques.length !== 1 ? 's' : ''}`;
    const grid = document.getElementById('techniqueGrid');
    if (techniques.length === 0) {
      grid.innerHTML = '<div class="library-empty"><div class="library-empty-icon">\ud83d\udd0d</div><div class="library-empty-text">No techniques match your filters</div></div>';
      return;
    }
    const diffColors = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'];
    const diffNames = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
    grid.innerHTML = techniques.map(ex => {
      const artData = window.MARTIAL_ARTS?.[ex.discipline];
      const artColor = artData?.color || '#888';
      const artName = artData?.name || ex.discipline;
      const diff = ex.difficulty || 1;
      return `
        <div class="technique-card" onclick="App.openTechniqueModal('${ex.id}')" style="border-left: 3px solid ${artColor};">
          <div class="technique-card-top">
            <div class="technique-card-icon" style="border-color: ${artColor}40;">${ex.icon}</div>
            <div class="technique-card-name">${ex.name}</div>
          </div>
          <div class="technique-card-desc">${ex.description}</div>
          <div class="technique-card-meta">
            <span class="meta-badge" style="color: ${artColor}; border-color: ${artColor}40;">${artName}</span>
            ${ex.subcategory ? `<span class="meta-badge">${ex.subcategory}</span>` : ''}
            <span style="display: flex; align-items: center; gap: 2px; margin-left: auto;">
              <span class="difficulty-dot" style="background: ${diffColors[diff - 1]};"></span>
              <span style="font-size: 0.6rem; color: var(--text-faint);">${diffNames[diff - 1]}</span>
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  searchLibrary(query) {
    if (!query || query.trim().length === 0) {
      // Reset to current tab
      if (this._currentLibTab === 'arts') this.renderLibraryArts();
      else if (this._currentLibTab === 'techniques') this.filterTechniquesBySubcat(this._currentSubcat || 'all');
      return;
    }
    const q = query.toLowerCase().trim();
    if (this._currentLibTab === 'arts') {
      this.renderLibraryArts(q);
    } else if (this._currentLibTab === 'techniques') {
      // Filter techniques by search query
      if (!window.EXERCISES) return;
      const discipline = document.getElementById('techDisciplineFilter')?.value || 'all';
      let techniques = Object.values(window.EXERCISES).filter(ex => ex.category === 'technique');
      if (discipline !== 'all') techniques = techniques.filter(ex => ex.discipline === discipline);
      techniques = techniques.filter(ex =>
        ex.name.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q) ||
        (ex.subcategory && ex.subcategory.toLowerCase().includes(q)) || ex.discipline.toLowerCase().includes(q)
      );
      const countEl = document.getElementById('techCountDisplay');
      if (countEl) countEl.textContent = `${techniques.length} result${techniques.length !== 1 ? 's' : ''}`;
      const grid = document.getElementById('techniqueGrid');
      if (techniques.length === 0) {
        grid.innerHTML = '<div class="library-empty"><div class="library-empty-icon">\ud83d\udd0d</div><div class="library-empty-text">No techniques match your search</div></div>';
        return;
      }
      const diffColors = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'];
      const diffNames = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
      grid.innerHTML = techniques.map(ex => {
        const artData = window.MARTIAL_ARTS?.[ex.discipline];
        const artColor = artData?.color || '#888';
        const artName = artData?.name || ex.discipline;
        const diff = ex.difficulty || 1;
        return `
          <div class="technique-card" onclick="App.openTechniqueModal('${ex.id}')" style="border-left: 3px solid ${artColor};">
            <div class="technique-card-top">
              <div class="technique-card-icon" style="border-color: ${artColor}40;">${ex.icon}</div>
              <div class="technique-card-name">${ex.name}</div>
            </div>
            <div class="technique-card-desc">${ex.description}</div>
            <div class="technique-card-meta">
              <span class="meta-badge" style="color: ${artColor}; border-color: ${artColor}40;">${artName}</span>
              ${ex.subcategory ? `<span class="meta-badge">${ex.subcategory}</span>` : ''}
              <span style="display: flex; align-items: center; gap: 2px; margin-left: auto;">
                <span class="difficulty-dot" style="background: ${diffColors[diff - 1]};"></span>
                <span style="font-size: 0.6rem; color: var(--text-faint);">${diffNames[diff - 1]}</span>
              </span>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  renderKnowledge() {
    if (!window.TIPS_DATA) return;
    const grid = document.getElementById('knowledgeGrid');
    grid.innerHTML = window.TIPS_DATA.categories.map(cat => `
      <div class="knowledge-card">
        <div class="knowledge-card-title">${cat.icon} ${cat.category}</div>
        ${cat.tips.map(t => `
          <div class="knowledge-tip">
            <div class="knowledge-tip-title">${t.title}</div>
            <div class="knowledge-tip-content">${t.content}</div>
          </div>
        `).join('')}
      </div>
    `).join('');
  },

  openTechniqueModal(id) {
    if (!window.EXERCISES) return;
    const ex = window.EXERCISES[id];
    if (!ex) return;
    const artData = window.MARTIAL_ARTS?.[ex.discipline];
    const artColor = artData?.color || '#f59e0b';
    const artName = artData?.name || ex.discipline;
    const diffColors = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'];
    const diffNames = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
    const diff = ex.difficulty || 1;
    let html = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
          <div style="font-size: 3rem; text-shadow: 0 0 15px rgba(255,255,255,0.2);">${ex.icon}</div>
          <div>
            <h3 style="font-size: 1.15rem; color: ${artColor}; font-weight: 700; margin-bottom: 0.25rem;">${ex.name}</h3>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <span class="meta-badge" style="color: ${artColor}; border-color: ${artColor}40;">${artName}</span>
              ${ex.subcategory ? `<span class="meta-badge">${ex.subcategory}</span>` : ''}
              <span style="display: inline-flex; align-items: center; gap: 3px;"><span class="difficulty-dot" style="background: ${diffColors[diff - 1]};"></span><span style="font-size: 0.65rem; color: var(--text-faint);">${diffNames[diff - 1]}</span></span>
            </div>
          </div>
        </div>
        <div style="font-size: 0.85rem; line-height: 1.7; color: var(--text-muted);">${ex.description}</div>
        ${ex.targetArea && ex.targetArea.length > 0 ? `
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${ex.targetArea.map(t => `<span class="meta-badge">${t}</span>`).join('')}
          </div>
        ` : ''}
        ${ex.instructions ? `
          <div>
            <h4 style="font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; font-size: 0.9rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.4rem;">How to Execute</h4>
            <ol style="list-style-type: decimal; padding-left: 1.25rem; font-size: 0.82rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.4rem;">
              ${ex.instructions.map(i => `<li>${i}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        ${ex.tips ? `
          <div style="padding: 0.75rem; border-radius: 8px; border: 1px solid ${artColor}40; background: ${artColor}10;">
            <strong style="color: ${artColor}; font-size: 0.8rem; display: block; margin-bottom: 0.25rem;">💡 Pro Tip</strong>
            <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.5;">${ex.tips}</p>
          </div>
        ` : ''}
        ${ex.category === 'technique' || ex.subcategory ? `
          <button type="button" class="action-btn primary-gradient w-full py-3.5 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 mt-3 shadow-2xl rounded-xl" onclick="App.practiceFromLibrary('${ex.id || exId}')">
            <span>⚔️ Practice This Technique Live</span> <span class="arrow">→</span>
          </button>
        ` : ''}
      </div>
    `;
    this.openModal(ex.name, html);
  },

  // --- PRACTICAL SOLO PRACTICE HUB ---
  _soloMode: 'timer',
  _soloTargetVal: 30,
  _soloActiveTimer: null,
  _soloCurrentReps: 0,
  _soloLoggedClean: true,

  practiceFromLibrary(exId) {
    this.openSoloPracticeHub();
    setTimeout(() => {
      const techSel = document.getElementById('soloTechSelect');
      const discEl = document.getElementById('soloDiscSelect');
      const tech = window.EXERCISES[exId];
      if (tech && discEl && techSel) {
        discEl.value = tech.discipline || 'all';
        this.filterSoloTechs();
        techSel.value = exId;
      }
    }, 50);
  },

  openSoloPracticeHub() {
    if (!window.EXERCISES) return;
    const allTechs = Object.values(window.EXERCISES).filter(ex => ex.category === 'technique');
    const disciplines = [...new Set(allTechs.map(t => t.discipline))];
    
    let html = `
      <div class="solo-practice-container text-left flex flex-col gap-4">
        <div class="glass-card p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          💡 <b>Kiai Technique Practice:</b> Pick any stance, strike, or kick to practice outside the daily structured routine. Set your timer or rep goal and track holds.
        </div>

        <!-- Solo Stats Banner -->
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 0.85rem; display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 0.4rem;">
          <div style="border-right: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 1.25rem; font-weight: 800; color: #fbbf24; font-family: monospace;">${this.state.soloPracticesCompleted || 0}</div>
            <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Sessions</div>
          </div>
          <div style="border-right: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 1.25rem; font-weight: 800; color: #a855f7; font-family: monospace;">${(this.state.soloMasteredTechs || []).length}</div>
            <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Mastered</div>
          </div>
          <div style="border-right: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 1.25rem; font-weight: 800; color: #34d399; font-family: monospace;">${this.state.soloCleanForms || 0}</div>
            <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Flawless</div>
          </div>
          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #38bdf8; font-family: monospace;">${this.state.soloTotalReps || 0}</div>
            <div style="font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Strikes</div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs uppercase tracking-wider text-secondary font-bold mb-1">1. Select Discipline</label>
            <select id="soloDiscSelect" class="glass-input w-full p-2 text-sm outline-none" onchange="App.filterSoloTechs()">
              <option value="all">All Disciplines (${allTechs.length})</option>
              ${disciplines.map(d => `<option value="${d}">${window.MARTIAL_ARTS?.[d]?.name || d}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-secondary font-bold mb-1">2. Select Technique</label>
            <select id="soloTechSelect" class="glass-input w-full p-2 text-sm outline-none">
              ${allTechs.map(t => `<option value="${t.id}" data-disc="${t.discipline}">${t.icon} ${t.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs uppercase tracking-wider text-secondary font-bold mb-1.5">3. Training Mode & Goal</label>
          <div class="grid grid-cols-2 gap-2 mb-2.5">
            <button type="button" class="solo-mode-btn active p-2.5 rounded-xl border text-center font-bold text-xs" id="btnModeTimer" onclick="App.setSoloMode('timer')">
              ⏱️ Timed Hold / Drills
            </button>
            <button type="button" class="solo-mode-btn p-2.5 rounded-xl border text-center font-bold text-xs opacity-60" id="btnModeReps" onclick="App.setSoloMode('reps')">
              👊 Repetition Striking
            </button>
          </div>

          <div id="soloTimerOptions" class="grid grid-cols-4 gap-2">
            <button type="button" class="solo-opt-btn active py-2 px-2 rounded-lg border text-xs font-bold text-center" onclick="App.selectSoloOpt(this, 30)">30s</button>
            <button type="button" class="solo-opt-btn py-2 px-2 rounded-lg border text-xs font-bold text-center" onclick="App.selectSoloOpt(this, 60)">60s</button>
            <button type="button" class="solo-opt-btn py-2 px-2 rounded-lg border text-xs font-bold text-center" onclick="App.selectSoloOpt(this, 90)">90s</button>
            <button type="button" class="solo-opt-btn py-2 px-2 rounded-lg border text-xs font-bold text-center" onclick="App.selectSoloOpt(this, 180)">3 mins</button>
          </div>

          <div id="soloRepsOptions" class="grid grid-cols-4 gap-2" style="display: none;">
            <button type="button" class="solo-opt-btn active py-2 px-2 rounded-lg border text-xs font-bold text-center" onclick="App.selectSoloOpt(this, 10)">10 Reps</button>
            <button type="button" class="solo-opt-btn py-2 px-2 rounded-lg border text-xs font-bold text-center" onclick="App.selectSoloOpt(this, 25)">25 Reps</button>
            <button type="button" class="solo-opt-btn py-2 px-2 rounded-lg border text-xs font-bold text-center" onclick="App.selectSoloOpt(this, 50)">50 Reps</button>
            <button type="button" class="solo-opt-btn py-2 px-2 rounded-lg border text-xs font-bold text-center" onclick="App.selectSoloOpt(this, 100)">100 Reps</button>
          </div>
        </div>

        <button class="action-btn massive-btn primary-gradient mt-2 py-3 font-bold uppercase tracking-wide" onclick="App.startSoloDrill()">
          BEGIN PRACTICE
        </button>
      </div>
    `;
    this.openModal("Kiai Technique Practice", html);
    this.filterSoloTechs();
  },

  setSoloMode(m) {
    this._soloMode = m;
    const bT = document.getElementById('btnModeTimer');
    const bR = document.getElementById('btnModeReps');
    if (bT) { bT.classList.toggle('active', m === 'timer'); bT.style.opacity = m === 'timer' ? '1' : '0.6'; }
    if (bR) { bR.classList.toggle('active', m === 'reps'); bR.style.opacity = m === 'reps' ? '1' : '0.6'; }
    const tOpt = document.getElementById('soloTimerOptions');
    const rOpt = document.getElementById('soloRepsOptions');
    if (tOpt) tOpt.style.display = m === 'timer' ? 'grid' : 'none';
    if (rOpt) rOpt.style.display = m === 'reps' ? 'grid' : 'none';
    this._soloTargetVal = m === 'timer' ? 30 : 10;
    document.querySelectorAll(m === 'timer' ? '#soloTimerOptions .solo-opt-btn' : '#soloRepsOptions .solo-opt-btn').forEach((b, idx) => {
      b.classList.toggle('active', idx === 0);
    });
  },

  selectSoloOpt(btn, val) {
    btn.parentElement.querySelectorAll('.solo-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this._soloTargetVal = val;
  },

  filterSoloTechs() {
    const discEl = document.getElementById('soloDiscSelect');
    const techSel = document.getElementById('soloTechSelect');
    if (!discEl || !techSel) return;
    const disc = discEl.value;
    Array.from(techSel.options).forEach(opt => {
      opt.style.display = (disc === 'all' || opt.getAttribute('data-disc') === disc) ? 'block' : 'none';
    });
    const firstVis = Array.from(techSel.options).find(o => o.style.display !== 'none');
    if (firstVis) techSel.value = firstVis.value;
  },

  startSoloDrill() {
    const techIdEl = document.getElementById('soloTechSelect');
    if (!techIdEl) return;
    const techId = techIdEl.value;
    const tech = window.EXERCISES[techId];
    if (!tech) return;

    this._soloCurrentReps = 0;
    this._soloLoggedClean = true;
    this.initAudio();

    let areaHtml = `
      <div class="text-center flex flex-col items-center gap-4 py-2">
        <div class="flex items-center gap-3 w-full border-b border-white/10 pb-3">
          <span class="text-4xl">${tech.icon}</span>
          <div class="text-left">
            <h3 class="text-lg font-bold text-amber-400 leading-tight">${tech.name}</h3>
            <span class="text-xs text-secondary uppercase">${window.MARTIAL_ARTS?.[tech.discipline]?.name || tech.discipline} • Live Drill</span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-muted text-left w-full leading-relaxed">
          ${tech.description}
        </div>

        ${tech.instructions && tech.instructions.length > 0 ? `
          <div class="w-full text-left bg-black/60 p-3.5 rounded-xl border border-amber-500/30 shadow-lg">
            <h4 class="text-xs uppercase tracking-wider font-bold text-amber-400 mb-2 border-b border-white/10 pb-1.5 flex items-center gap-1.5">📋 How to Execute</h4>
            <ol class="list-none text-xs text-white/90 flex flex-col gap-2 m-0 p-0">
              ${tech.instructions.map((step, sIdx) => `<li class="flex items-start gap-2"><strong class="text-amber-400 font-mono text-sm leading-none mt-0.5">${sIdx + 1}.</strong> <span class="leading-relaxed">${step}</span></li>`).join('')}
            </ol>
          </div>
        ` : ''}

        ${tech.tips ? `
          <div class="w-full text-left bg-amber-500/15 p-3 rounded-xl border border-amber-500/40">
            <span class="text-xs text-amber-300 font-bold block mb-1">💡 Pro Tip</span>
            <p class="text-xs text-white/90 m-0 leading-relaxed">${tech.tips}</p>
          </div>
        ` : ''}

        ${this._soloMode === 'timer' ? `
          <div class="my-2">
            <div class="text-6xl font-black text-white tracking-tight font-mono" id="soloLiveTimer">${this._soloTargetVal}s</div>
            <span class="text-xs text-secondary mt-1 block">Hold / Execute continuously</span>
          </div>
        ` : `
          <div class="my-1 w-full max-w-sm">
            <div class="text-5xl font-black text-amber-500 mb-3 font-mono" id="soloLiveReps">0 / ${this._soloTargetVal}</div>
            <button type="button" class="action-btn primary-gradient w-full py-7 text-xl font-black uppercase tracking-wider shadow-2xl rounded-2xl active:scale-95 transition-transform select-none" onclick="App.incrementSoloRep()">
              👊 TAP HERE (+1 REP)
            </button>
          </div>
        `}

        <div class="w-full p-3.5 rounded-xl bg-black/60 border border-white/15 text-left">
          <label class="block text-xs uppercase font-bold text-amber-400 mb-2">Self-Assessment Log:</label>
          <div class="flex gap-2">
            <button type="button" class="solo-assess-btn active flex-1 py-2 px-2 rounded-lg border border-green-500/50 bg-green-500/20 text-green-300 text-xs font-bold text-center" id="btnAssessClean" onclick="App.setSoloAssess(true)">
              ✨ Pure Kiai (0 fails)
            </button>
            <button type="button" class="solo-assess-btn flex-1 py-2 px-2 rounded-lg border border-white/10 bg-white/5 text-secondary text-xs font-bold text-center" id="btnAssessFail" onclick="App.setSoloAssess(false)">
              ⚠️ Broke Form / Stood
            </button>
          </div>
        </div>

        <button class="action-btn outlined w-full py-3 text-sm font-bold text-red-400 border-red-500/30 hover:bg-red-500/10" onclick="App.finishSoloDrill('${tech.id}')">
          COMPLETE SOLO PRACTICE
        </button>
      </div>
    `;

    this.openModal("Live Practice — " + tech.name, areaHtml);

    if (this._soloMode === 'timer') {
      let rem = this._soloTargetVal;
      this.playTransitionTone();
      if (this._soloActiveTimer) clearInterval(this._soloActiveTimer);
      this._soloActiveTimer = setInterval(() => {
        rem--;
        const tel = document.getElementById('soloLiveTimer');
        if (tel) tel.textContent = `${rem}s`;
        if (rem <= 3 && rem > 0) this.playTick();
        if (rem <= 0) {
          clearInterval(this._soloActiveTimer);
          this._soloActiveTimer = null;
          this.playChime();
          if (tel) tel.textContent = "DONE!";
        }
      }, 1000);
    }
  },

  incrementSoloRep() {
    this._soloCurrentReps++;
    this.playTick();
    const rel = document.getElementById('soloLiveReps');
    if (rel) rel.textContent = `${this._soloCurrentReps} / ${this._soloTargetVal}`;
    if (this._soloCurrentReps === this._soloTargetVal) {
      this.playChime();
    }
  },

  setSoloAssess(clean) {
    this._soloLoggedClean = clean;
    const bClean = document.getElementById('btnAssessClean');
    const bFail = document.getElementById('btnAssessFail');
    if (bClean && bFail) {
      bClean.className = clean ? "solo-assess-btn active flex-1 py-2 px-2 rounded-lg border border-green-500/50 bg-green-500/20 text-green-300 text-xs font-bold text-center" : "solo-assess-btn flex-1 py-2 px-2 rounded-lg border border-white/10 bg-white/5 text-secondary text-xs font-bold text-center";
      bFail.className = !clean ? "solo-assess-btn active flex-1 py-2 px-2 rounded-lg border border-amber-500/50 bg-amber-500/20 text-amber-300 text-xs font-bold text-center" : "solo-assess-btn flex-1 py-2 px-2 rounded-lg border border-white/10 bg-white/5 text-secondary text-xs font-bold text-center";
    }
  },

  finishSoloDrill(techId) {
    if (this._soloActiveTimer) clearInterval(this._soloActiveTimer);
    this._soloActiveTimer = null;

    const techObj = window.EXERCISES?.[techId];
    const techName = techObj ? techObj.name : (typeof techId === 'string' && !techId.includes('_') ? techId : "Technique");

    // Track statistics safely
    this.state.soloPracticesCompleted = (this.state.soloPracticesCompleted || 0) + 1;
    if (!this.state.soloMasteredTechs) this.state.soloMasteredTechs = [];
    if (techId && !this.state.soloMasteredTechs.includes(techId)) {
      this.state.soloMasteredTechs.push(techId);
    }
    if (this._soloLoggedClean) {
      this.state.soloCleanForms = (this.state.soloCleanForms || 0) + 1;
      this.state.masteryStances = (this.state.masteryStances || 0) + 1;
    }
    if (this._soloMode === 'reps') {
      this.state.soloTotalReps = (this.state.soloTotalReps || 0) + (this._soloCurrentReps || 10);
    }

    const addedTime = this._soloMode === 'timer' ? (this._soloTargetVal || 30) : Math.ceil((this._soloCurrentReps || 10) * 2);
    this.state.totalTimeSeconds = (this.state.totalTimeSeconds || 0) + addedTime;
    this.saveState();
    this.updateDashRank();

    this.closeModal(true);
    this.showToast('🥋', 'Solo Practice Completed!', `Logged ${techName}. Total Sessions: ${this.state.soloPracticesCompleted}`);
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
