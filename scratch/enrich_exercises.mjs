import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/generated/exercises.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Parse the array
const arrayStart = content.indexOf('[\n  {');
const arrayEnd = content.lastIndexOf(']');
const jsonStr = content.slice(arrayStart, arrayEnd + 1);
const exercises = JSON.parse(jsonStr);

function getSymbolAndInstructions(ex) {
  const name = ex.name.toLowerCase();
  const cat = ex.category;
  let symbol = 'figure.flexibility';
  let summary = ex.summary;
  let instructions = ex.instructions;
  let tips = ex.tips;

  // 1. Symbol resolution based on movement
  if (name.includes('neck') || cat === 'neck') {
    symbol = 'figure.neck';
  } else if (name.includes('lunge') || name.includes('hip flexor') || name.includes('cossack') || name.includes('horse stance')) {
    symbol = 'figure.lunge';
  } else if (name.includes('split') || name.includes('straddle') || name.includes('frog') || cat === 'adductors') {
    symbol = 'figure.split';
  } else if (name.includes('butterfly')) {
    symbol = 'figure.butterfly';
  } else if (name.includes('pigeon') || name.includes('glute') || name.includes('piriformis')) {
    symbol = 'figure.pigeon';
  } else if (name.includes('child') || name.includes('cat-cow') || name.includes('spine') || name.includes('puppy')) {
    symbol = 'figure.childs.pose';
  } else if (name.includes('fold') || name.includes('hamstring') || name.includes('pike') || name.includes('toe touch') || cat === 'hamstrings') {
    symbol = 'figure.forward.fold';
  } else if (name.includes('balance') || name.includes('crane') || name.includes('single-leg') || name.includes('ankle') || name.includes('foot')) {
    symbol = 'figure.balance';
  } else if (name.includes('kick') || name.includes('chamber') || name.includes('teep') || name.includes('roundhouse') || name.includes('leg swing')) {
    symbol = 'figure.kickboxing';
  } else if (name.includes('twist') || name.includes('rotation') || name.includes('open book') || name.includes('breathing')) {
    symbol = 'figure.mind.and.body';
  } else if (name.includes('shoulder') || name.includes('chest') || name.includes('pectoral') || name.includes('deltoid') || cat === 'shoulders') {
    symbol = 'figure.arms.open';
  } else if (name.includes('core') || name.includes('abs') || name.includes('hollow') || name.includes('plank')) {
    symbol = 'figure.core.training';
  } else if (name.includes('calf') || name.includes('shins') || name.includes('tibialis') || cat === 'calves') {
    symbol = 'figure.step.training';
  } else if (name.includes('tai chi') || name.includes('cloud hands') || name.includes('silk reeling')) {
    symbol = 'figure.taichi';
  } else if (name.includes('bjj') || name.includes('guard') || name.includes('wrestling') || name.includes('bridge')) {
    symbol = 'figure.wrestling';
  } else if (name.includes('jumping jacks') || name.includes('warmup') || name.includes('circles')) {
    symbol = 'flame.fill';
  }

  // 2. High-quality descriptions & instructions if placeholder
  if (instructions.length <= 1 && instructions[0].includes('Hold the stretch comfortably')) {
    if (name.includes('neck')) {
      summary = `Relieve cervical spine tension and improve rotational mobility for head defense and awareness.`;
      instructions = [
        'Sit or stand tall with shoulders relaxed down and away from your ears.',
        'Gently guide your head toward the target angle without pulling aggressively.',
        'Hold the edge of tension and take 3 to 4 deep diaphragmatic breaths.',
        'Slowly return to neutral before switching sides or releasing.'
      ];
      tips = ['Never pull with full force; allow gravity and breath to lengthen the muscle.', 'Keep your teeth unclenched to release jaw tension.'];
    } else if (name.includes('lunge')) {
      summary = `Open the hip flexors and psoas to deepen stance transitions and power rear-leg kicks.`;
      instructions = [
        'Step forward into a wide split stance with your front knee tracked over your ankle.',
        'Lower your back knee gently to the mat, untucking your rear toes.',
        'Tuck your pelvis slightly under (posterior pelvic tilt) to engage the hip flexor stretch.',
        'Shift your weight gently forward while keeping your torso upright.'
      ];
      tips = ['Squeeze the glute of your rear leg to deepen the stretch reflexively.', 'Avoid arching your lower back excessively.'];
    } else if (name.includes('split') || name.includes('straddle')) {
      summary = `Target adductors and inner hamstrings to unlock high kicks and lateral stance freedom.`;
      instructions = [
        'Position your feet wide apart with toes pointing forward or slightly outward.',
        'Place your hands on the floor or yoga blocks for controlled weight distribution.',
        'Inhale deeply to elongate the spine, then exhale as you relax hips deeper toward the floor.',
        'Maintain steady, relaxed breathing without tensing against the stretch.'
      ];
      tips = ['Breathe out slowly as if blowing through a straw to down-regulate the nervous system.', 'Never bounce at end range.'];
    } else if (name.includes('hamstring') || name.includes('fold')) {
      summary = `Decompress the posterior chain, lengthening hamstrings for snap kicks and lumbar comfort.`;
      instructions = [
        'Hinge at the hips with a proud chest, keeping a micro-bend in your knees.',
        'Reach your chest toward your shins rather than rounding your upper back.',
        'Let your head and neck hang relaxed to relieve spinal tension.',
        'Hold the stretch while breathing into the backs of your legs.'
      ];
      tips = ['Focus on pivoting at the pelvis rather than bending from the waist.', 'Exhale deeply to sink millimeters further.'];
    } else if (name.includes('pigeon')) {
      summary = `Target the piriformis and external hip rotators to protect knees in guard and stance play.`;
      instructions = [
        'From hands and knees, bring your front knee forward toward your wrist.',
        'Extend your rear leg straight behind you with hips squared to the floor.',
        'Walk your hands forward, lowering your chest over the front shin as comfortable.',
        'Take slow, calm breaths into the outer hip pocket.'
      ];
      tips = ['Keep your hips square; do not collapse onto one side.', 'Support with a yoga block under the hip if your pelvis tilts.'];
    } else if (name.includes('butterfly')) {
      summary = `Mobilize groin adductors and hip capsules essential for guard recovery and side kicks.`;
      instructions = [
        'Sit tall on the floor and bring the soles of your feet together in front of you.',
        'Draw your heels toward your groin to a comfortable distance.',
        'Hold your feet or ankles, lengthen your spine, and let your knees settle outward.',
        'Gently hinge forward from your hips with a flat back.'
      ];
      tips = ['Do not aggressively flap or bounce your knees.', 'Focus on relaxing the pelvic floor on each exhale.'];
    } else if (name.includes('twist') || name.includes('open book') || name.includes('rotation')) {
      summary = `Restore thoracic spine rotation for punch whipping power and guard defense fluidity.`;
      instructions = [
        'Lie on your side or back with knees bent at a 90-degree angle.',
        'Extend your arms and slowly rotate your upper chest open toward the ceiling.',
        'Turn your gaze toward your outstretched hand, keeping knees stacked.',
        'Breathe deep into the ribcage, feeling the rotational release through the mid-back.'
      ];
      tips = ['Keep your knees pinned together to isolate rotation to the thoracic spine.', 'Move smoothly with your breath.'];
    } else if (name.includes('child')) {
      summary = `Gentle resting decompression for the lower back, lats, and nervous system after hard rounds.`;
      instructions = [
        'Kneel on the mat with big toes touching and knees spread comfortably wide.',
        'Sit your hips back toward your heels and extend your arms forward on the floor.',
        'Rest your forehead gently on the mat and release tension in your shoulders.',
        'Take deep 4-second inhales and 6-second exhales into your back body.'
      ];
      tips = ['Allow your chest to sink between your thighs with each exhalation.', 'Walk fingertips forward slightly to lengthen the lats.'];
    } else if (name.includes('shoulder') || name.includes('cross') || name.includes('chest')) {
      summary = `Open tight pectoral and deltoid fibers to improve punch extension and posture.`;
      instructions = [
        'Position your arm across your body or against a wall / floor anchor.',
        'Keep your shoulder down away from your ear to isolate the stretch.',
        'Breathe into the front or rear of the shoulder capsule.',
        'Hold smoothly without twisting your torso away from the stretch line.'
      ];
      tips = ['Avoid shrugging the working shoulder upward.', 'Relax your grip and fingers.'];
    } else if (name.includes('calf') || name.includes('ankle') || name.includes('tibialis')) {
      summary = `Condition the ankles and lower legs for rapid footwork, bouncing, and kicking resilience.`;
      instructions = [
        'Position the ball of your foot against a wall or step with your heel anchored down.',
        'Keep your back leg straight and shift your hips gently forward.',
        'Feel the lengthening through the gastrocnemius and Achilles tendon.',
        'Hold steady, then slightly bend the knee to target the deeper soleus muscle.'
      ];
      tips = ['Maintain arch engagement in your standing foot.', 'Ensure your toes point straight forward.'];
    } else {
      summary = `Targeted ${cat} mobility stretch designed to restore joint range of motion and tissue suppleness.`;
      instructions = [
        'Establish a solid, balanced base of support before initiating the movement.',
        'Gently enter the stretch until you feel comfortable, mild tension.',
        'Breathe slowly and rhythmically, focusing on relaxing the targeted muscle group.',
        'Carefully release the stretch and return to your starting position with control.'
      ];
      tips = ['Stay within your pain-free active range.', 'Synchronize your breath: inhale to lengthen, exhale to sink deeper.'];
    }
  }

  return { ...ex, symbol, summary, instructions, tips };
}

const updated = exercises.map(getSymbolAndInstructions);
const newContent = `import type { Exercise } from '../types'\n\nexport const EXERCISES: Exercise[] = ${JSON.stringify(updated, null, 2)}\n`;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully enriched all 107 exercises with icons and step-by-step how-to instructions!');
