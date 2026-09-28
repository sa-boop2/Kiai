export interface DojoBenchmark {
  id: string
  name: string
  description: string
  levels: { level: number; title: string; target: string }[]
}

export interface DojoRoutineGoal {
  title: string
  description: string
  duration: number
  exercisesCount: number
  kataId?: string
  accent: string
  symbol: string
}

export interface DojoDrill {
  name: string
  focus: string
  duration: number
  symbol: string
  instructions: string[]
}

export interface MartialDojoProfile {
  artId: string
  nativeName: string
  country: string
  flag: string
  accent: string
  symbol: string
  tagline: string
  history: string
  philosophy: string
  mobilityFocus: string[]
  benchmarks: DojoBenchmark[]
  routineGoals: DojoRoutineGoal[]
  drills: DojoDrill[]
}

export const MARTIAL_DOJO_PROFILES: Record<string, MartialDojoProfile> = {
  karate: {
    artId: 'karate',
    nativeName: '空手道',
    country: 'Japan',
    flag: '🇯🇵',
    accent: 'var(--ember)',
    symbol: '🇯🇵',
    tagline: 'Deep stances. Sharp kicks. Total control.',
    history: 'Developed in the Ryukyu Kingdom of Okinawa before spreading across Japan in the early 20th century. Emphasizes explosive straight-line strikes, grounded rooting, and kata precision.',
    philosophy: 'Karate-do is the way of the empty hand: cultivating maximum power through effortless alignment, mutual respect, and supreme mental serenity.',
    mobilityFocus: ['Hip flexor length for Zenkutsu-Dachi', 'Hamstring length for Mae-Geri', 'Adductor opening for Kiba-Dachi', 'Single-leg standing root'],
    benchmarks: [
      {
        id: 'karate_kick_height',
        name: 'Mae-Geri High Kick',
        description: 'Dynamic front kick height without tilting the pelvis or losing spinal alignment.',
        levels: [
          { level: 1, title: 'Waist Level (Chudan)', target: 'Kick cleanly to waist height with straight spine' },
          { level: 2, title: 'Solar Plexus Height', target: 'Snap chamber to chest height without leaning back' },
          { level: 3, title: 'Chin Height (Jodan)', target: 'Deliver heel strike to chin height maintaining stance' },
          { level: 4, title: 'Forehead Height', target: 'Kick to eye level with vertical standing leg' },
          { level: 5, title: 'Overhead Mastery', target: 'Complete vertical extension without rounding lower back' },
        ],
      },
      {
        id: 'karate_low_stance',
        name: 'Horse Stance (Kiba-Dachi)',
        description: 'Depth and hold duration in the classical low rooted stance.',
        levels: [
          { level: 1, title: 'High Stance 45°', target: 'Hold 45° knee bend for 30s with feet parallel' },
          { level: 2, title: 'Thighs 60° Depth', target: 'Sink to 60° depth for 45s without feet flaring' },
          { level: 3, title: 'Parallel Thighs (90°)', target: 'Hold true 90° thighs parallel to floor for 60s' },
          { level: 4, title: 'Deep Sink (90s)', target: 'Parallel hold for 90s with calm diaphragmatic breath' },
          { level: 5, title: 'Grandmaster Root (2m+)', target: '2 minutes at parallel depth with neutral pelvic floor' },
        ],
      },
      {
        id: 'karate_side_split',
        name: 'Yoko-Geri Lateral Split',
        description: 'Adductor and groin flexibility governing side kick reach.',
        levels: [
          { level: 1, title: 'Standing Straddle 90°', target: 'Legs open comfortably past shoulder width' },
          { level: 2, title: 'Seated Straddle 120°', target: 'Sit upright with legs 120° apart without rounding' },
          { level: 3, title: 'Wide Straddle 145°', target: 'Chest tilts forward 45° in wide straddle' },
          { level: 4, title: 'Pancake Split (165°)', target: 'Navel touches floor with toes pointed upward' },
          { level: 5, title: 'Full 180° Middle Split', target: 'Complete flat box split with pelvis in line with heels' },
        ],
      },
    ],
    routineGoals: [
      {
        title: 'High Kick Freedom',
        description: 'Unlocks hamstring length and glute release for effortless head-height Mae-Geri.',
        duration: 900,
        exercisesCount: 6,
        accent: 'var(--ember)',
        symbol: 'figure.kickboxing',
      },
      {
        title: 'Low Stance Foundation',
        description: 'Opens hip flexors and groin for unshakeable Zenkutsu and Kiba-Dachi depth.',
        duration: 720,
        exercisesCount: 5,
        accent: 'var(--gold)',
        symbol: 'figure.lunge.hip',
      },
      {
        title: 'Post-Kata Recovery',
        description: 'Decompresses lumbar spine, calves and ankles after intense kata repetitions.',
        duration: 600,
        exercisesCount: 5,
        accent: 'var(--jade)',
        symbol: 'figure.childs.lat',
      },
    ],
    drills: [
      {
        name: 'Chamber & Snap Hold',
        focus: 'Hip flexor endurance and active standing balance',
        duration: 45,
        symbol: 'figure.leg.swings',
        instructions: ['Lift knee to chest in tight chamber', 'Extend kick slowly, hold 3 seconds', 'Retract without dropping knee'],
      },
      {
        name: 'Stance Transitions Wave',
        focus: 'Adductor transitions and smooth rooting',
        duration: 60,
        symbol: 'figure.cossack',
        instructions: ['Glide from Zenkutsu-Dachi to Kiba-Dachi without rising', 'Maintain level head height', 'Keep heels grounded'],
      },
    ],
  },

  bjj: {
    artId: 'bjj',
    nativeName: 'Arte Suave',
    country: 'Brazil',
    flag: '🇧🇷',
    accent: 'var(--indigo)',
    symbol: '🇧🇷',
    tagline: 'Mobile hips win the guard game.',
    history: 'Evolved in Rio de Janeiro through the Gracie family from Maeda’s Kodokan Judo. Focuses on leverage, ground control, and submission through guard retention and scrambles.',
    philosophy: 'The gentle art: efficiency of movement allowing a smaller opponent to prevail over superior strength through rotational mobility and patience.',
    mobilityFocus: ['Hip internal/external rotation (90/90)', 'Thoracic spine rotation & framing', 'Groin flexibility for butterfly guard', 'Posterior chain for inversion'],
    benchmarks: [
      {
        id: 'bjj_guard_9090',
        name: 'Guard Retention 90/90',
        description: 'Hip internal and external rotation for unpassable open guard.',
        levels: [
          { level: 1, title: 'Hands-Supported 90/90', target: 'Hold 90/90 sitting with hands supporting behind' },
          { level: 2, title: 'Hands-Free Upright', target: 'Sit tall in 90/90 without hands touching floor' },
          { level: 3, title: 'Fluid Hip Switch', target: 'Transition left to right 90/90 without hand assist' },
          { level: 4, title: 'Deep Forward Fold', target: 'Chest touches front knee in 90/90 comfortably' },
          { level: 5, title: 'Rubber Guard Mobility', target: 'Effortless high hip clamp and foot-to-chest clearance' },
        ],
      },
      {
        id: 'bjj_inversion_spine',
        name: 'Spinal Inversion Arc',
        description: 'Thoracic and cervical decompression for granby rolls and inverting.',
        levels: [
          { level: 1, title: 'Knees to Chest Hold', target: 'Tuck knees tightly with lumbar flat on floor' },
          { level: 2, title: 'Plow Pose to Toes', target: 'Roll onto upper back with toes touching wall behind' },
          { level: 3, title: 'Granby Roll Flow', target: 'Smooth shoulder-to-shoulder roll with hips elevated' },
          { level: 4, title: 'Free Plow Touch', target: 'Toes touch floor behind head with calm nasal breathing' },
          { level: 5, title: 'Full Inversion Matrix', target: 'Spin 360° on shoulders effortlessly without neck strain' },
        ],
      },
      {
        id: 'bjj_butterfly_groin',
        name: 'Butterfly Guard Opening',
        description: 'Adductor release for butterfly hooks and triangle choke defense.',
        levels: [
          { level: 1, title: 'Seated Soles Together', target: 'Knees 45° off floor with back against wall' },
          { level: 2, title: 'Free Seated Butterfly', target: 'Sit tall with spine neutral, knees 30° off floor' },
          { level: 3, title: 'Knees Near Mat', target: 'Knees within 2 inches of the mat' },
          { level: 4, title: 'Chest to Feet Fold', target: 'Fold forehead to touch toes in butterfly' },
          { level: 5, title: 'Full Butterfly Flat', target: 'Thighs completely flat to floor with upright spine' },
        ],
      },
    ],
    routineGoals: [
      {
        title: 'Guard Retention Mobility',
        description: 'Maximizes hip rotation and adductor elasticity to recover guard from any angle.',
        duration: 900,
        exercisesCount: 6,
        accent: 'var(--indigo)',
        symbol: 'figure.butterfly',
      },
      {
        title: 'Inversion & Neck Armor',
        description: 'Relieves cervical pressure and opens thoracic spine for safe inverting and rolling.',
        duration: 780,
        exercisesCount: 6,
        accent: 'var(--slate)',
        symbol: 'figure.thoracic.twist',
      },
      {
        title: 'Post-Roll Hip Reset',
        description: 'Decompresses hip capsules, lower back, and forearms after grueling sparring.',
        duration: 600,
        exercisesCount: 5,
        accent: 'var(--jade)',
        symbol: 'figure.knee.chest',
      },
    ],
    drills: [
      {
        name: 'Technical Hip Escape (Shrimp)',
        focus: 'Rotational hip extension and core decoupling',
        duration: 60,
        symbol: 'figure.supine.twist',
        instructions: ['Drive through bottom foot, elevate hips', 'Push hips back away from partner', 'Recover knee to elbow immediately'],
      },
      {
        name: 'Granby Shoulder Flow',
        focus: 'Thoracic safety and inversion mechanics',
        duration: 45,
        symbol: 'figure.thread.needle',
        instructions: ['Tuck chin, roll across upper traps', 'Do not bear weight on cervical vertebrae', 'Use core to guide legs'],
      },
    ],
  },

  'muay-thai': {
    artId: 'muay-thai',
    nativeName: 'มวยไทย',
    country: 'Thailand',
    flag: '🇹🇭',
    accent: 'var(--gold)',
    symbol: '🇹🇭',
    tagline: 'The art of eight limbs — and very open hips.',
    history: 'Ancient military martial art of Siam dating back centuries. Combines fists, elbows, knees, and heavy roundhouse shin kicks into the ultimate striking discipline.',
    philosophy: 'Resilience, warrior heart (Nak Muay), and sacred respect for lineage, instructors, and the ring.',
    mobilityFocus: ['Roundhouse hip turnover & torque', 'Teep chamber & push height', 'Ankle dorsiflexion for skipping & checking', 'Clinch neck and shoulder mobility'],
    benchmarks: [
      {
        id: 'muay_thai_turnover',
        name: 'Roundhouse Hip Turnover',
        description: 'Complete internal/external hip rotation to chop through targets with the shin.',
        levels: [
          { level: 1, title: 'Low Leg Check (30°)', target: 'Check incoming kick with shin 30° outward' },
          { level: 2, title: 'Horizontal Rib Kick', target: 'Turn hip completely over so thigh is horizontal' },
          { level: 3, title: 'Downward Angle Chop', target: 'Turn hip over past 90° so shin chops down on target' },
          { level: 4, title: 'High Neck Kick Snap', target: 'Full hip rotation at neck height with standing heel turned' },
          { level: 5, title: 'Question Mark Deception', target: 'Teep fake into instant high roundhouse without pause' },
        ],
      },
      {
        id: 'muay_thai_teep',
        name: 'Front Teep Extension',
        description: 'Pure hip flexor drive and hamstring length for long distance push kicks.',
        levels: [
          { level: 1, title: 'Waist Push', target: 'Lock out push kick at belt line without tilting' },
          { level: 2, title: 'Solar Plexus Teep', target: 'Deliver ball of foot to chest level with high chamber' },
          { level: 3, title: 'Chin Teep', target: 'Clean strike to chin height maintaining upright posture' },
          { level: 4, title: 'Elevated Push Lock', target: 'Hold teep extension at head height for 5 seconds' },
          { level: 5, title: 'Iron Pillar Lock', target: 'Overhead teep chamber with zero standing leg bend' },
        ],
      },
      {
        id: 'muay_thai_clinch',
        name: 'Clinch Neck Resilience',
        description: 'Cervical extension and shoulder girdle endurance under heavy head pulls.',
        levels: [
          { level: 1, title: 'Chin Tuck Guard', target: 'Resist forward pull with packed neck for 30s' },
          { level: 2, title: 'Upper Trap Opening', target: 'Full range lateral neck bend without pinching' },
          { level: 3, title: 'Plum Lock Frame', target: 'Elbows tucked inside with neutral neck posture' },
          { level: 4, title: 'Rotational Plum Break', target: 'Full thoracic rotation against resistance' },
          { level: 5, title: 'Unbreakable Posture', target: 'Maintain upright posture through 2-minute clinch battle' },
        ],
      },
    ],
    routineGoals: [
      {
        title: 'Roundhouse Hip Torque',
        description: 'Unlocks piriformis and glute medius for snapping, heavyweight shin kicks.',
        duration: 900,
        exercisesCount: 6,
        accent: 'var(--gold)',
        symbol: 'figure.pigeon',
      },
      {
        title: 'Teep Range & Balance',
        description: 'Lengthens hamstrings and psoas for penetrating, lightning-fast push kicks.',
        duration: 720,
        exercisesCount: 5,
        accent: 'var(--ember)',
        symbol: 'figure.hamstring.standing',
      },
      {
        title: 'Shin & Ankle Armor',
        description: 'Reconditions calves, tibialis anterior, and feet after heavy bag and pad work.',
        duration: 600,
        exercisesCount: 5,
        accent: 'var(--jade)',
        symbol: 'figure.shin.kneel',
      },
    ],
    drills: [
      {
        name: 'Slow Teep Chamber Extension',
        focus: 'Single leg stability and psoas strength',
        duration: 45,
        symbol: 'figure.leg.swings',
        instructions: ['Bring knee to chest, pause', 'Slowly press foot forward, hold 3 seconds', 'Retract without lowering knee'],
      },
      {
        name: 'Hip Turnover Wall Pivot',
        focus: 'Standing foot 180° pivot and hip tilt',
        duration: 60,
        symbol: 'figure.cossack',
        instructions: ['Place hand on wall for balance', 'Pivot standing foot 180° away', 'Roll top hip completely forward and over'],
      },
    ],
  },

  taekwondo: {
    artId: 'taekwondo',
    nativeName: '태권도',
    country: 'South Korea',
    flag: '🇰🇷',
    accent: 'var(--crimson)',
    symbol: '🇰🇷',
    tagline: 'Speed, flight, and unmatched kicking reach.',
    history: 'Formed in Korea during the 1940s-1950s blending ancient Taekkyeon with Karate and Chinese martial arts. Celebrated for high, jumping, and spinning kicks.',
    philosophy: 'The way of the foot and the fist: courteous demeanor, indomitable spirit, self-control, and perseverance.',
    mobilityFocus: ['Full 180° middle & front splits', 'Active hamstring flexibility for Axe kick', 'Adductor elasticity for spinning hook kicks', 'Ankle chamber extension'],
    benchmarks: [
      {
        id: 'tkd_middle_split',
        name: 'Full Middle Split (180°)',
        description: 'Complete lateral split for unobstructed side and roundhouse kicks.',
        levels: [
          { level: 1, title: 'Kneeling Box Split', target: 'Hips sinking between 90° bent knees comfortably' },
          { level: 2, title: 'Standing Straddle 135°', target: 'Wide straddle with palms flat on floor' },
          { level: 3, title: 'Deep Split 160°', target: 'Groin within 6 inches of the floor' },
          { level: 4, title: 'Full Flat Split (180°)', target: 'Complete ground contact along inner legs' },
          { level: 5, title: 'Over-Split Pioneer', target: 'Feet elevated on yoga blocks beyond 180°' },
        ],
      },
      {
        id: 'tkd_axe_kick',
        name: 'Axe Kick Hamstring Range',
        description: 'Dynamic vertical hamstring reach for downward heel drop kicks.',
        levels: [
          { level: 1, title: 'Chin Height Swing', target: 'Dynamic straight leg swing to chin level' },
          { level: 2, title: 'Eye Level Clearance', target: 'Leg passes face without bending standing knee' },
          { level: 3, title: 'Overhead Apex', target: 'Heel reaches top of head height effortlessly' },
          { level: 4, title: 'Sky Axe Reach', target: 'Foot reaches 45° past vertical overhead' },
          { level: 5, title: 'Instant Axe Lock', target: 'Snap to full vertical and drop heel with zero recoil' },
        ],
      },
      {
        id: 'tkd_spin_hook',
        name: 'Spinning Hook Chamber',
        description: 'Rotational hip and glute elasticity for 360° and 540° kicking velocity.',
        levels: [
          { level: 1, title: 'Hook Chamber 90°', target: 'Hold hook kick chamber with parallel knee' },
          { level: 2, title: 'Shoulder Hook Arc', target: 'Sweep hook arc cleanly at shoulder height' },
          { level: 3, title: 'Head Height Snap', target: 'Full hook snap at head height on single leg' },
          { level: 4, title: 'Torque Spin Hook', target: '360° spin into head height hook with balance root' },
          { level: 5, title: '540° Flight Chamber', target: 'Effortless aerial chamber and landing control' },
        ],
      },
    ],
    routineGoals: [
      {
        title: 'Split Mastery (180°)',
        description: 'Intense adductor and groin protocol engineered for full middle split opening.',
        duration: 960,
        exercisesCount: 7,
        accent: 'var(--crimson)',
        symbol: 'figure.split',
      },
      {
        title: 'Axe Kick Flexibility',
        description: 'Hamstring and lower back release to skyrocket vertical leg extension.',
        duration: 780,
        exercisesCount: 6,
        accent: 'var(--ember)',
        symbol: 'figure.hamstring.seated',
      },
      {
        title: 'Knee & Ankle Shock Absorption',
        description: 'Prepares tendons and joint capsules for high impact jump landings.',
        duration: 600,
        exercisesCount: 5,
        accent: 'var(--jade)',
        symbol: 'figure.deep.squat',
      },
    ],
    drills: [
      {
        name: 'Pancake Leg Stretch Hold',
        focus: 'Active adductor flexibility and hip opening',
        duration: 60,
        symbol: 'figure.pancake',
        instructions: ['Sit in widest comfortable straddle', 'Reach arms forward walking fingers', 'Lower chest with flat spine'],
      },
      {
        name: 'Wall-Supported Hook Sweep',
        focus: 'Glute medius activation and hook whip',
        duration: 45,
        symbol: 'figure.leg.swings',
        instructions: ['Support hands on wall', 'Chamber knee across chest', 'Whip heel in horizontal arc, holding 2 seconds at peak'],
      },
    ],
  },

  judo: {
    artId: 'judo',
    nativeName: '柔道',
    country: 'Japan',
    flag: '🇯🇵',
    accent: 'var(--slate)',
    symbol: '🇯🇵',
    tagline: 'Gentle way. Strong hips. Strong grips.',
    history: 'Founded by Jigoro Kano in 1882 in Tokyo as a modern martial discipline transformed from classical jujutsu. Masters the mechanics of balance breaking (kuzushi) and dynamic throws.',
    philosophy: 'Maximum efficiency with minimum effort (Seiryoku Zenyo) and mutual welfare and benefit (Jita Kyoei).',
    mobilityFocus: ['Hip rotation for Uchi-Mata & Harai-Goshi', 'Deep squat entries for Seoi-Nage', 'Thoracic rotation for throwing torque', 'Grip, wrist, and scapular health'],
    benchmarks: [
      {
        id: 'judo_uchi_mata',
        name: 'Uchi-Mata Hip Rotation',
        description: 'Single-leg balance and rear leg upward sweep flexibility.',
        levels: [
          { level: 1, title: 'Single Leg Hinge 45°', target: 'Balance on one leg with back leg 45° high' },
          { level: 2, title: 'Horizontal Torso T-Hold', target: 'Hold flat T-shape for 20s with neutral hips' },
          { level: 3, title: 'Rear Leg Elevated 120°', target: 'Sweep attacking leg past horizontal cleanly' },
          { level: 4, title: 'Full Sweep Arc 145°', target: 'Deep forward torso drop with leg 145° overhead' },
          { level: 5, title: 'Kano Grand Sweep', target: 'Effortless explosive entry with maximum rear clearance' },
        ],
      },
      {
        id: 'judo_seoi_squat',
        name: 'Seoi-Nage Deep Drop',
        description: 'Low center of gravity squat mobility for shoulder throw entries.',
        levels: [
          { level: 1, title: 'Assisted Low Squat', target: 'Hold low squat using pole/gi for balance' },
          { level: 2, title: 'Unassisted Flat Squat', target: 'Full depth flat-footed squat hold for 45s' },
          { level: 3, title: 'Narrow Stance Drop', target: 'Drop under hips with feet hip-width apart' },
          { level: 4, title: 'Turn-In Low Squat', target: '180° spin directly into deep loaded crouch' },
          { level: 5, title: 'Explosive Drop Seoi', target: 'Instant floor-level entry without knee stress' },
        ],
      },
      {
        id: 'judo_grip_wrist',
        name: 'Grip & Scapular Range',
        description: 'Forearm, wrist and lat flexibility under intense gi friction.',
        levels: [
          { level: 1, title: 'Wrist Flexion 90°', target: 'Full 90° bend backward and forward comfortably' },
          { level: 2, title: 'Shoulder Cross Stretch', target: 'Arm clasps flush against collarbone' },
          { level: 3, title: 'Lat Prayer Bench', target: 'Deep stretch of upper lats and triceps' },
          { level: 4, title: 'Rotational Pull Mobility', target: 'Fluid kuzushi rotation with loaded arms' },
          { level: 5, title: 'Iron Grip Resilience', target: 'Zero joint stiffness after hours of kumikata' },
        ],
      },
    ],
    routineGoals: [
      {
        title: 'Throwing Torque & Spine',
        description: 'Opens thoracic cage and obliques to generate explosive rotational kuzushi.',
        duration: 900,
        exercisesCount: 6,
        accent: 'var(--slate)',
        symbol: 'figure.thoracic.twist',
      },
      {
        title: 'Low Hip Entry Squat',
        description: 'Builds ankle and hip flexion to drop beneath an opponent’s center of gravity.',
        duration: 720,
        exercisesCount: 5,
        accent: 'var(--ember)',
        symbol: 'figure.deep.squat',
      },
      {
        title: 'Breakfall (Ukemi) Recovery',
        description: 'Soothes spine, neck, and shoulders after heavy throwing sessions.',
        duration: 600,
        exercisesCount: 5,
        accent: 'var(--jade)',
        symbol: 'figure.cobra',
      },
    ],
    drills: [
      {
        name: 'Uchi-Mata Balance Sweep',
        focus: 'Single leg hamstring hinge and glute drive',
        duration: 60,
        symbol: 'figure.hamstring.standing',
        instructions: ['Plant base foot, turn heel inward', 'Hinge forward driving chest down', 'Sweep back leg as high as possible, holding 2 seconds'],
      },
      {
        name: 'Deep Kuzushi Pivot',
        focus: '180° rotation and ankle flexion',
        duration: 45,
        symbol: 'figure.cossack',
        instructions: ['Step across, spin 180° on ball of foot', 'Drop hips below knee level', 'Maintain upright torso and strong collar frame'],
      },
    ],
  },

  mma: {
    artId: 'mma',
    nativeName: 'Mixed Martial Arts',
    country: 'Worldwide',
    flag: '🌍',
    accent: 'var(--ember)',
    symbol: '🌍',
    tagline: 'Striking. Wrestling. Submissions. Fluid adaptation.',
    history: 'Modern combat sport uniting boxing, wrestling, jiu-jitsu, muay thai, and karate inside the cage. Requires rapid transitions between standing, clinching, and grappling.',
    philosophy: 'Absolute adaptability: mastering all ranges of combat without dogma, finding victory through complete versatility.',
    mobilityFocus: ['Dynamic scramble elasticity', 'Sprawl hip extension', 'Cage clinch posture', 'High guard and kicking agility'],
    benchmarks: [
      {
        id: 'mma_scramble',
        name: 'Scramble Hip Elasticity',
        description: 'Fluidity in exploding from bottom turtle to standing base.',
        levels: [
          { level: 1, title: 'Base Recovery', target: 'Post hand and stand up safely in 2 seconds' },
          { level: 2, title: 'Hip Switch Scramble', target: 'Quick sit-out and reverse without hesitating' },
          { level: 3, title: 'Granby to Single Leg', target: 'Invert and shoot straight to standing single' },
          { level: 4, title: 'Cage Wall Walk', target: 'Push off cage from back to feet under pressure' },
          { level: 5, title: 'Championship Scramble', target: 'Zero dead spots transitioning between ranges' },
        ],
      },
      {
        id: 'mma_sprawl',
        name: 'Sprawl Hip Drive',
        description: 'Explosive hip extension to stuff double and single leg takedowns.',
        levels: [
          { level: 1, title: 'Floor Sprawl Hold', target: 'Drop hips flush to floor with chest up' },
          { level: 2, title: 'Quick Retraction Sprawl', target: 'Drop into sprawl and bounce back in 1 second' },
          { level: 3, title: 'Heavy Hip Angle Turn', target: 'Turn top hip down onto imaginary shot' },
          { level: 4, title: 'Double Shot Defense', target: 'Two consecutive deep sprawls with perfect base' },
          { level: 5, title: 'Unpenetrable Defense', target: 'Instant hips-back reaction with zero hesitation' },
        ],
      },
      {
        id: 'mma_total_range',
        name: 'Octagon Total Range',
        description: 'Full-body active flexibility across striking and submission defense.',
        levels: [
          { level: 1, title: 'Dual Base Stance', target: 'Comfort in both orthodox and southpaw stances' },
          { level: 2, title: 'High Kick & Shoot', target: 'Head kick directly into double-leg level drop' },
          { level: 3, title: 'Guard Defense Flex', target: 'Survive heavy top pressure without hip lockdown' },
          { level: 4, title: 'All-Range Flow', target: '90s continuous flow from clinch to ground to feet' },
          { level: 5, title: 'Five-Round Mobility', target: 'Retain 100% flexibility in round 5 of combat' },
        ],
      },
    ],
    routineGoals: [
      {
        title: 'Full Combat Scramble',
        description: 'Comprehensive mobility protocol targeting hips, shoulders, spine, and groin.',
        duration: 960,
        exercisesCount: 7,
        accent: 'var(--ember)',
        symbol: 'figure.worlds.greatest',
      },
      {
        title: 'Takedown & Sprawl Hips',
        description: 'Opens hip flexors and activates glutes for explosive level changes and takedown defense.',
        duration: 780,
        exercisesCount: 6,
        accent: 'var(--crimson)',
        symbol: 'figure.lunge.hip',
      },
      {
        title: 'Post-Fight Whole Body Reset',
        description: 'Gentle traction and decompression for joints and connective tissue after hard sparring.',
        duration: 660,
        exercisesCount: 5,
        accent: 'var(--jade)',
        symbol: 'figure.childs.lat',
      },
    ],
    drills: [
      {
        name: 'World’s Greatest Stretch Scramble',
        focus: 'Thoracic rotation and hip capsule expansion',
        duration: 60,
        symbol: 'figure.worlds.greatest',
        instructions: ['Step into deep lunge', 'Drop inside elbow to floor', 'Rotate arm to ceiling, tracking with eyes'],
      },
      {
        name: 'Sprawl to Standup Spring',
        focus: 'Hip drive and explosive recovery',
        duration: 45,
        symbol: 'figure.cobra',
        instructions: ['Drop hips hard to floor with toes dug in', 'Instantly post hands and pop feet under hips', 'Return to balanced fight stance'],
      },
    ],
  },
}

