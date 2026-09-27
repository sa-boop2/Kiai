const fs = require('fs')

const raw = `
Neck
Basic Neck Flexion Stretch
Basic Neck Extension Stretch
Lateral Neck Stretch (Side Bend)
Upper Trap Stretch
Levator Scapulae Stretch
Neck Circles / Controlled Neck Rotations
Chin Tuck

Shoulders
Cross-Body Shoulder Stretch
Overhead Triceps and Shoulder Stretch
Sleeper Stretch
Doorway Shoulder External Rotation Stretch
Doorway Pec / Front Shoulder Stretch
Shoulder Dislocates with Stick or Band
Wall Slide Shoulder Stretch
Thread-the-Needle Stretch

Chest
Standing Chest Stretch Against Wall
Doorway Pec Stretch (Single Arm)
Doorway Pec Stretch (Double Arm)
Behind-Back Clasped Hands Chest Stretch
Overhead Chest and Lat Stretch

Lats & Upper Back
Child’s Pose (Lat-Dominant)
Side-Bending Lat Stretch
Cat-Cow Spine Mobilization
Seated Thoracic Extension Over Chair Back
Thoracic Spine Rotation (Open Book Stretch)
Upper Back Stretch (Arms Reaching Forward)
Kneeling Bench / Prayer Stretch
Thread-the-Needle (Shoulder + Upper Back)
Scapular Retraction Stretch (Arms Forward, Shoulder Blades Spread)

Arms
Biceps Wall Stretch (Arm Extended Behind)
Triceps Overhead Stretch
Cross-Body Triceps / Posterior Arm Stretch
Wrist Flexor Stretch
Wrist Extensor Stretch
Forearm Pronation / Supination Stretch

Core & Abdominals
Cobra Stretch
Sphinx Stretch
Side-Lying Oblique Stretch
Standing Side Bend Stretch
Supine Spinal Twist
Seated Side Bend Stretch

Lower Back
Single-Knee-to-Chest Stretch
Double-Knee-to-Chest Stretch
Supine Lumbar Spinal Twist
Child’s Pose (Lower-Back Emphasis)
Pelvic Tilt Stretch (Supine)
Cat-Cow (Lumbar + Thoracic)

Glutes & Hip Rotators
Supine Figure-Four Glute Stretch
Seated Figure-Four / Pretzel Stretch
Pigeon Pose
Cross-Leg Seated Glute Stretch (Torso Lean Forward)
Standing Cross-Over Glute Stretch (Ankle Over Knee)

Hip Flexors
Half-Kneeling Hip Flexor Stretch
Lunge Hip Flexor Stretch
Couch Stretch
Standing Hip Flexor Stretch

Adductors / Groin
Frog Stretch
Butterfly Stretch (Seated, Soles Together)
Side Lunge / Cossack Squat Stretch
Wide-Leg Seated Straddle Forward Fold
Kneeling Adductor Stretch / Kneeling Box Split

Hamstrings
Standing Hamstring Stretch (One Foot Forward)
Elevated Hamstring Stretch (Heel on Box)
Seated Forward Fold (Both Legs Extended)
Single-Leg Seated Hamstring Stretch
Wall Hamstring Stretch (Leg Up Wall)
Supine Band / Towel Hamstring Stretch
Good-Morning Style Hamstring Stretch (Bodyweight Hinge)

Quadriceps
Standing Quad Stretch (Heel to Glute)
Side-Lying Quad Stretch
Prone Quad Stretch
Lunge-with-Quad Reach Stretch

Calves
Standing Gastrocnemius Stretch (Straight Back Leg)
Standing Soleus Stretch (Bent Back Knee)
Step Calf Stretch (Heel Off Edge)
Downward Dog Calf Stretch

Tibialis / Shin
Standing Shin Stretch (Top of Foot on Floor Behind)
Kneeling Toe-Point Stretch (Sit Back on Toes)
Anterior Tibialis Wall Stretch

Feet & Ankles
Ankle Circles
Ankle Alphabet
Plantar Fascia Stretch
Toe Flexor Stretch (Sit Back on Toes)

Full-Body / Compound
Standing Full-Body Overhead Stretch
Deep Squat Mobility Hold
Downward Dog
Lunge with Thoracic Rotation
Triangle Pose
Standing Side-Bend with Overhead Reach
World’s Greatest Stretch
`

const categoryMap = {
  'Neck': 'neck',
  'Shoulders': 'shoulders',
  'Chest': 'chest',
  'Lats & Upper Back': 'lats',
  'Arms': 'arms',
  'Core & Abdominals': 'core',
  'Lower Back': 'lowerBack',
  'Glutes & Hip Rotators': 'glutes',
  'Hip Flexors': 'hipFlexors',
  'Adductors / Groin': 'adductors',
  'Hamstrings': 'hamstrings',
  'Quadriceps': 'quads',
  'Calves': 'calves',
  'Tibialis / Shin': 'shins',
  'Feet & Ankles': 'feet',
  'Full-Body / Compound': 'fullBody'
}

let currentCat = null
const exercises = []

for (let line of raw.split('\n')) {
  line = line.trim()
  if (!line) continue
  if (categoryMap[line]) {
    currentCat = categoryMap[line]
  } else {
    const isBilateral = line.includes('Single Arm') || line.includes('Cross-Body') || line.includes('Side-Bending') || line.includes('Thread-the-Needle') || line.includes('Half-Kneeling') || line.includes('Single-Knee') || line.includes('Lunge') || line.includes('Side-Lying') || line.includes('Figure-Four') || line.includes('Pigeon') || line.includes('One Foot') || line.includes('Single-Leg') || line.includes('Side-Bend') || line.includes('Standing Chest Stretch Against Wall')
    
    // Guess equipment
    const equipment = []
    if (line.includes('Wall')) equipment.push('wall')
    if (line.includes('Chair') || line.includes('Bench') || line.includes('Box') || line.includes('Couch')) equipment.push('chair')
    if (line.includes('Band') || line.includes('Strap') || line.includes('Towel') || line.includes('Stick')) equipment.push('strap')

    exercises.push({
      slug: line.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: line,
      summary: 'A standard stretch for the ' + line + '.',
      instructions: ['Hold the stretch comfortably and breathe deeply.'],
      tips: ['Do not push into pain.'],
      category: currentCat,
      equipment,
      arts: [],
      targets: [],
      duration: isBilateral ? 60 : 30,
      bilateral: isBilateral,
      symbol: 'figure.flexibility'
    })
  }
}

const out = `import type { Exercise } from '../types'

export const EXERCISES: Exercise[] = ${JSON.stringify(exercises, null, 2)}
`

fs.writeFileSync('C:/Users/sande/Antigravity/Kiai PWA/src/data/generated/exercises.ts', out)
console.log("Done generating exercises.ts")
