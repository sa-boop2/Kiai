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
          instructions: [ 'Maintain proper stance and balance.', 'Execute the technique with sharp intent.', 'Return immediately to guard position.' ],
          tips: t.tips,
          difficulty: t.difficulty,
          targetArea: ['martial arts', t.subcategory],
          icon: t.icon
        };
      }
    });
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
          this.playChime();
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
              <div class="art-card-origin">${art.origin}</div>
            </div>
          </div>
          <div class="art-card-desc">${art.description}</div>
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
    // Hide arts grid, show detail
    document.getElementById('lib-arts').style.display = 'none';
    document.getElementById('lib-art-detail').style.display = 'block';
    // Get techniques for this art
    const techniques = window.EXERCISES ? Object.values(window.EXERCISES).filter(ex => ex.category === 'technique' && ex.discipline === artId) : [];
    const container = document.getElementById('artDetailContent');
    container.innerHTML = `
      <div class="art-detail-view">
        <!-- Back Button -->
        <button class="art-detail-back" onclick="App.setLibraryTab('arts')">&larr; Back to Arts</button>
        <!-- Header -->
        <div class="art-detail-header" style="background: linear-gradient(135deg, ${art.color}30 0%, ${art.color}08 100%); border: 1px solid ${art.color}40;">
          <div class="art-detail-title-row">
            <div class="art-detail-icon" style="border-color: ${art.color}50;">${art.icon}</div>
            <div>
              <div class="art-detail-name">${art.name}</div>
              <div class="art-detail-origin">${art.origin} \u2022 ${art.type.charAt(0).toUpperCase() + art.type.slice(1)}</div>
            </div>
          </div>
        </div>
        <!-- Description -->
        <div class="art-section">
          <div class="art-section-title">\ud83d\udcd6 About</div>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 0.75rem;">${art.description}</p>
          ${art.history ? `<p style="font-size: 0.8rem; color: var(--text-faint); line-height: 1.6; font-style: italic;">${art.history}</p>` : ''}
        </div>
        <!-- Characteristics -->
        ${art.characteristics && art.characteristics.length > 0 ? `
          <div class="art-section">
            <div class="art-section-title">\u2728 Characteristics</div>
            <div class="art-traits-list">
              ${art.characteristics.map(c => `<div class="art-trait">${c}</div>`).join('')}
            </div>
          </div>
        ` : ''}
        <!-- Key Principles -->
        ${art.keyPrinciples && art.keyPrinciples.length > 0 ? `
          <div class="art-section">
            <div class="art-section-title">\ud83e\uddd8 Key Principles</div>
            <div class="art-traits-list">
              ${art.keyPrinciples.map(p => `<div class="art-trait">${p}</div>`).join('')}
            </div>
          </div>
        ` : ''}
        <!-- Ranking System -->
        ${art.rankingSystem && art.rankingSystem.ranks && art.rankingSystem.ranks.length > 0 ? `
          <div class="art-section">
            <div class="art-section-title">\ud83c\udfc5 Ranking System (${art.rankingSystem.type})</div>
            <div class="rank-list">
              ${art.rankingSystem.ranks.map(r => `
                <div class="rank-badge" style="color: ${r.color}; border-color: ${r.color}60; background: ${r.color}15;">
                  <span class="rank-dot" style="background: ${r.color};"></span>
                  ${r.name}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <!-- Weapons -->
        ${art.weapons && art.weapons.length > 0 ? `
          <div class="art-section">
            <div class="art-section-title">\u2694\ufe0f Traditional Weapons</div>
            <div class="weapon-list">
              ${art.weapons.map(w => `
                <div class="weapon-card">
                  <div class="weapon-card-icon">${w.icon}</div>
                  <div class="weapon-card-name">${w.name}</div>
                  <div class="weapon-card-desc">${w.description}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <!-- Techniques -->
        ${techniques.length > 0 ? `
          <div class="art-section">
            <div class="art-section-title">\ud83e\udd4b Techniques (${techniques.length})</div>
            <div class="art-tech-list">
              ${techniques.map(t => `
                <div class="art-tech-item" onclick="App.openTechniqueModal('${t.id}')">
                  <span class="art-tech-icon">${t.icon}</span>
                  <span class="art-tech-name">${t.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <!-- Famous Practitioners -->
        ${art.famousPractitioners && art.famousPractitioners.length > 0 ? `
          <div class="art-section">
            <div class="art-section-title">\u2b50 Notable Practitioners</div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${art.famousPractitioners.map(p => `<span class="meta-badge" style="font-size: 0.72rem;">${p}</span>`).join('')}
            </div>
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
            <strong style="color: ${artColor}; font-size: 0.8rem; display: block; margin-bottom: 0.25rem;">\ud83d\udca1 Pro Tip</strong>
            <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.5;">${ex.tips}</p>
          </div>
        ` : ''}
      </div>
    `;
    this.openModal(ex.name, html);
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