// Fallback generator for other arts (boxing, kickboxing, wrestling, wushu, taichi, aikido)
export function getDojoProfile(artId: string): MartialDojoProfile {
  if (MARTIAL_DOJO_PROFILES[artId]) return MARTIAL_DOJO_PROFILES[artId]

  const flags: Record<string, { flag: string; country: string; native: string; tagline: string; accent: string }> = {
    boxing: { flag: '🇬🇧', country: 'United Kingdom', native: 'Sweet Science', tagline: 'Rhythm, head movement, and rotational torque.', accent: 'var(--ember)' },
    kickboxing: { flag: '🇳🇱', country: 'Netherlands', native: 'Dutch Kickboxing', tagline: 'Relentless combinations and thunderous low kicks.', accent: 'var(--gold)' },
    wrestling: { flag: '🇬🇷', country: 'International', native: 'Grappling Arts', tagline: 'Unmatched explosive power and bridge resilience.', accent: 'var(--crimson)' },
    wushu: { flag: '🇨🇳', country: 'China', native: '中华武术', tagline: 'Fluid acrobatics, deep drop stances, and aerial elegance.', accent: 'var(--sakura)' },
    taichi: { flag: '🇨🇳', country: 'China', native: '太极拳', tagline: 'Harmonious weight shifts, deep breath, and internal flow.', accent: 'var(--jade)' },
    aikido: { flag: '🇯🇵', country: 'Japan', native: '合気道', tagline: 'Circular blending, joint redirection, and wrist mobility.', accent: 'var(--indigo)' },
  }

  const meta = flags[artId] || { flag: '🥋', country: 'Dojo Tradition', native: 'Martial Way', tagline: 'Discipline, breath, and active range.', accent: 'var(--accent)' }

  return {
    artId,
    nativeName: meta.native,
    country: meta.country,
    flag: meta.flag,
    accent: meta.accent,
    symbol: meta.flag,
    tagline: meta.tagline,
    history: `Ancient combat and mobility traditions refined through generations of dedicated practice in ${meta.country}.`,
    philosophy: 'Cultivating bodily mastery, structural freedom, and centered mental focus through mindful mobility.',
    mobilityFocus: ['Hip and pelvic freedom', 'Spinal rotation and decompression', 'Joint resilience and tendon conditioning', 'Post-training recovery'],
    benchmarks: [
      {
        id: `${artId}_flex_1`,
        name: 'Discipline Stance Range',
        description: 'Core functional mobility required for traditional stances.',
        levels: [
          { level: 1, title: 'Initiate Base', target: 'Hold basic stance comfortably for 45 seconds' },
          { level: 2, title: 'Deep Sink Base', target: 'Lower hips below 45° with upright spine' },
          { level: 3, title: 'Fluid Weight Shift', target: 'Transition between stances with zero rise' },
          { level: 4, title: 'Advanced Root', target: 'Hold low deep posture with relaxed breath for 90s' },
          { level: 5, title: 'Mastery Depth', target: 'Effortless structural stability at maximum depth' },
        ],
      },
      {
        id: `${artId}_flex_2`,
        name: 'Dynamic Reach & Torque',
        description: 'Rotational thoracic and limb extension for martial techniques.',
        levels: [
          { level: 1, title: 'Neutral Rotation', target: 'Turn shoulders 90° with hips grounded' },
          { level: 2, title: 'Extended Reach', target: 'Full horizontal extension with lateral lean' },
          { level: 3, title: 'High Target Lock', target: 'Deliver technique to head height without strain' },
          { level: 4, title: 'Dynamic Snap', target: 'Snap full range and recover immediately' },
          { level: 5, title: 'Flow State Torque', target: 'Effortless kinetic chain transfer without tension' },
        ],
      },
      {
        id: `${artId}_flex_3`,
        name: 'Joint & Tendon Armor',
        description: 'Resilience and flexibility in the wrists, ankles, and spine.',
        levels: [
          { level: 1, title: 'Full Joint Warmth', target: 'No stiffness in morning or pre-training' },
          { level: 2, title: 'Ground Contact Grip', target: 'Flexibility across all planes without clicking' },
          { level: 3, title: 'Loaded Range Hold', target: 'Hold joint at edge of tension comfortably' },
          { level: 4, title: 'Impact Absorption', target: 'Absorb forces without joint compression' },
          { level: 5, title: 'Unbreakable Foundation', target: 'Optimal recovery and zero training limitations' },
        ],
      },
    ],
    routineGoals: [
      {
        title: 'Discipline Core Mobility',
        description: 'Essential joint mobility and muscle lengthening tailored to this art.',
        duration: 900,
        exercisesCount: 6,
        accent: meta.accent,
        symbol: 'figure.flexibility',
      },
      {
        title: 'Deep Stance Power',
        description: 'Opens hips, groin, and ankles to build rooted endurance.',
        duration: 720,
        exercisesCount: 5,
        accent: 'var(--gold)',
        symbol: 'figure.lunge.hip',
      },
      {
        title: 'Post-Training Reset',
        description: 'Decompresses muscles and joints after hard training sessions.',
        duration: 600,
        exercisesCount: 5,
        accent: 'var(--jade)',
        symbol: 'figure.childs.lat',
      },
    ],
    drills: [
      {
        name: 'Discipline Stance Flow',
        focus: 'Hip fluidity and balance transitions',
        duration: 60,
        symbol: 'figure.cossack',
        instructions: ['Sink into low base stance', 'Shift weight smoothly without rising', 'Maintain steady nasal breathing'],
      },
      {
        name: 'Kinetic Chain Rotation',
        focus: 'Thoracic and hip rotational decoupling',
        duration: 45,
        symbol: 'figure.thoracic.twist',
        instructions: ['Plant feet firmly in fight stance', 'Rotate torso fully, driving from rear hip', 'Keep shoulders relaxed and chin tucked'],
      },
    ],
  }
}
