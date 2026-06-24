window.EXERCISES = {
  // WARMUP (category: 'warmup', discipline: 'general')
  'jumping_jacks': {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    category: 'warmup',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'A classic full-body cardio warmup that raises your heart rate and gets blood flowing.',
    instructions: [
      'Stand upright with your legs together and arms at your sides.',
      'Bend your knees slightly and jump into the air.',
      'As you jump, spread your legs to be about shoulder-width apart and stretch your arms out and over your head.',
      'Jump back to the starting position.'
    ],
    tips: 'Land softly on the balls of your feet to protect your joints.',
    difficulty: 1,
    targetArea: ['full body', 'cardio'],
    icon: '🏃'
  },
  'high_knees': {
    id: 'high_knees',
    name: 'High Knees',
    category: 'warmup',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: null,
    description: 'An intensive cardio exercise that also engages the core and strengthens the legs.',
    instructions: [
      'Stand with feet hip-width apart.',
      'Lift your left knee to your chest.',
      'Switch to lift your right knee to your chest.',
      'Continue alternating legs, moving at a running or sprinting pace.'
    ],
    tips: 'Pump your arms to maintain momentum and balance.',
    difficulty: 2,
    targetArea: ['legs', 'core', 'cardio'],
    icon: '🔥'
  },
  'butt_kicks': {
    id: 'butt_kicks',
    name: 'Butt Kicks',
    category: 'warmup',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: null,
    description: 'A jogging exercise that targets the hamstrings while warming up the body.',
    instructions: [
      'Stand tall with feet hip-width apart.',
      'Start jogging in place.',
      'Bring your heels up to touch your glutes with every step.'
    ],
    tips: 'Keep your torso upright; do not lean forward.',
    difficulty: 1,
    targetArea: ['hamstrings', 'cardio'],
    icon: '🏃‍♂️'
  },
  'arm_circles': {
    id: 'arm_circles',
    name: 'Arm Circles',
    category: 'warmup',
    discipline: 'general',
    duration: 30,
    sets: 1,
    reps: null,
    description: 'Dynamic warmup to loosen the shoulder joints and upper back.',
    instructions: [
      'Stand straight with feet shoulder-width apart.',
      'Extend your arms parallel to the floor.',
      'Circle your arms forward in small, controlled motions.',
      'Gradually increase the size of the circles, then reverse direction halfway.'
    ],
    tips: 'Keep your core engaged to prevent swaying.',
    difficulty: 1,
    targetArea: ['shoulders', 'upper back'],
    icon: '⭕'
  },
  'hip_circles': {
    id: 'hip_circles',
    name: 'Hip Circles',
    category: 'warmup',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Loosens the lower back and hips, essential for kicking.',
    instructions: [
      'Stand with feet slightly wider than shoulder-width.',
      'Place hands on your hips.',
      'Slowly rotate your hips in large circles (like using a hula hoop).',
      'Change direction halfway through the time.'
    ],
    tips: 'Keep your head and shoulders as still as possible while moving your hips.',
    difficulty: 1,
    targetArea: ['hips', 'lower back'],
    icon: '🔄'
  },
  'ankle_rotations': {
    id: 'ankle_rotations',
    name: 'Ankle Rotations',
    category: 'warmup',
    discipline: 'general',
    duration: 40,
    sets: 1,
    reps: null,
    description: 'Prepares the ankles for impact and balance work.',
    instructions: [
      'Stand on one leg (hold a wall if needed).',
      'Lift the other foot slightly off the ground.',
      'Slowly rotate the ankle in full circles.',
      'Switch directions, then switch feet.'
    ],
    tips: 'Draw the largest circle possible with your toes.',
    difficulty: 1,
    targetArea: ['ankles'],
    icon: '🦶'
  },
  'torso_twists': {
    id: 'torso_twists',
    name: 'Standing Torso Twists',
    category: 'warmup',
    discipline: 'general',
    duration: 30,
    sets: 1,
    reps: null,
    description: 'Warms up the spine and core for rotational movements.',
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Hold your arms up at chest level, elbows bent.',
      'Twist your torso to the left, then to the right in a continuous motion.'
    ],
    tips: 'Let your trailing heel lift off the ground slightly as you twist.',
    difficulty: 1,
    targetArea: ['core', 'spine'],
    icon: '🌪️'
  },
  'light_jog': {
    id: 'light_jog',
    name: 'Light Jog in Place',
    category: 'warmup',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'A simple way to steadily raise the heart rate.',
    instructions: [
      'Stand upright.',
      'Begin jogging in place at a comfortable, steady pace.',
      'Coordinate your arm swings with your steps.'
    ],
    tips: 'Breathe rhythmically throughout the jog.',
    difficulty: 1,
    targetArea: ['cardio'],
    icon: '🏃‍♀️'
  },
  'jump_rope_sim': {
    id: 'jump_rope_sim',
    name: 'Jump Rope Simulation',
    category: 'warmup',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Mimics jumping rope to build calf endurance and cardio.',
    instructions: [
      'Keep your feet close together and hands by your sides.',
      'Make small, circular motions with your wrists as if holding a rope.',
      'Hop lightly on the balls of your feet.'
    ],
    tips: 'Stay light on your feet; you only need to jump an inch or two high.',
    difficulty: 2,
    targetArea: ['calves', 'cardio'],
    icon: '➰'
  },
  'shoulder_rolls': {
    id: 'shoulder_rolls',
    name: 'Shoulder Rolls',
    category: 'warmup',
    discipline: 'general',
    duration: 30,
    sets: 1,
    reps: null,
    description: 'Releases tension in the neck and shoulders.',
    instructions: [
      'Stand with arms relaxed at your sides.',
      'Shrug your shoulders up toward your ears.',
      'Roll them backward, down, and forward in a smooth circular motion.',
      'Reverse direction halfway through.'
    ],
    tips: 'Breathe deeply, exhaling as the shoulders drop.',
    difficulty: 1,
    targetArea: ['shoulders', 'neck'],
    icon: '🤷'
  },

  // DYNAMIC STRETCHING (category: 'dynamic', discipline: 'general')
  'leg_swings_front': {
    id: 'leg_swings_front',
    name: 'Front Leg Swings',
    category: 'dynamic',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '10 each side',
    description: 'Dynamic stretch for the hamstrings and hip flexors.',
    instructions: [
      'Stand next to a wall for support.',
      'Swing your outside leg forward and backward continuously.',
      'Keep the swinging leg relatively straight but not locked.',
      'Gradually increase the height of the swing.'
    ],
    tips: 'Keep your torso upright; don\'t bend forward to meet your leg.',
    difficulty: 1,
    targetArea: ['hamstrings', 'hip flexors'],
    icon: '🦵'
  },
  'leg_swings_side': {
    id: 'leg_swings_side',
    name: 'Side Leg Swings',
    category: 'dynamic',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '10 each side',
    description: 'Dynamic stretch for the adductors and abductors.',
    instructions: [
      'Face a wall and place both hands on it for support.',
      'Swing one leg side-to-side in front of the other leg.',
      'Gradually increase the range of motion as your hip loosens.'
    ],
    tips: 'Keep your toes pointing forward during the swing.',
    difficulty: 1,
    targetArea: ['adductors', 'abductors'],
    icon: '↔️'
  },
  'hip_cars': {
    id: 'hip_cars',
    name: 'Hip CARs',
    category: 'dynamic',
    discipline: 'general',
    duration: 90,
    sets: 1,
    reps: '5 each side',
    description: 'Controlled Articular Rotations for maximum hip joint health and mobility.',
    instructions: [
      'Stand holding a wall or stick for balance.',
      'Bring one knee up towards your chest as high as possible.',
      'Rotate the knee out to the side.',
      'Internally rotate the hip, pushing the foot back as if kicking behind you.',
      'Return to start, then reverse the motion.'
    ],
    tips: 'Move slowly and intentionally. The rest of your body must remain frozen.',
    difficulty: 2,
    targetArea: ['hip joint capsule'],
    icon: '⚙️'
  },
  'walking_lunges': {
    id: 'walking_lunges',
    name: 'Walking Lunges',
    category: 'dynamic',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '10 each side',
    description: 'Builds active mobility in the hip flexors and strength in the legs.',
    instructions: [
      'Take a large step forward.',
      'Lower your hips until both knees are bent at a 90-degree angle.',
      'Push off the back foot to step forward into the next lunge.'
    ],
    tips: 'Keep your chest up and front knee behind your toes.',
    difficulty: 2,
    targetArea: ['quads', 'glutes', 'hip flexors'],
    icon: '🚶'
  },
  'cossack_squats': {
    id: 'cossack_squats',
    name: 'Cossack Squats',
    category: 'dynamic',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'Deep lateral lunge that drastically improves hip and groin mobility.',
    instructions: [
      'Stand with legs very wide.',
      'Squat down on one leg, keeping the other leg perfectly straight.',
      'On the straight leg, point the toes up toward the ceiling.',
      'Stay low as you shift your weight to the other side.'
    ],
    tips: 'Try to keep the heel of your bent leg on the floor.',
    difficulty: 3,
    targetArea: ['adductors', 'hips', 'ankles'],
    icon: '🕷️'
  },
  'inchworms': {
    id: 'inchworms',
    name: 'Inchworms',
    category: 'dynamic',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '6 reps',
    description: 'Great dynamic stretch for the entire posterior chain and core.',
    instructions: [
      'Stand tall, then bend at the hips and place hands on the floor (bend knees slightly if needed).',
      'Walk your hands forward until you are in a plank position.',
      'Walk your feet forward toward your hands, keeping legs straight.',
      'Repeat the process.'
    ],
    tips: 'Take small steps with your feet to maximize the hamstring stretch.',
    difficulty: 2,
    targetArea: ['hamstrings', 'calves', 'core'],
    icon: '🐛'
  },
  'worlds_greatest': {
    id: 'worlds_greatest',
    name: "World's Greatest Stretch",
    category: 'dynamic',
    discipline: 'general',
    duration: 90,
    sets: 1,
    reps: '5 each side',
    description: 'A compound stretch targeting hips, thoracic spine, and hamstrings.',
    instructions: [
      'Step forward into a deep lunge.',
      'Place both hands on the floor inside the front foot.',
      'Drop your inside elbow toward the floor.',
      'Rotate your torso and reach that same arm up to the ceiling.',
      'Bring the hand down, straighten the front leg for a hamstring stretch, then switch sides.'
    ],
    tips: 'Follow your reaching hand with your eyes.',
    difficulty: 2,
    targetArea: ['hips', 'thoracic spine', 'hamstrings'],
    icon: '🌍'
  },
  'scorpion_stretch': {
    id: 'scorpion_stretch',
    name: 'Scorpion Stretch',
    category: 'dynamic',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'Dynamic stretch for the hip flexors, quads, and lower back.',
    instructions: [
      'Lie face down with arms extended straight out to the sides (T-shape).',
      'Lift your right leg, bend the knee, and reach the foot across your body toward your left hand.',
      'Return to center and switch sides.'
    ],
    tips: 'Try to keep your shoulders flat on the ground.',
    difficulty: 2,
    targetArea: ['hip flexors', 'lower back'],
    icon: '🦂'
  },
  'knee_hugs': {
    id: 'knee_hugs',
    name: 'Walking Knee Hugs',
    category: 'dynamic',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '10 each side',
    description: 'Dynamic stretch for the glutes and hips.',
    instructions: [
      'While walking, lift one knee toward your chest.',
      'Grab just below the knee with both hands and pull it snugly to your chest.',
      'Release, step forward, and repeat with the other leg.'
    ],
    tips: 'Stand tall; pull the knee to your chest, don\'t bend your chest to your knee.',
    difficulty: 1,
    targetArea: ['glutes', 'hips'],
    icon: '🫂'
  },
  'quad_pulls': {
    id: 'quad_pulls',
    name: 'Walking Quad Pulls',
    category: 'dynamic',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '10 each side',
    description: 'Dynamic stretch for the quadriceps and hip flexors.',
    instructions: [
      'While walking, kick one heel up toward your glutes.',
      'Reach back and grab your foot with the corresponding hand.',
      'Pull the heel close to your glute while reaching the opposite arm straight up.',
      'Release, step forward, and switch sides.'
    ],
    tips: 'Keep your knees close together when pulling the foot up.',
    difficulty: 1,
    targetArea: ['quads', 'hip flexors'],
    icon: '🦵'
  },

  // TECHNIQUE - WUSHU
  'horse_stance': {
    id: 'horse_stance',
    name: 'Horse Stance (Ma Bu)',
    category: 'technique',
    discipline: 'wushu',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'The fundamental stance of Wushu, building incredible leg strength and mental fortitude.',
    instructions: [
      'Stand with feet about 3 shoulder-widths apart, toes pointing forward.',
      'Bend knees and drop hips as if sitting on a horse.',
      'Keep your thighs as close to parallel to the ground as possible.',
      'Keep your back perfectly straight and chest lifted.',
      'Hands are typically chambered at the hips.'
    ],
    tips: 'Push your knees outward so they track over your toes. Do not let them collapse inward.',
    difficulty: 2,
    targetArea: ['quads', 'glutes', 'core'],
    icon: '🐴'
  },
  'bow_stance': {
    id: 'bow_stance',
    name: 'Bow Stance (Gong Bu)',
    category: 'technique',
    discipline: 'wushu',
    duration: 60,
    sets: 1,
    reps: '30s each side',
    description: 'An aggressive forward stance used for power generation.',
    instructions: [
      'Step one leg far forward.',
      'Bend the front knee so the thigh is nearly parallel to the floor (knee over toe).',
      'Keep the back leg perfectly straight with the foot angled slightly outward.',
      'Keep your torso upright and square your hips forward.'
    ],
    tips: 'Press the outer edge of the back foot firmly into the ground.',
    difficulty: 2,
    targetArea: ['legs', 'hip flexors'],
    icon: '🏹'
  },
  'empty_stance': {
    id: 'empty_stance',
    name: 'Empty Stance (Xu Bu)',
    category: 'technique',
    discipline: 'wushu',
    duration: 40,
    sets: 1,
    reps: '20s each side',
    description: 'A stance emphasizing balance, with nearly all weight on the rear leg.',
    instructions: [
      'Place 90% of your weight on a deeply bent rear leg.',
      'Extend the front leg slightly with the knee slightly bent.',
      'Only the tip of the front toe lightly touches the ground (empty).',
      'Keep the back straight.'
    ],
    tips: 'You should be able to lift the front foot at any time without shifting your weight.',
    difficulty: 3,
    targetArea: ['quads', 'balance'],
    icon: '🪶'
  },
  'crouch_stance': {
    id: 'crouch_stance',
    name: 'Crouching Stance (Pu Bu)',
    category: 'technique',
    discipline: 'wushu',
    duration: 40,
    sets: 1,
    reps: '20s each side',
    description: 'A very low stance used for evasion and low sweeps.',
    instructions: [
      'Squat completely down on one leg, keeping the heel on the floor.',
      'Extend the other leg perfectly straight out to the side.',
      'Both feet must remain flat on the ground.',
      'Keep your torso as upright as possible.'
    ],
    tips: 'If your heel lifts, widen your stance slightly or work on ankle mobility.',
    difficulty: 3,
    targetArea: ['adductors', 'ankles', 'hips'],
    icon: '🐅'
  },
  'front_stretch_kick': {
    id: 'front_stretch_kick',
    name: 'Front Stretch Kick (Zheng Ti Tui)',
    category: 'technique',
    discipline: 'wushu',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'A dynamic, straight-leg kick to develop active hamstring flexibility.',
    instructions: [
      'Stand tall, arms out to the sides for balance.',
      'Step forward and kick the back leg straight up toward your face.',
      'Keep the kicking leg perfectly straight (locked knee).',
      'Snap the leg up explosively, then let it fall naturally.'
    ],
    tips: 'Do not bend your upper body forward to meet the leg. Stay tall.',
    difficulty: 2,
    targetArea: ['hamstrings', 'hip flexors'],
    icon: '🦵'
  },
  'crescent_kick_out': {
    id: 'crescent_kick_out',
    name: 'Outside Crescent Kick (Wai Bai Tui)',
    category: 'technique',
    discipline: 'wushu',
    duration: 60,
    sets: 1,
    reps: '6 each side',
    description: 'An arcing kick that develops hip mobility and rotational control.',
    instructions: [
      'Stand tall. Kick one leg up across the center line of your body.',
      'Draw a large outward circle in the air with your foot.',
      'The leg must remain perfectly straight throughout the entire arc.',
      'Slap the outside of your foot with your hand at the apex.'
    ],
    tips: 'Use the twisting of your waist to generate the circular power.',
    difficulty: 2,
    targetArea: ['hips', 'waist'],
    icon: '🌙'
  },
  'crescent_kick_in': {
    id: 'crescent_kick_in',
    name: 'Inside Crescent Kick',
    category: 'technique',
    discipline: 'wushu',
    duration: 60,
    sets: 1,
    reps: '6 each side',
    description: 'The reverse of the outside crescent, swinging from outside to inside.',
    instructions: [
      'Kick the leg up on the outside of your shoulder line.',
      'Draw a large inward circle across your body line.',
      'Leg remains perfectly straight.',
      'Slap the bottom/inside of the foot with the opposite hand at the apex.'
    ],
    tips: 'Keep the supporting leg straight and grounded.',
    difficulty: 2,
    targetArea: ['hips', 'groin'],
    icon: '🌘'
  },
  'stance_transitions': {
    id: 'stance_transitions',
    name: 'Stance Transitions Flow',
    category: 'technique',
    discipline: 'wushu',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Moving fluidly between fundamental Wushu stances.',
    instructions: [
      'Start in Horse Stance (Ma Bu).',
      'Pivot the feet and turn hips to transition into Bow Stance (Gong Bu).',
      'Shift weight back, straighten front leg into Empty Stance (Xu Bu).',
      'Drop down into Crouching Stance (Pu Bu).',
      'Rise back to Horse Stance and repeat on the other side.'
    ],
    tips: 'Maintain a consistent, low height of the head throughout transitions.',
    difficulty: 3,
    targetArea: ['legs', 'coordination', 'balance'],
    icon: '🌊'
  },

  // TECHNIQUE - MUAY THAI
  'mt_guard': {
    id: 'mt_guard',
    name: 'Muay Thai Guard Stance',
    category: 'technique',
    discipline: 'muaythai',
    duration: 30,
    sets: 1,
    reps: null,
    description: 'The fundamental tall, square stance of Muay Thai.',
    instructions: [
      'Stand with feet shoulder-width apart, lead foot pointing forward, rear foot angled 45 degrees.',
      'Keep weight mostly on the back foot, front heel slightly raised (ready to check kicks).',
      'Hands high (at eyebrow level), palms facing forward.',
      'Elbows tucked slightly to protect the ribs.',
      'Tuck your chin behind your lead shoulder.'
    ],
    tips: 'Stay light and bouncing slightly on the balls of your feet.',
    difficulty: 1,
    targetArea: ['posture', 'balance'],
    icon: '🛡️'
  },
  'mt_jab_cross': {
    id: 'mt_jab_cross',
    name: 'Jab-Cross Combo',
    category: 'technique',
    discipline: 'muaythai',
    duration: 60,
    sets: 1,
    reps: '10 reps',
    description: 'Basic 1-2 punch combination emphasizing rotation.',
    instructions: [
      'From guard, throw the lead hand straight out (Jab), turning the fist over.',
      'Quickly retract the jab to your guard.',
      'Throw the rear hand straight (Cross), pivoting powerfully on the rear foot and twisting the hips.',
      'Retract immediately back to guard.'
    ],
    tips: 'Power comes from the floor through the hip twist, not just the arms.',
    difficulty: 1,
    targetArea: ['shoulders', 'core rotation'],
    icon: '🥊'
  },
  'mt_roundhouse': {
    id: 'mt_roundhouse',
    name: 'Roundhouse Kick Shadow',
    category: 'technique',
    discipline: 'muaythai',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'The devastating, hip-driven Muay Thai roundhouse kick.',
    instructions: [
      'Step out slightly with the lead foot at a 45-degree angle on the ball of the foot.',
      'Swing the kicking leg like a baseball bat, keeping it relatively straight.',
      'Pivot entirely on the base foot—your heel should point at the target at impact.',
      'Turn your hips over entirely.',
      'Swing the same-side arm down for counterbalance.'
    ],
    tips: 'Strike with the lower shin, not the foot. If shadow kicking, spin all the way through 360 degrees.',
    difficulty: 3,
    targetArea: ['hips', 'core', 'balance'],
    icon: '🌪️'
  },
  'mt_teep': {
    id: 'mt_teep',
    name: 'Teep (Push Kick)',
    category: 'technique',
    discipline: 'muaythai',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'A straight push kick used to manage distance and disrupt balance.',
    instructions: [
      'Raise the knee of the kicking leg high to the chest.',
      'Thrust the hips forward and extend the leg straight out.',
      'Strike with the ball of the foot.',
      'Lean the torso slightly back for counterbalance and range.',
      'Retract quickly to guard.'
    ],
    tips: 'It\'s a push, not a snap. Use your hips to generate the pushing force.',
    difficulty: 2,
    targetArea: ['hip flexors', 'balance'],
    icon: '🥾'
  },
  'mt_knee_strike': {
    id: 'mt_knee_strike',
    name: 'Knee Strike',
    category: 'technique',
    discipline: 'muaythai',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'A powerful close-range strike utilizing the hips.',
    instructions: [
      'Step forward slightly with the lead foot.',
      'Drive the rear knee forcefully upward and forward.',
      'Point the toes of the kicking leg down to expose the kneecap.',
      'Thrust the hips forward at the apex of the strike.',
      'Pull arms down past your hip to add force (clinch simulation).'
    ],
    tips: 'The power comes from thrusting the hips forward, not just lifting the leg.',
    difficulty: 2,
    targetArea: ['hips', 'core'],
    icon: '💥'
  },
  'mt_elbow_strike': {
    id: 'mt_elbow_strike',
    name: 'Elbow Strike Basics',
    category: 'technique',
    discipline: 'muaythai',
    duration: 60,
    sets: 1,
    reps: '6 each side',
    description: 'Short-range slashing strikes utilizing the tip of the elbow.',
    instructions: [
      'From guard, keep the non-striking hand glued to your head.',
      'Step in, pivot the lead foot, and twist the hips.',
      'Slice the elbow horizontally across the target area.',
      'Keep the fist of the striking arm relaxed and near your chest.',
      'Recover instantly to guard.'
    ],
    tips: 'Imagine slashing with a blade on the tip of your elbow.',
    difficulty: 2,
    targetArea: ['shoulders', 'core rotation'],
    icon: '⚔️'
  },
  'mt_check': {
    id: 'mt_check',
    name: 'Kick Check (Shin Block)',
    category: 'technique',
    discipline: 'muaythai',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'The primary defense against leg and body kicks.',
    instructions: [
      'Lift the knee sharply toward the elbow on the same side.',
      'Point the toes slightly outward and flex the shin muscle.',
      'Keep the guard hand firmly glued to your head.',
      'Create a solid "wall" with your shin and elbow.',
      'Return the foot to the ground immediately.'
    ],
    tips: 'Meet the kick slightly by angling your shin out; do not just passively absorb it.',
    difficulty: 1,
    targetArea: ['hip flexors', 'balance'],
    icon: '🧱'
  },
  'mt_shadowbox': {
    id: 'mt_shadowbox',
    name: 'Shadowboxing Flow',
    category: 'technique',
    discipline: 'muaythai',
    duration: 90,
    sets: 1,
    reps: null,
    description: 'Freestyle combination of all Muay Thai techniques.',
    instructions: [
      'Move fluidly in your guard stance.',
      'Visualize an opponent and throw realistic combinations (e.g., Jab-Cross-Kick, Teep-Knee).',
      'Include defensive movements (checks, evasions).',
      'Focus on form, balance, and returning to guard after every strike.'
    ],
    tips: 'Keep it light and technical. Don\'t sacrifice form for speed.',
    difficulty: 3,
    targetArea: ['cardio', 'coordination'],
    icon: '👤'
  },

  // TECHNIQUE - TAI CHI
  'tc_breathing': {
    id: 'tc_breathing',
    name: 'Dan Tian Breathing',
    category: 'technique',
    discipline: 'taichi',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Fundamental abdominal breathing to center energy and focus.',
    instructions: [
      'Stand with feet shoulder-width, knees slightly bent.',
      'Place hands gently over the lower abdomen (Dan Tian).',
      'Inhale slowly through the nose, feeling the abdomen expand outward.',
      'Exhale slowly, feeling the abdomen gently contract.',
      'Keep the chest still; all movement is in the belly.'
    ],
    tips: 'Rest the tip of your tongue on the roof of your mouth behind your teeth.',
    difficulty: 1,
    targetArea: ['lungs', 'mind', 'core'],
    icon: '🌬️'
  },
  'tc_opening': {
    id: 'tc_opening',
    name: 'Opening & Closing Form',
    category: 'technique',
    discipline: 'taichi',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'The basic preparatory movement syncing breath with arm motion.',
    instructions: [
      'Stand with feet parallel, knees soft.',
      'Inhale: Slowly float both arms up in front of you to shoulder height, wrists relaxed.',
      'Exhale: Press the palms gently down to waist level, bending the knees slightly deeper.',
      'Repeat in a continuous, flowing loop.'
    ],
    tips: 'Imagine moving your arms through thick water.',
    difficulty: 1,
    targetArea: ['shoulders', 'relaxation'],
    icon: '🌊'
  },
  'tc_cloud_hands': {
    id: 'tc_cloud_hands',
    name: 'Cloud Hands',
    category: 'technique',
    discipline: 'taichi',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'A classic flowing sequence teaching weight transfer and waist rotation.',
    instructions: [
      'Stand wide, knees bent.',
      'Hold one hand high (face level, palm in) and one hand low (waist level, palm up).',
      'Turn the waist to the side of the high hand, shifting weight to that leg.',
      'Switch the hands (top goes down, bottom comes up).',
      'Turn the waist back to the other side, shifting weight.'
    ],
    tips: 'The arms do not move independently; they are carried by the turning of the waist.',
    difficulty: 2,
    targetArea: ['waist', 'coordination', 'legs'],
    icon: '☁️'
  },
  'tc_walking': {
    id: 'tc_walking',
    name: 'Tai Chi Walking',
    category: 'technique',
    discipline: 'taichi',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Mindful stepping practicing 100% weight transfer and balance.',
    instructions: [
      'Sink weight entirely into the right leg.',
      'Step the empty left foot forward, touching the heel down lightly.',
      'Slowly roll the weight forward into the left leg.',
      'Once 100% of weight is on the left leg, bring the empty right foot forward.',
      'Keep the body height consistent; do not bob up and down.'
    ],
    tips: 'Step like a cat on thin ice.',
    difficulty: 2,
    targetArea: ['balance', 'legs'],
    icon: '🐾'
  },
  'tc_brush_knee': {
    id: 'tc_brush_knee',
    name: 'Brush Knee & Push',
    category: 'technique',
    discipline: 'taichi',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'A fundamental martial application form combining block and strike.',
    instructions: [
      'Start in a bow stance.',
      'The lower hand brushes across the front knee (blocking a kick).',
      'Simultaneously, the upper hand pushes straight out from the shoulder (palm strike).',
      'Shift weight back, turn the waist, gather arms, and repeat on the other side.'
    ],
    tips: 'The power for the push comes from the back leg pushing into the ground.',
    difficulty: 2,
    targetArea: ['coordination', 'focus'],
    icon: '✋'
  },
  'tc_body_vibration': {
    id: 'tc_body_vibration',
    name: 'Body Vibration (Shaking)',
    category: 'technique',
    discipline: 'taichi',
    duration: 30,
    sets: 1,
    reps: null,
    description: 'Releases muscular tension and stimulates the nervous system.',
    instructions: [
      'Stand comfortably.',
      'Begin to bounce lightly on the heels, letting the vibration travel up the body.',
      'Let the arms, shoulders, and jaw go completely limp.',
      'Breathe deeply and naturally.'
    ],
    tips: 'Do not force the shaking; let it be a relaxed rebound from the ground.',
    difficulty: 1,
    targetArea: ['fascia', 'relaxation'],
    icon: '📳'
  },

  // TECHNIQUE - SANDA
  'sd_footwork': {
    id: 'sd_footwork',
    name: 'Sanda Footwork Drills',
    category: 'technique',
    discipline: 'sanda',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Rapid, springy footwork for closing distance and evading.',
    instructions: [
      'Adopt a fighting stance, slightly wider and lower than Muay Thai.',
      'Practice advancing: push off back foot, slide front foot forward, back foot follows.',
      'Practice retreating: push off front foot, slide back foot back, front foot follows.',
      'Keep stance width constant; never cross your feet.'
    ],
    tips: 'Stay on the balls of your feet. Movement should be explosive but grounded.',
    difficulty: 2,
    targetArea: ['calves', 'agility'],
    icon: '⚡'
  },
  'sd_jab_cross_hook': {
    id: 'sd_jab_cross_hook',
    name: 'Jab-Cross-Hook Combo',
    category: 'technique',
    discipline: 'sanda',
    duration: 60,
    sets: 1,
    reps: '10 reps',
    description: 'Standard boxing combination used heavily in Sanda.',
    instructions: [
      'Throw the Jab and Cross with full extension and hip rotation.',
      'After the Cross retracts, shift weight to back leg, raise lead elbow.',
      'Pivot lead foot and rip the Hook horizontally across.',
      'Return quickly to guard.'
    ],
    tips: 'Don\'t wind up the hook; throw it directly from the guard position.',
    difficulty: 2,
    targetArea: ['shoulders', 'core rotation'],
    icon: '🥊'
  },
  'sd_combo_kick': {
    id: 'sd_combo_kick',
    name: 'Punch-Kick Combination',
    category: 'technique',
    discipline: 'sanda',
    duration: 60,
    sets: 1,
    reps: '8 reps',
    description: 'Bridging the gap between hands and feet.',
    instructions: [
      'Throw a Jab-Cross to occupy the opponent\'s guard.',
      'As the Cross retracts, immediately launch a rear-leg Roundhouse or Side kick.',
      'Use the momentum of the retracting punch to generate rotational power for the kick.',
      'Return to stance quickly to defend against a takedown.'
    ],
    tips: 'The transition from punch to kick must be seamless, with no pause.',
    difficulty: 3,
    targetArea: ['coordination', 'flow'],
    icon: '💥'
  },
  'sd_pivot_drill': {
    id: 'sd_pivot_drill',
    name: 'Pivot Drills',
    category: 'technique',
    discipline: 'sanda',
    duration: 60,
    sets: 1,
    reps: '8 each direction',
    description: 'Crucial for changing angles and setting up throws.',
    instructions: [
      'From guard stance, plant the lead foot firmly.',
      'Swing the rear leg in a 90-degree arc behind you.',
      'Pivot entirely on the ball of the lead foot to face the new direction.',
      'Settle instantly into a solid stance.'
    ],
    tips: 'Whip your head around first to spot the new target; the body follows the head.',
    difficulty: 2,
    targetArea: ['agility', 'balance'],
    icon: '🔄'
  },
  'sd_shadow_spar': {
    id: 'sd_shadow_spar',
    name: 'Shadow Sparring (Sanda)',
    category: 'technique',
    discipline: 'sanda',
    duration: 90,
    sets: 1,
    reps: null,
    description: 'Simulating a Sanda match including strikes and takedown entries.',
    instructions: [
      'Move quickly in and out of range using Sanda footwork.',
      'Throw rapid punch-kick combinations.',
      'Include level changes: drop hips suddenly as if shooting for a leg catch or takedown.',
      'Visualize sprawling to defend against being taken down.'
    ],
    tips: 'Sanda is fast-paced. Keep your hands up and constantly change angles.',
    difficulty: 3,
    targetArea: ['cardio', 'overall conditioning'],
    icon: '🥷'
  },

  // TECHNIQUE - SHAOLIN
  'sl_five_stances': {
    id: 'sl_five_stances',
    name: 'Five Fundamental Stances Flow',
    category: 'technique',
    discipline: 'shaolin',
    duration: 90,
    sets: 1,
    reps: null,
    description: 'The core physical conditioning of Shaolin Kung Fu.',
    instructions: [
      'Hold each stance for ~3 seconds, then explode into the next.',
      'Sequence: Horse Stance (Ma Bu) -> Bow Stance (Gong Bu) -> Empty Stance (Xu Bu) -> Crouching Stance (Pu Bu) -> Resting Stance (Xie Bu, crossed legs squat).',
      'Focus on extremely low, powerful, rooted positions.'
    ],
    tips: 'Shaolin stances are often lower and wider than standard Wushu. Embrace the burn.',
    difficulty: 3,
    targetArea: ['leg strength', 'mental toughness'],
    icon: '🏯'
  },
  'sl_front_kick': {
    id: 'sl_front_kick',
    name: 'Shaolin Front Kick (Zheng Ti Tui)',
    category: 'technique',
    discipline: 'shaolin',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'Power and flexibility drill.',
    instructions: [
      'Keep the posture perfectly upright.',
      'Kick the leg straight up as high as possible, aiming for the forehead.',
      'Pull the toes back toward the shin.',
      'Slap the toe of the kicking foot with the opposite hand at the apex.'
    ],
    tips: 'Do not let the supporting knee bend.',
    difficulty: 2,
    targetArea: ['hamstrings', 'explosive power'],
    icon: '🦵'
  },
  'sl_side_kick': {
    id: 'sl_side_kick',
    name: 'Shaolin Side Kick (Ce Ti Tui)',
    category: 'technique',
    discipline: 'shaolin',
    duration: 60,
    sets: 1,
    reps: '6 each side',
    description: 'Develops lateral flexibility and hip strength.',
    instructions: [
      'Turn the body sideways to the target.',
      'Kick the leg straight up to the side, trying to touch the ear.',
      'Keep the torso upright; do not lean away from the kick.',
      'The foot should be bladed (edge of foot facing ceiling).'
    ],
    tips: 'This requires immense active flexibility. Only kick as high as you can without leaning.',
    difficulty: 3,
    targetArea: ['adductors', 'abductors', 'obliques'],
    icon: '🥋'
  },
  'sl_joint_rotations': {
    id: 'sl_joint_rotations',
    name: 'Chi Kung Joint Rotations',
    category: 'technique',
    discipline: 'shaolin',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'A traditional method to lubricate all joints.',
    instructions: [
      'Starting from the top down: slowly rotate the neck, shoulders, elbows, wrists.',
      'Move to the waist, hips, knees, and ankles.',
      'Sync the slow, deliberate rotations with deep, calm breathing.'
    ],
    tips: 'Visualize energy flowing smoothly through the joints as they rotate.',
    difficulty: 1,
    targetArea: ['all joints', 'relaxation'],
    icon: '🧘'
  },

  // DEEP STRETCHING (category: 'deep-stretch', discipline: 'general')
  'butterfly_stretch': {
    id: 'butterfly_stretch',
    name: 'Butterfly Stretch',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: null,
    description: 'Essential for opening the hips and groin for high kicks.',
    instructions: [
      'Sit on the floor and bring the soles of your feet together.',
      'Pull your heels as close to your pelvis as comfortable.',
      'Hold your feet and gently press your knees down toward the floor using your elbows.',
      'Keep your back straight and lean forward slightly from the hips.'
    ],
    tips: 'Never bounce or force the knees down aggressively.',
    difficulty: 1,
    targetArea: ['groin', 'inner thighs', 'hips'],
    icon: '🦋'
  },
  'frog_stretch': {
    id: 'frog_stretch',
    name: 'Frog Stretch',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: null,
    description: 'An intense adductor stretch that prepares the body for middle splits.',
    instructions: [
      'Start on your hands and knees.',
      'Slide your knees apart as far as comfortable.',
      'Turn your feet out so the inner edges rest on the floor (ankles in line with knees).',
      'Lower down to your forearms and gently push your hips back toward your heels.'
    ],
    tips: 'Breathe deeply. When you exhale, try to sink a millimeter deeper.',
    difficulty: 2,
    targetArea: ['groin', 'inner thighs'],
    icon: '🐸'
  },
  'pigeon_pose': {
    id: 'pigeon_pose',
    name: 'Pigeon Pose',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 90,
    sets: 1,
    reps: '45s each side',
    description: 'Crucial stretch for glutes and hip rotators, aiding in roundhouse kicks.',
    instructions: [
      'From a plank, bring one knee forward and place it behind the same-side wrist.',
      'Angle the lower leg across your body (the foot points toward the opposite hip).',
      'Extend the back leg straight out behind you.',
      'Keep hips square to the ground and lower your torso down over the front leg.'
    ],
    tips: 'If your hips are tight, keep the front foot closer to your groin.',
    difficulty: 2,
    targetArea: ['glutes', 'hip rotators'],
    icon: '🕊️'
  },
  'couch_stretch': {
    id: 'couch_stretch',
    name: 'Couch Stretch (Hip Flexor)',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 90,
    sets: 1,
    reps: '45s each side',
    description: 'The ultimate stretch for tight hip flexors and quads.',
    instructions: [
      'Kneel in front of a wall (or couch).',
      'Slide one knee all the way back into the corner where the floor meets the wall.',
      'The shin goes straight up the wall.',
      'Step the other foot forward into a lunge position.',
      'Slowly lift your torso upright.'
    ],
    tips: 'Squeeze the glute of the stretched leg to intensify the hip flexor stretch.',
    difficulty: 3,
    targetArea: ['hip flexors', 'quads'],
    icon: '🛋️'
  },
  'seated_forward_fold': {
    id: 'seated_forward_fold',
    name: 'Seated Forward Fold',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: null,
    description: 'A benchmark stretch for hamstring flexibility.',
    instructions: [
      'Sit on the floor with legs extended straight out in front.',
      'Keep your feet flexed (toes pointing up).',
      'Inhale, sit tall. Exhale, hinge at the hips and reach forward toward your toes.',
      'Keep the back as straight as possible; do not round the spine just to touch your toes.'
    ],
    tips: 'Think about bringing your belly button to your thighs, not your nose to your knees.',
    difficulty: 1,
    targetArea: ['hamstrings', 'lower back', 'calves'],
    icon: '📏'
  },
  'side_split_hold': {
    id: 'side_split_hold',
    name: 'Side Split Progressive Hold',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Working toward the full middle/side split.',
    instructions: [
      'Stand wide and slowly slide your feet apart sideways.',
      'Keep toes pointing forward or slightly up.',
      'Support your body weight with your hands or forearms on the floor (or yoga blocks).',
      'Sink to your lowest comfortable point and hold, breathing deeply.'
    ],
    tips: 'Contract your leg muscles for 5 seconds, then relax and try to sink deeper.',
    difficulty: 3,
    targetArea: ['adductors', 'hips'],
    icon: '↔️'
  },
  'front_split_hold': {
    id: 'front_split_hold',
    name: 'Front Split Progressive Hold',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 90,
    sets: 1,
    reps: '45s each side',
    description: 'Working toward the full front split (vital for high front kicks).',
    instructions: [
      'From a lunge, straighten the front leg and slide the heel forward.',
      'Slide the back knee backward.',
      'Keep hips absolutely square (pointing straight ahead).',
      'Use blocks under your hands to support your weight.'
    ],
    tips: 'Square hips are more important than how close to the floor you get.',
    difficulty: 3,
    targetArea: ['hamstrings (front leg)', 'hip flexors (back leg)'],
    icon: '🤸'
  },
  'pancake_stretch': {
    id: 'pancake_stretch',
    name: 'Pancake Stretch',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: null,
    description: 'Seated wide-angle forward fold.',
    instructions: [
      'Sit on the floor and spread legs as wide as possible (straddle).',
      'Keep knees facing the ceiling and toes flexed.',
      'Hinge forward from the hips, walking hands out in front.',
      'Aim to get your chest/belly flat on the floor.'
    ],
    tips: 'Sit on a folded blanket or block to tilt your pelvis forward if you struggle to lean.',
    difficulty: 2,
    targetArea: ['adductors', 'hamstrings', 'lower back'],
    icon: '🥞'
  },
  'standing_pike': {
    id: 'standing_pike',
    name: 'Standing Pike (Hamstring)',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 30,
    sets: 1,
    reps: null,
    description: 'Intense hamstring stretch utilizing gravity.',
    instructions: [
      'Stand with feet together and straight legs.',
      'Hinge at the hips and fold forward, letting arms hang.',
      'Grab your calves or ankles and gently pull your chest toward your thighs.',
      'Keep weight slightly forward in the balls of your feet.'
    ],
    tips: 'Flex your quads hard to force the hamstrings to relax.',
    difficulty: 2,
    targetArea: ['hamstrings', 'calves'],
    icon: '🧲'
  },
  'lizard_pose': {
    id: 'lizard_pose',
    name: 'Lizard Pose',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 90,
    sets: 1,
    reps: '45s each side',
    description: 'Deep lunge focusing on the inner hip and groin.',
    instructions: [
      'Step one foot forward to the outside of your hands.',
      'Keep the back leg straight or lower the knee to the floor.',
      'Lower your upper body down onto your forearms (if flexibility allows).',
      'Keep the front knee close to the shoulder.'
    ],
    tips: 'Gently sway side to side to explore tight areas in the hip joint.',
    difficulty: 2,
    targetArea: ['hips', 'groin', 'hip flexors'],
    icon: '🦎'
  },
  'deep_squat_hold': {
    id: 'deep_squat_hold',
    name: 'Deep Squat Hold',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: null,
    description: 'The fundamental resting human position. Essential for ankle and hip mobility.',
    instructions: [
      'Stand with feet slightly wider than shoulder-width, toes angled out.',
      'Drop your hips all the way down until hamstrings rest on calves.',
      'Keep heels flat on the floor.',
      'Keep chest up and use elbows to gently push knees outward.'
    ],
    tips: 'If heels lift, hold onto a heavy object or pole for balance while leaning back.',
    difficulty: 2,
    targetArea: ['ankles', 'hips', 'lower back'],
    icon: '🏋️'
  },
  'pnf_hamstring': {
    id: 'pnf_hamstring',
    name: 'PNF Hamstring Stretch',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 90,
    sets: 1,
    reps: '3 rounds each side',
    description: 'Contract-relax technique for rapid flexibility gains.',
    instructions: [
      'Lie on back, loop a towel or band around one foot.',
      'Pull the straight leg toward you until a stretch is felt.',
      'Contract: Push the leg away against the band\'s resistance for 5 seconds.',
      'Relax: Immediately stop pushing and pull the leg into a deeper stretch for 10 seconds.',
      'Repeat 3 times per leg.'
    ],
    tips: 'The contraction should be about 30% of your maximum strength.',
    difficulty: 3,
    targetArea: ['hamstrings', 'nervous system'],
    icon: '🧠'
  },
  'pnf_adductor': {
    id: 'pnf_adductor',
    name: 'PNF Adductor Stretch',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '3 rounds',
    description: 'Contract-relax technique for the inner thighs (splits prep).',
    instructions: [
      'Sit in Butterfly stretch.',
      'Contract: Press knees upward while hands resist and hold them down (5 seconds).',
      'Relax: Release contraction and actively pull knees lower to the ground (10 seconds).',
      'Repeat 3 times.'
    ],
    tips: 'Breathe out during the relaxation/deepening phase.',
    difficulty: 3,
    targetArea: ['adductors'],
    icon: '🧠'
  },
  'loaded_goblet_squat': {
    id: 'loaded_goblet_squat',
    name: 'Loaded Goblet Squat Hold',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: null,
    description: 'Using weight to force deeper range of motion and build end-range strength.',
    instructions: [
      'Hold a light weight (dumbbell, kettlebell, or heavy book) at your chest.',
      'Sink into a deep squat.',
      'Let the weight pull your center of gravity down and forward.',
      'Use elbows to push knees out. Hold the position actively.'
    ],
    tips: 'Keep the core engaged and the spine relatively straight.',
    difficulty: 3,
    targetArea: ['hips', 'ankles', 'active flexibility'],
    icon: '🧱'
  },
  'wall_split': {
    id: 'wall_split',
    name: 'Wall Split (Legs up Wall)',
    category: 'deep-stretch',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'A passive, relaxing stretch using gravity to open the hips.',
    instructions: [
      'Lie on your back with your buttocks pressed flush against a wall.',
      'Extend legs straight up the wall.',
      'Slowly let gravity pull your legs apart into a wide "V" shape.',
      'Relax and let the weight of your legs do the work.'
    ],
    tips: 'Add light ankle weights for a deeper, loaded stretch.',
    difficulty: 1,
    targetArea: ['adductors', 'relaxation'],
    icon: '📐'
  },

  // LOWER BACK CARE (category: 'lower-back', discipline: 'general')
  'mcgill_curlup': {
    id: 'mcgill_curlup',
    name: 'McGill Curl-Up',
    category: 'lower-back',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '8 reps, 10s holds',
    description: 'Core stability exercise that protects the spine without causing flexion damage.',
    instructions: [
      'Lie on back, one knee bent, one leg straight.',
      'Place hands under the natural arch of your lower back.',
      'Brace core hard. Lift head and shoulders just 1-2 inches off the floor.',
      'Hold for 10 seconds, then slowly lower. Do not crunch or tuck chin heavily.'
    ],
    tips: 'Move the head and shoulders as one locked unit.',
    difficulty: 2,
    targetArea: ['anterior core', 'spine stability'],
    icon: '🛡️'
  },
  'side_plank': {
    id: 'side_plank',
    name: 'Side Plank (Side Bridge)',
    category: 'lower-back',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '20-30s each side',
    description: 'Builds lateral core stability, crucial for back health.',
    instructions: [
      'Lie on side, propped on forearm (elbow under shoulder).',
      'Stack feet (or bend knees for an easier version).',
      'Lift hips so body forms a straight line from head to heels.',
      'Hold the position, bracing the core.'
    ],
    tips: 'Don\'t let the hips sag down or roll backward.',
    difficulty: 2,
    targetArea: ['obliques', 'lateral stability'],
    icon: '🧱'
  },
  'bird_dog': {
    id: 'bird_dog',
    name: 'Bird Dog',
    category: 'lower-back',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '8 each side, 5s holds',
    description: 'Trains the back extensors and core to stabilize against limb movement.',
    instructions: [
      'Start on hands and knees with a flat back.',
      'Simultaneously extend the right arm forward and left leg backward.',
      'Keep hips and shoulders perfectly square to the floor; do not arch the lower back.',
      'Hold for 5 seconds, return to start, and switch sides.'
    ],
    tips: 'Imagine balancing a glass of water on your lower back.',
    difficulty: 2,
    targetArea: ['posterior chain', 'anti-rotation'],
    icon: '🐕'
  },
  'hip_bridge': {
    id: 'hip_bridge',
    name: 'Glute Bridge',
    category: 'lower-back',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: '12 reps',
    description: 'Activates the glutes to take pressure off the lower back.',
    instructions: [
      'Lie on back with knees bent, feet flat on floor hip-width apart.',
      'Squeeze glutes and push through heels to lift hips toward the ceiling.',
      'Stop when body forms a straight line from shoulders to knees.',
      'Lower under control.'
    ],
    tips: 'Do not hyperextend (arch) the lower back at the top.',
    difficulty: 1,
    targetArea: ['glutes', 'lower back'],
    icon: '🌉'
  },
  'dead_bug': {
    id: 'dead_bug',
    name: 'Dead Bug',
    category: 'lower-back',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'Trains the core to stay braced while extremities move.',
    instructions: [
      'Lie on back with arms straight up and knees bent at 90 degrees.',
      'Press lower back firmly into the floor.',
      'Slowly extend right arm backward and left leg forward until just above the floor.',
      'Return to center and switch sides.'
    ],
    tips: 'If your lower back lifts off the floor, do not lower the leg as far.',
    difficulty: 2,
    targetArea: ['anterior core', 'pelvic control'],
    icon: '🐞'
  },
  'cat_cow': {
    id: 'cat_cow',
    name: 'Cat-Cow Stretch',
    category: 'lower-back',
    discipline: 'general',
    duration: 40,
    sets: 1,
    reps: '10 reps',
    description: 'Gentle spinal mobility exercise to relieve tension.',
    instructions: [
      'Start on hands and knees.',
      'Cow: Inhale, drop the belly, lift the chest and tailbone toward the ceiling.',
      'Cat: Exhale, round the spine upward, tucking the chin and tailbone.',
      'Move slowly between the two positions.'
    ],
    tips: 'Move sequentially from the tailbone to the head.',
    difficulty: 1,
    targetArea: ['spine mobility'],
    icon: '🐈'
  },
  'child_pose': {
    id: 'child_pose',
    name: 'Child\'s Pose',
    category: 'lower-back',
    discipline: 'general',
    duration: 30,
    sets: 1,
    reps: null,
    description: 'A restorative stretch that gently decompresses the lower back.',
    instructions: [
      'Kneel on the floor, sit back on your heels.',
      'Walk your hands forward and lower your chest and forehead to the floor.',
      'Let your lower back round slightly and completely relax.',
      'Breathe deeply into your lower back.'
    ],
    tips: 'Spread knees slightly wider than torso to sink deeper.',
    difficulty: 1,
    targetArea: ['lower back', 'lats', 'relaxation'],
    icon: '👶'
  },
  'superman_hold': {
    id: 'superman_hold',
    name: 'Superman Hold',
    category: 'lower-back',
    discipline: 'general',
    duration: 45,
    sets: 1,
    reps: '3x 10s holds',
    description: 'Strengthens the spinal erectors.',
    instructions: [
      'Lie face down with arms extended forward and legs straight.',
      'Squeeze glutes and lower back to lift arms, chest, and legs off the floor.',
      'Hold the top position, looking down to keep the neck neutral.',
      'Lower slowly.'
    ],
    tips: 'Focus on length (reaching forward and backward) rather than just height.',
    difficulty: 2,
    targetArea: ['spinal erectors', 'glutes'],
    icon: '🦸'
  },

  // COOLDOWN (category: 'cooldown', discipline: 'general')
  'seated_twist': {
    id: 'seated_twist',
    name: 'Seated Spinal Twist',
    category: 'cooldown',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '30s each side',
    description: 'Releases spinal tension after training.',
    instructions: [
      'Sit with legs extended. Bend right knee and step foot over left leg.',
      'Hug the right knee with the left arm (or hook elbow outside knee).',
      'Place right hand on floor behind you.',
      'Inhale to sit tall, exhale to twist and look over right shoulder.'
    ],
    tips: 'Twist from the torso, not just the neck.',
    difficulty: 1,
    targetArea: ['spine', 'outer hip'],
    icon: '🌪️'
  },
  'lying_twist': {
    id: 'lying_twist',
    name: 'Lying Spinal Twist',
    category: 'cooldown',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: '30s each side',
    description: 'Gentle, passive twist to restore equilibrium.',
    instructions: [
      'Lie on back with arms extended in a T-shape.',
      'Bring both knees to chest, then drop them to the right side.',
      'Turn your head to look over the left shoulder.',
      'Relax completely, then switch sides.'
    ],
    tips: 'Keep both shoulder blades pinned to the floor.',
    difficulty: 1,
    targetArea: ['lower back', 'chest'],
    icon: '🛌'
  },
  'neck_stretches': {
    id: 'neck_stretches',
    name: 'Gentle Neck Stretches',
    category: 'cooldown',
    discipline: 'general',
    duration: 30,
    sets: 1,
    reps: null,
    description: 'Relieves tension from high guards and striking drills.',
    instructions: [
      'Sit or stand tall. Gently drop right ear toward right shoulder.',
      'Use right hand to apply very light pressure (do not pull hard).',
      'Hold, then switch sides.',
      'Drop chin to chest, clasp hands behind head lightly.'
    ],
    tips: 'Stretch to the point of gentle tension, never pain.',
    difficulty: 1,
    targetArea: ['neck', 'traps'],
    icon: '🦒'
  },
  'wrist_stretches': {
    id: 'wrist_stretches',
    name: 'Wrist Circles & Stretches',
    category: 'cooldown',
    discipline: 'general',
    duration: 20,
    sets: 1,
    reps: null,
    description: 'Cools down the forearms after gripping or punching.',
    instructions: [
      'Extend arms forward. Flex fingers pointing up, pull back gently with other hand.',
      'Point fingers down, pull back gently.',
      'Make fists and rotate wrists slowly in both directions.'
    ],
    tips: 'Keep elbows straight for a deeper forearm stretch.',
    difficulty: 1,
    targetArea: ['wrists', 'forearms'],
    icon: '👋'
  },
  'final_breathing': {
    id: 'final_breathing',
    name: 'Closing Breath Work',
    category: 'cooldown',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Down-regulates the nervous system from training mode to recovery mode.',
    instructions: [
      'Sit comfortably (cross-legged or on heels).',
      'Inhale slowly through the nose for 4 seconds.',
      'Hold for 2 seconds.',
      'Exhale slowly through the mouth for 6 seconds.',
      'Repeat the cycle.'
    ],
    tips: 'Focus entirely on the sound and feeling of the breath.',
    difficulty: 1,
    targetArea: ['nervous system', 'mind'],
    icon: '🧘'
  },
  'savasana': {
    id: 'savasana',
    name: 'Savasana (Relaxation)',
    category: 'cooldown',
    discipline: 'general',
    duration: 60,
    sets: 1,
    reps: null,
    description: 'Total body relaxation to conclude the session.',
    instructions: [
      'Lie flat on your back, arms at your sides with palms facing up.',
      'Let your feet splay open naturally.',
      'Close your eyes and let your breathing return to normal.',
      'Scan your body from toes to head, releasing any remaining tension.'
    ],
    tips: 'Don\'t skip this! It helps lock in flexibility gains by teaching the body that the new ranges of motion are safe.',
    difficulty: 1,
    targetArea: ['full body', 'mind'],
    icon: '😴'
  },

  // ==========================================
  // NEW DISCIPLINES (PHASE 2 EXPANSION)
  // ==========================================

  // TECHNIQUE - BJJ (category: 'technique', discipline: 'bjj')
  'bjj_shrimp': {
    id: 'bjj_shrimp',
    name: 'Shrimping (Hip Escape)',
    category: 'technique',
    discipline: 'bjj',
    duration: 60,
    sets: 1,
    reps: '10 each side',
    description: 'The most fundamental ground movement in BJJ for escaping bad positions.',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor close to your hips.',
      'Turn slightly onto one shoulder.',
      'Push off both feet, lift your hips slightly, and push your hips backward (like a shrimp curling).',
      'Straighten your body and repeat on the other side.'
    ],
    tips: 'Your hips must move independently from your shoulders. Don\'t just slide across the floor.',
    difficulty: 1,
    targetArea: ['hips', 'core'],
    icon: '🦐'
  },
  'bjj_bridge': {
    id: 'bjj_bridge',
    name: 'Upa (Bridging)',
    category: 'technique',
    discipline: 'bjj',
    duration: 45,
    sets: 1,
    reps: '8 each side',
    description: 'Fundamental bridging technique used to escape mounts.',
    instructions: [
      'Lie on your back, knees bent, feet close to your glutes.',
      'Drive through your heels and lift your hips as high as possible.',
      'Reach one arm across your body and touch the floor over your opposite shoulder.',
      'Return to center and bridge to the other side.'
    ],
    tips: 'Look at the spot you are reaching for to maximize the rotation.',
    difficulty: 1,
    targetArea: ['glutes', 'lower back', 'shoulders'],
    icon: '🌉'
  },
  'bjj_technical_standup': {
    id: 'bjj_technical_standup',
    name: 'Technical Stand-up',
    category: 'technique',
    discipline: 'bjj',
    duration: 60,
    sets: 1,
    reps: '5 each side',
    description: 'Safely standing up while maintaining distance and guard against an attacker.',
    instructions: [
      'Sit on the floor. Place your right hand on the floor behind you, left knee bent, right leg straight.',
      'Keep your left hand up protecting your face.',
      'Lift your hips off the floor, balancing on your right hand and left foot.',
      'Pull your straight right leg all the way back underneath you and stand up in a fighting stance.'
    ],
    tips: 'Never look down at your hands; keep your eyes forward on the imaginary opponent.',
    difficulty: 2,
    targetArea: ['core', 'balance', 'hips'],
    icon: '🧍'
  },

  // TECHNIQUE - JUDO (category: 'technique', discipline: 'judo')
  'judo_ukemi_back': {
    id: 'judo_ukemi_back',
    name: 'Ushiro Ukemi (Back Breakfall)',
    category: 'technique',
    discipline: 'judo',
    duration: 60,
    sets: 1,
    reps: '10 reps',
    description: 'Learning how to fall safely without hitting your head.',
    instructions: [
      'Start in a deep squat, arms extended straight out in front of you.',
      'Tuck your chin firmly to your chest.',
      'Roll backward, slapping the mat hard with your arms (palms down) at a 45-degree angle right before your back hits.',
      'Do not let your head touch the floor.'
    ],
    tips: 'The slap dissipates the energy. Tuck your chin as if holding a tennis ball there.',
    difficulty: 2,
    targetArea: ['neck', 'core'],
    icon: '💥'
  },
  'judo_uchikomi': {
    id: 'judo_uchikomi',
    name: 'Uchikomi (Shadow Entry)',
    category: 'technique',
    discipline: 'judo',
    duration: 60,
    sets: 1,
    reps: '10 each side',
    description: 'Practicing the footwork and hip placement for forward throws.',
    instructions: [
      'Stand in a neutral stance. Imagine gripping an opponent.',
      'Step your dominant foot forward and turn it slightly inward.',
      'Pivot 180 degrees on the ball of that foot while bringing your other foot around.',
      'Drop your hips low (knees bent) so your hips are below the imaginary opponent\'s hips.',
      'Return to start and repeat quickly.'
    ],
    tips: 'Speed and balance are key. Your hips must drop lower than your partner\'s center of gravity.',
    difficulty: 2,
    targetArea: ['legs', 'balance', 'footwork'],
    icon: '🥋'
  },

  // TECHNIQUE - CAPOEIRA (category: 'technique', discipline: 'capoeira')
  'cap_ginga': {
    id: 'cap_ginga',
    name: 'Ginga',
    category: 'technique',
    discipline: 'capoeira',
    duration: 90,
    sets: 1,
    reps: null,
    description: 'The fundamental rhythmic rocking step of Capoeira.',
    instructions: [
      'Start with feet shoulder-width apart, knees slightly bent.',
      'Step your right foot back into a lunge position, keeping your left arm up to protect your face.',
      'Step the right foot back to center.',
      'Step the left foot back into a lunge, bringing the right arm up to protect your face.',
      'Continue this fluid, rhythmic side-to-side motion.'
    ],
    tips: 'Stay low and keep your movement continuous like a pendulum.',
    difficulty: 1,
    targetArea: ['legs', 'coordination', 'rhythm'],
    icon: '🕺'
  },
  'cap_esquiva': {
    id: 'cap_esquiva',
    name: 'Esquiva (Escape)',
    category: 'technique',
    discipline: 'capoeira',
    duration: 60,
    sets: 1,
    reps: '8 each side',
    description: 'Basic ducking and dodging movement.',
    instructions: [
      'From the Ginga base (feet parallel), step one foot out slightly wider.',
      'Drop your weight down to that side, bending the knee deeply while keeping the other leg straight.',
      'Lean your torso over the bent knee, placing one hand on the floor for support, other arm protecting your face.',
      'Push back up to center and resume Ginga.'
    ],
    tips: 'Always keep your eyes up, looking at your opponent as you drop down.',
    difficulty: 2,
    targetArea: ['quads', 'hips', 'agility'],
    icon: '🛡️'
  },
  
  // --- SHUAI JIAO ---
  'sj_ba_bian': {
    id: 'sj_ba_bian',
    name: 'Ba Bian (Leg Sweeping)',
    category: 'technique',
    discipline: 'shuaijiao',
    duration: 90,
    sets: 3,
    reps: '10 each leg',
    description: 'A fundamental Shuai Jiao sweeping drill to develop the fast, whip-like leg action required for takedowns like the inner hook or outer sweep.',
    instructions: [
      'Stand in a standard wrestling stance, feet shoulder-width apart, knees slightly bent, core engaged.',
      'Shift your weight entirely to your left leg.',
      'Lift your right leg slightly off the floor, keeping the knee locked and toes pointed.',
      'Swing the right leg forcefully across your body, like a pendulum or a whip, simulating sweeping an opponent\'s leg from under them.',
      'The power should originate from the rapid rotation of the hip, not just the leg muscles.',
      'Return to stance and immediately repeat the whip motion without fully planting the foot.'
    ],
    tips: 'Imagine your leg is a heavy iron bar swinging. Your upper body should counter-rotate slightly to maintain perfect balance.',
    difficulty: 3,
    targetArea: ['hips', 'balance', 'core'],
    icon: '🤼'
  },
  'sj_shou_fa': {
    id: 'sj_shou_fa',
    name: 'Grip Fighting (Shou Fa)',
    category: 'technique',
    discipline: 'shuaijiao',
    duration: 120,
    sets: 2,
    reps: 'Shadow grappling',
    description: 'Practicing the essential jacket grips (Da Lazi) and hand positioning for Chinese wrestling.',
    instructions: [
      'Visualize an opponent wearing a Shuai Jiao jacket.',
      'Practice pummeling: swim your hands inside to establish an underhook, then transition to an overhook.',
      'Practice the lapel and sleeve grip: simultaneously snatch the collar with your dominant hand and the tricep/sleeve with your off-hand.',
      'Snap the grips down forcefully to break the imaginary opponent\'s posture.',
      'Move your feet constantly while gripping; never stand still in Shuai Jiao.'
    ],
    tips: 'A strong grip is useless without leverage. Always step offline when pulling the opponent.',
    difficulty: 2,
    targetArea: ['forearms', 'grip', 'posture'],
    icon: '🧥'
  },

  // --- JUDO ---
  'judo_uchikomi_osoto': {
    id: 'judo_uchikomi_osoto',
    name: 'Osoto Gari Uchikomi',
    category: 'technique',
    discipline: 'judo',
    duration: 120,
    sets: 3,
    reps: '20 entries',
    description: 'Repetitive fitting-in practice (Uchikomi) for the Major Outer Reaping throw without actually finishing the throw.',
    instructions: [
      'Establish your imaginary grips: lapel and sleeve.',
      'Step your left foot deeply outside the opponent\'s right foot, pointing your toes straight ahead.',
      'Pull the lapel and sleeve violently to your left side, breaking the opponent\'s balance onto their right heel (Kuzushi).',
      'Swing your right leg high into the air past the opponent\'s right leg.',
      'Instead of reaping back, reset your position and repeat the entry rapidly.',
      'Focus on the chest-to-chest contact and the pulling motion.'
    ],
    tips: 'The pull (Kuzushi) must happen BEFORE your reaping leg lifts. If they are balanced, you cannot reap them.',
    difficulty: 3,
    targetArea: ['balance', 'pulling strength', 'timing'],
    icon: '🥋'
  },
  'judo_seoi_nage': {
    id: 'judo_seoi_nage',
    name: 'Ippon Seoi Nage (Shoulder Throw)',
    category: 'technique',
    discipline: 'judo',
    duration: 120,
    sets: 3,
    reps: '15 entries',
    description: 'Shadow practice for the One-Arm Shoulder Throw, requiring deep squat mobility and rapid turning.',
    instructions: [
      'Grip the imaginary right lapel.',
      'Pull the opponent upward and forward to break their balance onto their toes.',
      'Step your right foot across their center line, pivoting your body 180 degrees.',
      'Drop your weight rapidly by bending your knees into a deep squat, wedging your right bicep deep into their right armpit.',
      'Keep your back straight and hips lower than the opponent\'s hips.',
      'Spring up and bow forward to execute the throw, then reset.'
    ],
    tips: 'Your hips MUST drop below theirs. If you rely purely on upper body strength, you will injure your lower back.',
    difficulty: 4,
    targetArea: ['hips', 'legs', 'explosiveness'],
    icon: '🔄'
  },

  // --- AIKIDO ---
  'aikido_tenkan': {
    id: 'aikido_tenkan',
    name: 'Tenkan (Pivoting)',
    category: 'technique',
    discipline: 'aikido',
    duration: 90,
    sets: 3,
    reps: '10 each side',
    description: 'The fundamental Aikido evasion and redirection movement. Turning 180 degrees to blend with an attacker\'s force.',
    instructions: [
      'Start in Hanmi (basic Aikido triangular stance) with the right foot forward.',
      'Imagine an attacker rushing directly at you with a strike.',
      'Do not retreat backwards. Step your front right foot slightly off the line of attack.',
      'Using the balls of your feet, pivot your entire body 180 degrees backwards (Tenkan), swinging your left leg behind you.',
      'Extend your arms out as you turn, visualizing leading the attacker\'s momentum past you in a circular motion.',
      'You should finish the turn perfectly balanced, facing the same direction the attacker is now moving.'
    ],
    tips: 'Keep your center of gravity very low. The turn should be smooth, like a door swinging on a well-oiled hinge, not jagged.',
    difficulty: 2,
    targetArea: ['balance', 'evasion', 'spatial awareness'],
    icon: '🌪️'
  },
  'aikido_ikkyo': {
    id: 'aikido_ikkyo',
    name: 'Ikkyo Undo (First Teaching)',
    category: 'technique',
    discipline: 'aikido',
    duration: 60,
    sets: 2,
    reps: '15 extensions',
    description: 'A solo breathing and arm extension exercise that simulates pinning an opponent\'s arm to the ground using their own center of gravity.',
    instructions: [
      'Stand in Hanmi stance.',
      'Raise both arms above your head as if absorbing a downward strike to your forehead.',
      'Step forward smoothly, pushing both arms down and forward in a large circular arc.',
      'Visualize cutting down through the attacker\'s elbow and wrist, driving them to the mat.',
      'Keep your shoulders relaxed and down; the power comes from your hips moving forward, not your arm muscles.'
    ],
    tips: 'Imagine extending Ki (energy) through your fingertips. Do not tense your biceps or shoulders; stay completely relaxed.',
    difficulty: 1,
    targetArea: ['shoulders', 'relaxation', 'breathing'],
    icon: '🍃'
  }
};
