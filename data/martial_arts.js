window.MARTIAL_ARTS = {
  wushu: {
    id: 'wushu',
    name: 'Wushu',
    origin: 'China',
    icon: '🐉',
    color: '#E63946',
    type: 'hybrid',
    description: 'Wushu is a modern exhibition and full-contact sport derived from traditional Chinese martial arts. It encompasses both taolu (choreographed forms) and sanda (free fighting), blending breathtaking acrobatics with powerful combat techniques. Recognized internationally, Wushu is governed by the International Wushu Federation and has been a medal event at the Asian Games since 1990.',
    history: 'Wushu\'s roots trace back thousands of years through China\'s rich martial heritage, but its modern form was standardized in 1949 when the People\'s Republic of China sought to codify traditional fighting styles into a national sport. The Chinese State Physical Culture and Sports Commission established official curricula for competition wushu in the 1950s. The International Wushu Federation (IWUF) was founded in 1990, bringing the art to a global stage. Wushu was included as a demonstration sport at the 2008 Beijing Olympics and continues to push for full Olympic inclusion.',
    characteristics: [
      'Explosive aerial acrobatics and gymnastics-level flexibility',
      'Codified competition forms (changquan, nanquan, taijiquan)',
      'Integration of traditional weapons into choreographed routines',
      'Emphasis on speed, power, and aesthetic presentation',
      'Dual-discipline structure: taolu (forms) and sanda (sparring)',
      'Scoring based on difficulty, technique, and overall performance'
    ],
    keyPrinciples: [
      'Unity of internal energy and external movement',
      'Speed and power derived from proper body mechanics',
      'Precision in every technique—no wasted motion',
      'Balance between martial effectiveness and artistic beauty',
      'Continuous self-improvement through disciplined repetition'
    ],
    rankingSystem: {
      type: 'sash',
      ranks: [
        { name: 'White Sash (Beginner)', color: '#FFFFFF' },
        { name: 'Yellow Sash', color: '#FFD700' },
        { name: 'Blue Sash', color: '#1E90FF' },
        { name: 'Green Sash', color: '#2ECC71' },
        { name: 'Red Sash', color: '#E74C3C' },
        { name: 'Black Sash (Advanced)', color: '#1A1A2E' },
        { name: 'Gold Sash (Master)', color: '#DAA520' }
      ]
    },
    weapons: [
      { name: 'Dao (Broadsword)', icon: '⚔️', description: 'A single-edged curved blade known as the "General of All Weapons" for its versatility in slashing attacks.' },
      { name: 'Jian (Straight Sword)', icon: '🗡️', description: 'A double-edged straight sword called the "Gentleman of Weapons" requiring precise, elegant technique.' },
      { name: 'Gun (Staff)', icon: '🥢', description: 'A long wooden staff considered the foundation of all Chinese weapons training.' },
      { name: 'Qiang (Spear)', icon: '🔱', description: 'A flexible-shafted spear known as the "King of Weapons" for its lethal reach and thrusting power.' },
      { name: 'Nandao (Southern Broadsword)', icon: '⚔️', description: 'A heavier, broader blade used in Southern-style wushu with powerful chopping techniques.' }
    ],
    famousPractitioners: ['Jet Li', 'Donnie Yen', 'Wu Jing', 'Zhao Changjun'],
    techniqueCount: 0
  },

  muaythai: {
    id: 'muaythai',
    name: 'Muay Thai',
    origin: 'Thailand',
    icon: '🥊',
    color: '#FF6B35',
    type: 'striking',
    description: 'Muay Thai, known as the "Art of Eight Limbs," is Thailand\'s national combat sport that utilizes fists, elbows, knees, and shins as points of contact. Renowned for its devastating clinch work and bone-crushing strikes, it is widely considered one of the most effective stand-up fighting systems in the world. Muay Thai forms the striking foundation of most modern mixed martial arts fighters.',
    history: 'Muay Thai evolved from the ancient battlefield art of Muay Boran, which Thai soldiers used in close-quarters combat for centuries. The sport became formalized in the early 20th century when rules, weight classes, and boxing gloves were introduced under King Rama VII. The legendary Nai Khanom Tom is celebrated as the father of Muay Thai, said to have defeated ten Burmese fighters in 1774 after being captured during the fall of Ayutthaya. Today, Muay Thai stadiums like Lumpinee and Rajadamnern in Bangkok are considered sacred grounds for the sport.',
    characteristics: [
      'Use of all eight limbs: fists, elbows, knees, and shins',
      'Devastating clinch fighting and neck wrestling',
      'Powerful low kicks targeting the legs and body',
      'Pre-fight Wai Kru Ram Muay ritual dance',
      'Emphasis on conditioning through shin hardening and pad work',
      'Mongkhon (headband) and Pra Jiad (armband) ceremonial gear'
    ],
    keyPrinciples: [
      'Maximum power through hip rotation and body commitment',
      'Control distance with teep (push kick) and long guard',
      'Dominate the clinch to impose your will',
      'Mental toughness and warrior spirit (Jai Dee)',
      'Respect for tradition, teacher (Kru), and opponents'
    ],
    rankingSystem: {
      type: 'none',
      ranks: [
        { name: 'Beginner', color: '#FFFFFF' },
        { name: 'Intermediate', color: '#FFD700' },
        { name: 'Advanced', color: '#FF6B35' },
        { name: 'Fighter', color: '#E74C3C' },
        { name: 'Professional', color: '#8B0000' },
        { name: 'Kru (Instructor)', color: '#2C3E50' },
        { name: 'Ajarn (Master)', color: '#1A1A2E' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Buakaw Banchamek', 'Samart Payakaroon', 'Saenchai', 'Dieselnoi Chor Thanasukarn'],
    techniqueCount: 0
  },

  taichi: {
    id: 'taichi',
    name: 'Tai Chi',
    origin: 'China',
    icon: '☯️',
    color: '#4ECDC4',
    type: 'internal',
    description: 'Tai Chi (Taijiquan) is an internal Chinese martial art practiced for both its defense training and profound health benefits. Characterized by slow, flowing movements performed with deep breathing and meditative focus, it embodies the Taoist philosophy of yin and yang. Practiced by millions worldwide, Tai Chi has been proven by modern science to improve balance, reduce stress, and enhance cardiovascular health.',
    history: 'The origins of Tai Chi are traditionally attributed to the Taoist monk Zhang Sanfeng on Wudang Mountain in the 12th or 13th century, though historical records are debated. The Chen family of Chenjiagou village in Henan province developed the first verifiable style of Tai Chi in the 17th century. From Chen style, Yang Luchan learned and modified the art to create Yang style in the 19th century, which became the most widely practiced form globally. Today, five major family styles exist: Chen, Yang, Wu, Wu (Hao), and Sun.',
    characteristics: [
      'Slow, continuous, flowing circular movements',
      'Deep diaphragmatic breathing synchronized with motion',
      'Rooting—maintaining a stable, grounded stance',
      'Push hands (Tui Shou) two-person sensitivity drills',
      'Emphasis on relaxation and softness overcoming hardness',
      'Multiple family styles with distinct characteristics'
    ],
    keyPrinciples: [
      'Yield to overcome—softness defeats hardness',
      'Root the feet, relax the body, concentrate the mind',
      'Move from the dantian (energy center below the navel)',
      'Continuity—movements flow without interruption',
      'Balance of yin and yang in all things'
    ],
    rankingSystem: {
      type: 'level',
      ranks: [
        { name: 'Level 1 - Foundation', color: '#FFFFFF' },
        { name: 'Level 2 - Form Practice', color: '#B0C4DE' },
        { name: 'Level 3 - Push Hands', color: '#4ECDC4' },
        { name: 'Level 4 - Weapons Forms', color: '#2ECC71' },
        { name: 'Level 5 - Internal Power', color: '#9B59B6' },
        { name: 'Level 6 - Master', color: '#1A1A2E' }
      ]
    },
    weapons: [
      { name: 'Tai Chi Jian (Sword)', icon: '🗡️', description: 'A double-edged straight sword used in flowing, precise forms that emphasize extension and intent.' },
      { name: 'Tai Chi Dao (Saber)', icon: '⚔️', description: 'A single-edged curved blade used with wrapping, coiling movements that express martial power.' },
      { name: 'Tai Chi Fan', icon: '🪭', description: 'A folding fan used as both a blocking tool and a striking weapon in elegant, dance-like forms.' }
    ],
    famousPractitioners: ['Yang Luchan', 'Chen Fake', 'Cheng Man-ching', 'Wang Zongyue'],
    techniqueCount: 0
  },

  sanda: {
    id: 'sanda',
    name: 'Sanda',
    origin: 'China',
    icon: '👊',
    color: '#FF4757',
    type: 'hybrid',
    description: 'Sanda (also known as Sanshou) is the official Chinese kickboxing and full-contact fighting sport, combining punches, kicks, and throws on an elevated lei tai platform. Developed by the Chinese military as a practical combat system, it distills the most effective techniques from traditional Chinese martial arts into a modern competitive framework. Sanda fighters are known for their explosive takedowns and powerful sidekicks.',
    history: 'Sanda was developed in the 1960s and 1970s by the Chinese military and the Beijing Physical Education University as a standardized combat sport for the People\'s Liberation Army. Drawing techniques from traditional styles like Shuai Jiao, Changquan, and various kung fu systems, it was designed to test martial skill in realistic full-contact competition. The sport was formalized for civilian competition in the 1980s and became a staple event at the World Wushu Championships. Sanda fighters have successfully crossed over into international kickboxing and MMA competitions.',
    characteristics: [
      'Full-contact fighting on an elevated lei tai platform',
      'Integration of punches, kicks, and wrestling throws',
      'Ring-out (pushing opponent off platform) scores points',
      'Fast-paced three-round bouts with protective gear',
      'Strong emphasis on takedowns and sweeps',
      'Derived from traditional Chinese martial arts for practical combat'
    ],
    keyPrinciples: [
      'Combine striking and grappling seamlessly',
      'Use the opponent\'s momentum for throws and sweeps',
      'Maintain aggressive forward pressure',
      'Adapt traditional techniques to modern combat situations',
      'Physical conditioning is as important as technical skill'
    ],
    rankingSystem: {
      type: 'level',
      ranks: [
        { name: 'Beginner', color: '#FFFFFF' },
        { name: 'Intermediate', color: '#3498DB' },
        { name: 'Advanced', color: '#2ECC71' },
        { name: 'Competition Level', color: '#FF4757' },
        { name: 'National Level', color: '#E74C3C' },
        { name: 'Elite/Professional', color: '#8B0000' },
        { name: 'Coach/Instructor', color: '#1A1A2E' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Cung Le', 'Liu Hailong', 'Muslim Salikhov', 'Wei Rui'],
    techniqueCount: 0
  },

  shaolin: {
    id: 'shaolin',
    name: 'Shaolin Kung Fu',
    origin: 'China',
    icon: '🏯',
    color: '#D4A017',
    type: 'hybrid',
    description: 'Shaolin Kung Fu is one of the oldest, most comprehensive, and most revered martial arts systems in the world, originating from the legendary Shaolin Temple in Henan Province, China. Encompassing hundreds of fighting forms, qigong exercises, and meditation practices, it represents the pinnacle of Chinese martial heritage. The art integrates Chan (Zen) Buddhist philosophy with devastating combat techniques, producing warriors monks renowned throughout history.',
    history: 'The Shaolin Temple was founded in 495 AD by Emperor Xiaowen of the Northern Wei Dynasty. According to legend, the Indian monk Bodhidharma arrived at the temple around 527 AD and taught the monks exercises to improve their health, which evolved into martial training. The temple monks gained fame when 13 of them helped Li Shimin (future Emperor Taizong) defeat the rebel Wang Shichong in 621 AD. Over centuries, Shaolin monks developed hundreds of fighting styles inspired by animals, elements, and Buddhist philosophy, making the temple a cradle of Chinese martial arts.',
    characteristics: [
      'Hundreds of distinct fighting forms and animal styles',
      'Integration of Chan Buddhism with martial practice',
      'Legendary iron body conditioning and pain resistance',
      'Five Animal styles: Tiger, Crane, Leopard, Snake, Dragon',
      'Qigong and meditation as foundations of training',
      'Weapon mastery across dozens of traditional arms'
    ],
    keyPrinciples: [
      'Chan (Zen) and Quan (Fist) are one—martial arts as moving meditation',
      'Endurance through suffering builds unbreakable spirit',
      'Mastery requires decades of daily, disciplined practice',
      'Martial skill serves to protect, never to bully',
      'Harmony of body, mind, and spirit'
    ],
    rankingSystem: {
      type: 'sash',
      ranks: [
        { name: 'White Sash (Novice)', color: '#FFFFFF' },
        { name: 'Yellow Sash', color: '#FFD700' },
        { name: 'Orange Sash', color: '#FF8C00' },
        { name: 'Green Sash', color: '#2ECC71' },
        { name: 'Blue Sash', color: '#1E90FF' },
        { name: 'Brown Sash', color: '#8B4513' },
        { name: 'Black Sash', color: '#1A1A2E' },
        { name: 'Gold Sash (Grandmaster)', color: '#DAA520' }
      ]
    },
    weapons: [
      { name: 'Gun (Staff)', icon: '🥢', description: 'The signature weapon of Shaolin monks, used in sweeping, spinning attacks and considered the foundation of weapons training.' },
      { name: 'Dao (Broadsword)', icon: '⚔️', description: 'A curved, single-edged blade wielded with powerful chopping and slashing techniques.' },
      { name: 'Qiang (Spear)', icon: '🔱', description: 'A long-reaching thrusting weapon that trains precision and timing at distance.' },
      { name: 'Sanjiegun (Three-Section Staff)', icon: '⛓️', description: 'Three short sticks connected by chains, requiring exceptional coordination and dexterity.' },
      { name: 'Jiu Jie Bian (Nine-Section Whip)', icon: '⛓️', description: 'A flexible chain weapon with nine metal segments that can wrap, strike, and entangle.' }
    ],
    famousPractitioners: ['Bodhidharma', 'Shi Yan Ming', 'Shi De Yang', 'Jet Li'],
    techniqueCount: 0
  },

  judo: {
    id: 'judo',
    name: 'Judo',
    origin: 'Japan',
    icon: '🥋',
    color: '#2E86AB',
    type: 'grappling',
    description: 'Judo, meaning "the gentle way," is a modern Japanese martial art and Olympic sport created by Jigoro Kano in 1882. It focuses on throwing opponents to the ground with maximum efficiency and minimum effort, followed by pins, joint locks, and chokes for submission. Judo\'s emphasis on randori (free sparring) and its philosophy of mutual welfare and benefit have made it one of the most widely practiced martial arts in the world.',
    history: 'Jigoro Kano founded Judo in 1882 at the Kodokan in Tokyo, synthesizing techniques from various jujutsu schools—primarily Tenjin Shin\'yo-ryu and Kito-ryu. Kano removed the most dangerous techniques to create a safe yet effective system that could be practiced at full intensity. Judo became the first Asian martial art admitted to the Olympic Games in 1964 at the Tokyo Olympics. The International Judo Federation now boasts over 200 member nations, making Judo one of the most globally practiced combat sports.',
    characteristics: [
      'Emphasis on throws (nage-waza) using leverage and timing',
      'Ground techniques (ne-waza) including pins, locks, and chokes',
      'Randori (free sparring) as primary training method',
      'Standardized competition rules under IJF governance',
      'Ukemi (breakfall) training for safe falling',
      'Gi (judogi) grip fighting as tactical foundation'
    ],
    keyPrinciples: [
      'Seiryoku Zenyo—maximum efficiency with minimum effort',
      'Jita Kyoei—mutual welfare and benefit',
      'Use the opponent\'s force and momentum against them',
      'Kuzushi (breaking balance) precedes every technique',
      'Continuous improvement through disciplined practice'
    ],
    rankingSystem: {
      type: 'belt',
      ranks: [
        { name: 'White Belt (6th Kyu)', color: '#FFFFFF' },
        { name: 'Yellow Belt (5th Kyu)', color: '#FFD700' },
        { name: 'Orange Belt (4th Kyu)', color: '#FF8C00' },
        { name: 'Green Belt (3rd Kyu)', color: '#2ECC71' },
        { name: 'Blue Belt (2nd Kyu)', color: '#1E90FF' },
        { name: 'Brown Belt (1st Kyu)', color: '#8B4513' },
        { name: 'Black Belt (1st-5th Dan)', color: '#1A1A2E' },
        { name: 'Red and White Belt (6th-8th Dan)', color: '#E74C3C' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Jigoro Kano', 'Masahiko Kimura', 'Yasuhiro Yamashita', 'Teddy Riner'],
    techniqueCount: 0
  },

  bjj: {
    id: 'bjj',
    name: 'Brazilian Jiu-Jitsu',
    origin: 'Brazil',
    icon: '🤼',
    color: '#6C5CE7',
    type: 'grappling',
    description: 'Brazilian Jiu-Jitsu (BJJ) is a ground-fighting martial art that emphasizes positional control and submission techniques, enabling a smaller practitioner to defeat a larger opponent through leverage and technique. Born from the Gracie family\'s adaptation of Japanese Judo and Jujutsu, BJJ revolutionized modern combat sports and proved its effectiveness in the early UFC tournaments. It is now considered an essential component of any complete mixed martial arts skillset.',
    history: 'BJJ traces its lineage to Mitsuyo Maeda, a Kodokan Judo expert who emigrated to Brazil in 1914 and taught his art to Carlos Gracie and his brothers. The Gracie family, particularly Helio Gracie, refined the techniques with an emphasis on ground fighting and leverage-based submissions suitable for smaller practitioners. Royce Gracie\'s dominant performances in the first UFC events in 1993 shocked the martial arts world and proved BJJ\'s effectiveness against larger, stronger opponents from other disciplines. Today, BJJ is practiced in virtually every country with a thriving competition scene under organizations like the IBJJF.',
    characteristics: [
      'Dominant positional control on the ground (mount, back, guard)',
      'Submission techniques: chokes, joint locks, and compression locks',
      'Guard play—fighting effectively from the bottom position',
      'Gi and No-Gi variations with distinct strategies',
      'Rolling (live sparring) as the primary training method',
      'Emphasis on technique and leverage over strength and size'
    ],
    keyPrinciples: [
      'Position before submission—establish control first',
      'Use leverage and frames to overcome size and strength',
      'Every position has an escape, sweep, or submission',
      'Flow with resistance rather than fight against it',
      'Constant problem-solving and adaptation'
    ],
    rankingSystem: {
      type: 'belt',
      ranks: [
        { name: 'White Belt', color: '#FFFFFF' },
        { name: 'Blue Belt', color: '#1E90FF' },
        { name: 'Purple Belt', color: '#9B59B6' },
        { name: 'Brown Belt', color: '#8B4513' },
        { name: 'Black Belt', color: '#1A1A2E' },
        { name: 'Red and Black Belt (Coral)', color: '#E74C3C' },
        { name: 'Red Belt (Grandmaster)', color: '#C0392B' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Helio Gracie', 'Royce Gracie', 'Marcelo Garcia', 'Gordon Ryan'],
    techniqueCount: 0
  },

  aikido: {
    id: 'aikido',
    name: 'Aikido',
    origin: 'Japan',
    icon: '🌀',
    color: '#00B894',
    type: 'grappling',
    description: 'Aikido is a Japanese martial art created by Morihei Ueshiba that focuses on harmonizing with an attacker\'s energy and redirecting it through flowing throws and joint locks. Often called "the way of harmony with spirit," Aikido uniquely seeks to neutralize aggression without causing unnecessary harm to the attacker. Its circular movements and emphasis on blending make it one of the most philosophically rich martial arts ever developed.',
    history: 'Morihei Ueshiba (1883-1969), known as O-Sensei, developed Aikido from his extensive training in Daito-ryu Aiki-jujutsu under Sokaku Takeda, combined with his deep spiritual beliefs in the Omoto-kyo religion. Ueshiba formally established Aikido in the 1920s-1930s, seeking to create a martial art that could defend effectively while also protecting the attacker. After World War II, the Aikikai Foundation was established in Tokyo to spread Aikido worldwide. Today, Aikido is practiced in over 140 countries, though it remains a topic of debate regarding its practical combat effectiveness.',
    characteristics: [
      'Circular, flowing movements that redirect attacking energy',
      'Joint locks (kansetsu-waza) applied with minimal force',
      'Throws that use the attacker\'s momentum against them',
      'Ukemi (falling techniques) essential for safe practice',
      'No competitive sparring in most traditional schools',
      'Weapons training with jo (staff), bokken (wooden sword), and tanto (knife)'
    ],
    keyPrinciples: [
      'Harmony (Ai)—blend with the attacker, do not oppose force',
      'Enter and turn (Irimi and Tenkan)—the two fundamental movements',
      'Protect both yourself and your attacker',
      'Ki (internal energy) flows through relaxed technique',
      'True victory is victory over oneself (Masakatsu Agatsu)'
    ],
    rankingSystem: {
      type: 'dan',
      ranks: [
        { name: '6th Kyu (White Belt)', color: '#FFFFFF' },
        { name: '5th Kyu', color: '#FFD700' },
        { name: '4th Kyu', color: '#FF8C00' },
        { name: '3rd Kyu', color: '#2ECC71' },
        { name: '2nd Kyu', color: '#1E90FF' },
        { name: '1st Kyu (Brown Belt)', color: '#8B4513' },
        { name: 'Shodan (1st Dan Black Belt)', color: '#1A1A2E' },
        { name: 'Yondan+ (Senior Dan)', color: '#4A0E4E' }
      ]
    },
    weapons: [
      { name: 'Jo (Short Staff)', icon: '🥢', description: 'A 128cm wooden staff used in flowing, circular striking and thrusting patterns called jo-kata.' },
      { name: 'Bokken (Wooden Sword)', icon: '⚔️', description: 'A wooden training sword modeled after the katana, used to teach cutting angles and distance management.' },
      { name: 'Tanto (Wooden Knife)', icon: '🔪', description: 'A wooden training knife used to practice defense against close-range blade attacks.' }
    ],
    famousPractitioners: ['Morihei Ueshiba', 'Koichi Tohei', 'Steven Seagal', 'Christian Tissier'],
    techniqueCount: 0
  },

  capoeira: {
    id: 'capoeira',
    name: 'Capoeira',
    origin: 'Brazil',
    icon: '🎵',
    color: '#FDCB6E',
    type: 'striking',
    description: 'Capoeira is a uniquely Brazilian martial art that seamlessly blends fighting, acrobatics, music, and dance into a vibrant cultural expression. Developed by enslaved Africans in Brazil, it disguises devastating kicks and sweeps within fluid, dance-like movements performed inside a circle called the roda. Recognized by UNESCO as an Intangible Cultural Heritage of Humanity, Capoeira is as much a celebration of resilience and community as it is a fighting system.',
    history: 'Capoeira was created by enslaved Africans in Brazil during the 16th century as a means of self-defense disguised as dance and play to avoid detection by slave owners. After the abolition of slavery in 1888, Capoeira was criminalized and driven underground until Mestre Bimba founded the first official academy in Salvador, Bahia, in 1932, creating the faster "Regional" style. Mestre Pastinha preserved the traditional "Angola" style, emphasizing the art\'s African roots and ritualistic elements. In 2014, UNESCO inscribed the Roda de Capoeira on its Representative List of the Intangible Cultural Heritage of Humanity.',
    characteristics: [
      'Fluid, dance-like movements blending combat and acrobatics',
      'The Roda—a circle of players who sing, clap, and take turns sparring',
      'Live musical accompaniment with berimbau, pandeiro, and atabaque',
      'Ginga—the fundamental swaying movement that is the base of all techniques',
      'Emphasis on evasion, deception, and improvisation',
      'Two main styles: Capoeira Angola (traditional) and Regional (modern)'
    ],
    keyPrinciples: [
      'Malicia—cunning, trickery, and unpredictability in movement',
      'Mandinga—the mystical, playful energy of the game',
      'Community and connection through the roda',
      'Music guides the rhythm, intensity, and spirit of the game',
      'Express yourself—every capoeirista develops a unique style'
    ],
    rankingSystem: {
      type: 'belt',
      ranks: [
        { name: 'Crua (Raw/Beginner)', color: '#FFFFFF' },
        { name: 'Cordao Amarelo (Yellow)', color: '#FFD700' },
        { name: 'Cordao Laranja (Orange)', color: '#FF8C00' },
        { name: 'Cordao Azul (Blue)', color: '#1E90FF' },
        { name: 'Cordao Verde (Green)', color: '#2ECC71' },
        { name: 'Cordao Roxa (Purple)', color: '#9B59B6' },
        { name: 'Cordao Marrom (Brown)', color: '#8B4513' },
        { name: 'Mestre (Master)', color: '#FFFFFF' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Mestre Bimba', 'Mestre Pastinha', 'Mestre Joao Grande', 'Lateef Crowder'],
    techniqueCount: 0
  },

  shuaijiao: {
    id: 'shuaijiao',
    name: 'Shuai Jiao',
    origin: 'China',
    icon: '🤸',
    color: '#A29BFE',
    type: 'grappling',
    description: 'Shuai Jiao is the oldest known Chinese martial art and one of the world\'s oldest wrestling systems, with roots stretching back over 4,000 years. Focused on throws, takedowns, and trips performed while standing, it emphasizes the use of a short jacket for gripping. Shuai Jiao\'s techniques heavily influenced Judo and modern Sanda, making it a foundational grappling art of East Asian martial traditions.',
    history: 'Shuai Jiao\'s origins can be traced to the ancient sport of Jiao Di during the Zhou Dynasty (1046-256 BC), where competitors wore horned helmets and attempted to gore each other. Over millennia, it evolved from military training into a refined wrestling art practiced in the imperial court and by the Manchu military. During the Qing Dynasty, a specialized unit called the Shanpuying was dedicated to Shuai Jiao training for the emperor\'s guard. In the 20th century, Grandmaster Chang Dongsheng, known as the "Flying Butterfly," popularized the art by defeating all challengers in national competitions and later brought Shuai Jiao to Taiwan.',
    characteristics: [
      'Standing throws, trips, and takedowns—no ground fighting',
      'Jacket (Da Lian) grip fighting for leverage and control',
      'Fast-paced matches requiring explosive speed and timing',
      'Integration of striking set-ups into throwing techniques',
      'Low stances and rooted footwork for stability',
      'Over 4,000 years of continuous documented history'
    ],
    keyPrinciples: [
      'Control the grip, control the fight',
      'Use the opponent\'s movement and weight against them',
      'Timing and speed are more important than raw strength',
      'Low center of gravity provides stability and throwing power',
      'Every step is an opportunity for a throw'
    ],
    rankingSystem: {
      type: 'level',
      ranks: [
        { name: 'Beginner (Chu Ji)', color: '#FFFFFF' },
        { name: 'Intermediate (Zhong Ji)', color: '#A29BFE' },
        { name: 'Advanced (Gao Ji)', color: '#6C5CE7' },
        { name: 'Expert', color: '#4834D4' },
        { name: 'Master (Shi Fu)', color: '#1A1A2E' },
        { name: 'Grandmaster (Da Shi)', color: '#DAA520' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Chang Dongsheng', 'Li Baoyu', 'Wang Wenyong', 'Zhang Baosheng'],
    techniqueCount: 0
  },

  karate: {
    id: 'karate',
    name: 'Karate',
    origin: 'Okinawa/Japan',
    icon: '🥋',
    color: '#E17055',
    type: 'striking',
    description: 'Karate, meaning "empty hand," is a striking martial art that originated in the Ryukyu Kingdom (modern Okinawa) and was later popularized throughout mainland Japan. It emphasizes powerful punches, kicks, knee strikes, and elbow strikes delivered with precise body mechanics and kime (focused power). With millions of practitioners across dozens of styles worldwide, Karate made its Olympic debut at the 2020 Tokyo Games.',
    history: 'Karate developed in Okinawa through the blending of indigenous Okinawan fighting methods (called Te or Tode) with Chinese martial arts introduced through centuries of trade with Fujian Province. The three main Okinawan cities—Shuri, Naha, and Tomari—each developed distinct fighting traditions that became the foundation of modern styles. Gichin Funakoshi introduced Karate to mainland Japan in 1922, founding Shotokan and adapting the art for Japanese culture. Today, major styles include Shotokan, Shito-ryu, Goju-ryu, and Wado-ryu, each with distinct technical philosophies.',
    characteristics: [
      'Powerful linear strikes with kime (focused power at point of impact)',
      'Deep stances providing stability and power generation',
      'Kata—pre-arranged forms containing combat applications (bunkai)',
      'Kumite—sparring ranging from point-based to full-contact',
      'Kiai—spirit shout used to focus energy and intimidate',
      'Multiple distinct styles with varying emphasis on speed, power, or flow'
    ],
    keyPrinciples: [
      'Karate begins and ends with respect (courtesy)',
      'There is no first attack in Karate (Karate ni sente nashi)',
      'Spirit first, technique second—indomitable will is paramount',
      'Know yourself before knowing others',
      'Perfection of character through lifelong training (Dojo Kun)'
    ],
    rankingSystem: {
      type: 'belt',
      ranks: [
        { name: 'White Belt (10th Kyu)', color: '#FFFFFF' },
        { name: 'Yellow Belt (8th Kyu)', color: '#FFD700' },
        { name: 'Orange Belt (7th Kyu)', color: '#FF8C00' },
        { name: 'Green Belt (6th Kyu)', color: '#2ECC71' },
        { name: 'Blue Belt (4th Kyu)', color: '#1E90FF' },
        { name: 'Brown Belt (3rd-1st Kyu)', color: '#8B4513' },
        { name: 'Black Belt (Shodan)', color: '#1A1A2E' },
        { name: 'Red Belt (9th-10th Dan)', color: '#C0392B' }
      ]
    },
    weapons: [
      { name: 'Bo (Staff)', icon: '🥢', description: 'A six-foot wooden staff that is the most iconic Okinawan kobudo weapon, used in sweeping and thrusting attacks.' },
      { name: 'Sai', icon: '🔱', description: 'A three-pronged metal trident used for trapping blades and delivering powerful thrusts.' },
      { name: 'Nunchaku', icon: '⛓️', description: 'Two short sticks connected by a cord or chain, requiring speed and coordination for striking and blocking.' },
      { name: 'Tonfa', icon: '🔧', description: 'An L-shaped wooden handle used for blocking, striking, and hooking—the ancestor of the modern police baton.' }
    ],
    famousPractitioners: ['Gichin Funakoshi', 'Mas Oyama', 'Lyoto Machida', 'Mikio Yahara'],
    techniqueCount: 0
  },

  taekwondo: {
    id: 'taekwondo',
    name: 'Taekwondo',
    origin: 'Korea',
    icon: '🦶',
    color: '#0984E3',
    type: 'striking',
    description: 'Taekwondo, meaning "the way of the foot and fist," is Korea\'s most famous martial art and an Olympic sport since 2000. Renowned for its spectacular high kicks, spinning techniques, and dynamic footwork, Taekwondo places primary emphasis on kicking as the longest and most powerful weapon of the body. With over 80 million practitioners in 210 countries, it is one of the most widely practiced martial arts on Earth.',
    history: 'Taekwondo was developed in the 1940s and 1950s by several Korean martial artists who had studied Japanese Karate during the occupation period, combined with influences from traditional Korean kicking arts like Taekkyeon. General Choi Hong Hi is often credited as the founder, establishing the name "Taekwondo" in 1955 and founding the International Taekwon-Do Federation (ITF) in 1966. The World Taekwondo (WT, formerly WTF) was established in 1973 under the Kukkiwon in Seoul, becoming the governing body for Olympic-style competition. Taekwondo became a full Olympic medal sport at the 2000 Sydney Games.',
    characteristics: [
      'Emphasis on high, fast, and spinning kicks',
      'Dynamic footwork and explosive gap-closing techniques',
      'Electronic scoring systems (Protector and Scoring System) in WT competitions',
      'Poomsae (forms) preserving traditional technique patterns',
      'Board breaking (kyukpa) demonstrating power and precision',
      'Head-height kicks scored higher in competition to encourage spectacular technique'
    ],
    keyPrinciples: [
      'Courtesy (Ye-ui)—respect for all',
      'Integrity (Yom-chi)—honesty and moral character',
      'Perseverance (In-nae)—patience in achieving goals',
      'Self-Control (Guk-gi)—control over body and mind',
      'Indomitable Spirit (Baekjul-boolgool)—never give up'
    ],
    rankingSystem: {
      type: 'belt',
      ranks: [
        { name: 'White Belt (10th Gup)', color: '#FFFFFF' },
        { name: 'Yellow Belt (8th Gup)', color: '#FFD700' },
        { name: 'Green Belt (6th Gup)', color: '#2ECC71' },
        { name: 'Blue Belt (4th Gup)', color: '#1E90FF' },
        { name: 'Red Belt (2nd Gup)', color: '#E74C3C' },
        { name: 'Black Belt (1st Dan)', color: '#1A1A2E' },
        { name: 'Master (4th Dan+)', color: '#2C3E50' },
        { name: 'Grandmaster (9th Dan)', color: '#DAA520' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Choi Hong Hi', 'Hwang Kee', 'Steven Lopez', 'Jade Jones'],
    techniqueCount: 0
  },

  wingchun: {
    id: 'wingchun',
    name: 'Wing Chun',
    origin: 'China',
    icon: '🦢',
    color: '#E84393',
    type: 'striking',
    description: 'Wing Chun is a concept-based Chinese martial art specializing in close-range combat, rapid-fire chain punching, and simultaneous defense and attack. Designed for efficiency and directness, it emphasizes centerline theory and economy of motion to overwhelm opponents with relentless forward pressure. Made globally famous by Ip Man and his student Bruce Lee, Wing Chun is one of the most widely practiced Southern Chinese kung fu styles.',
    history: 'According to legend, Wing Chun was created by the Buddhist nun Ng Mui, a survivor of the destruction of the Shaolin Temple, who taught the art to a young woman named Yim Wing Chun to defend herself against a local warlord. The art was passed through a small lineage until Grandmaster Ip Man brought it to Hong Kong in 1949, where he trained hundreds of students including the legendary Bruce Lee. Bruce Lee\'s fame in the 1970s brought worldwide attention to Wing Chun, though Lee eventually developed his own art, Jeet Kune Do. Today, Wing Chun is practiced globally with various lineages tracing back to Ip Man.',
    characteristics: [
      'Centerline theory—protect and attack along the vertical center axis',
      'Chain punching (Lin Wan Kuen)—rapid sequential straight punches',
      'Chi Sao (sticky hands)—sensitivity drill for close-range reflexes',
      'Simultaneous block and strike (Lat Sao)',
      'Compact, efficient techniques designed for tight spaces',
      'Wooden dummy (Muk Yan Jong) training for conditioning and technique'
    ],
    keyPrinciples: [
      'Simplicity—the most direct technique is the best technique',
      'Economy of motion—no wasted movement or energy',
      'Simultaneous defense and attack',
      'Forward pressure—always advance toward the opponent',
      'Sensitivity and reflex over brute strength'
    ],
    rankingSystem: {
      type: 'level',
      ranks: [
        { name: 'Siu Nim Tao (Little Idea Form)', color: '#FFFFFF' },
        { name: 'Chum Kiu (Seeking the Bridge)', color: '#E84393' },
        { name: 'Biu Jee (Thrusting Fingers)', color: '#D63031' },
        { name: 'Muk Yan Jong (Wooden Dummy)', color: '#8B4513' },
        { name: 'Luk Dim Boon Gwun (Long Pole)', color: '#636E72' },
        { name: 'Baat Jaam Do (Butterfly Swords)', color: '#2D3436' },
        { name: 'Sifu (Master Level)', color: '#1A1A2E' }
      ]
    },
    weapons: [
      { name: 'Baat Jaam Do (Butterfly Swords)', icon: '⚔️', description: 'A pair of short, single-edged blades used in close quarters with chopping and slashing techniques unique to Wing Chun.' },
      { name: 'Luk Dim Boon Gwun (Dragon Pole)', icon: '🥢', description: 'A tapered long pole (approximately 8-13 feet) used with thrusting and sweeping movements to develop full-body power.' }
    ],
    famousPractitioners: ['Ip Man', 'Bruce Lee', 'Wong Shun Leung', 'William Cheung'],
    techniqueCount: 0
  },

  kravmaga: {
    id: 'kravmaga',
    name: 'Krav Maga',
    origin: 'Israel',
    icon: '⚡',
    color: '#636E72',
    type: 'hybrid',
    description: 'Krav Maga is a military self-defense and fighting system developed for the Israel Defense Forces (IDF) that emphasizes real-world threat neutralization with maximum aggression and efficiency. Unlike traditional martial arts, Krav Maga has no sporting rules, kata, or artistic elements—every technique is designed to end a violent encounter as quickly as possible. It integrates techniques from boxing, wrestling, judo, aikido, and street fighting into a brutally practical system.',
    history: 'Krav Maga was developed by Imi Lichtenfeld (Imi Sde-Or), a Hungarian-Israeli martial artist who grew up in Bratislava, Slovakia, where he used his boxing and wrestling skills to defend the Jewish community against fascist groups in the 1930s. After emigrating to Israel in 1948, Lichtenfeld was recruited to train the newly formed IDF in hand-to-hand combat. He refined his system over decades, eventually adapting it for civilian self-defense after retiring from military service in 1964. Today, Krav Maga is taught to military, law enforcement, and civilians worldwide through organizations like Krav Maga Global and the International Krav Maga Federation.',
    characteristics: [
      'No rules, no sporting application—pure self-defense focus',
      'Simultaneous defense and counterattack',
      'Targeting vulnerable areas: eyes, throat, groin, knees',
      'Stress inoculation training under realistic conditions',
      'Weapon defense: guns, knives, sticks, and multiple attackers',
      'Aggressive, overwhelming counterattack philosophy ("retzev"—continuous combat motion)'
    ],
    keyPrinciples: [
      'Neutralize the threat as quickly as possible',
      'Use natural body movements—nothing fancy or complex',
      'Awareness and avoidance are the first line of defense',
      'Any object can be a weapon; any part of the body can strike',
      'Train under stress to perform under stress'
    ],
    rankingSystem: {
      type: 'level',
      ranks: [
        { name: 'Practitioner 1 (P1)', color: '#FFFFFF' },
        { name: 'Practitioner 2 (P2)', color: '#BDC3C7' },
        { name: 'Practitioner 3 (P3)', color: '#95A5A6' },
        { name: 'Graduate 1 (G1)', color: '#636E72' },
        { name: 'Graduate 2 (G2)', color: '#2D3436' },
        { name: 'Expert 1 (E1)', color: '#1A1A2E' },
        { name: 'Expert 5 (E5) / Master', color: '#DAA520' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Imi Lichtenfeld', 'Eyal Yanilov', 'Darren Levine', 'Nir Maman'],
    techniqueCount: 0
  },

  hapkido: {
    id: 'hapkido',
    name: 'Hapkido',
    origin: 'Korea',
    icon: '🔄',
    color: '#00CEC9',
    type: 'hybrid',
    description: 'Hapkido, meaning "the way of coordinated power," is a comprehensive Korean martial art that integrates striking, joint locks, throws, and dynamic kicking into a unified self-defense system. Unlike Taekwondo\'s sport-oriented approach, Hapkido emphasizes practical self-defense techniques that redirect an attacker\'s force using circular motion. Its curriculum is one of the most extensive of any martial art, covering armed and unarmed scenarios at all ranges.',
    history: 'Hapkido was founded by Choi Yong-Sool, who claimed to have studied Daito-ryu Aiki-jujutsu under Sokaku Takeda in Japan during the colonial period, though this claim has been debated by historians. Upon returning to Korea after World War II, Choi began teaching his art in Daegu in 1948. His student Ji Han-Jae is credited with organizing and systematizing the techniques, adding high kicks and weapons training, and coining the name "Hapkido." Ji Han-Jae also served as the personal martial arts instructor to South Korean President Park Chung-hee and choreographed fight scenes for the film "Game of Death" with Bruce Lee.',
    characteristics: [
      'Comprehensive self-defense covering all ranges of combat',
      'Joint locks and wrist manipulation techniques (600+ variations)',
      'Circular motion to redirect and control attacking force',
      'Incorporation of high kicks from Korean kicking traditions',
      'Both hard (linear) and soft (circular) techniques',
      'Extensive weapons curriculum including cane, belt, and fan'
    ],
    keyPrinciples: [
      'Hwa (Harmony)—blend with the opponent\'s force',
      'Won (Circular Motion)—redirect energy in circular paths',
      'Yu (Water)—flow like water, adapting to the situation',
      'Control rather than destroy—subdue without excessive harm',
      'Ki (internal energy) development through breathing and meditation'
    ],
    rankingSystem: {
      type: 'belt',
      ranks: [
        { name: 'White Belt (10th Gup)', color: '#FFFFFF' },
        { name: 'Yellow Belt (8th Gup)', color: '#FFD700' },
        { name: 'Green Belt (6th Gup)', color: '#2ECC71' },
        { name: 'Blue Belt (4th Gup)', color: '#1E90FF' },
        { name: 'Red Belt (2nd Gup)', color: '#E74C3C' },
        { name: 'Black Belt (1st Dan)', color: '#1A1A2E' },
        { name: 'Master (4th Dan+)', color: '#2C3E50' },
        { name: 'Grandmaster (9th Dan)', color: '#DAA520' }
      ]
    },
    weapons: [
      { name: 'Dan Bong (Short Stick)', icon: '🥢', description: 'A short wooden stick (about 8 inches) used for joint locks, pressure point strikes, and leverage techniques.' },
      { name: 'Jang Bong (Long Staff)', icon: '🥢', description: 'A long wooden staff used for sweeping, blocking, and striking at extended range.' },
      { name: 'Cane (Ji Pang Ee)', icon: '🦯', description: 'A walking cane used as a concealed self-defense weapon for hooking, trapping, and striking.' }
    ],
    famousPractitioners: ['Choi Yong-Sool', 'Ji Han-Jae', 'Myung Jae-Nam', 'Bong Soo Han'],
    techniqueCount: 0
  },

  silat: {
    id: 'silat',
    name: 'Pencak Silat',
    origin: 'Southeast Asia',
    icon: '🐅',
    color: '#F39C12',
    type: 'hybrid',
    description: 'Pencak Silat is the umbrella term for the indigenous martial arts of the Malay Archipelago, practiced across Indonesia, Malaysia, Brunei, Singapore, the Philippines, and Thailand. Combining striking, grappling, bladed weapons, and spiritual practices, Silat is deeply woven into the cultural identity of Southeast Asia. Its combat techniques are renowned for their vicious low-line attacks, rapid takedowns, and devastating blade work, making it one of the most lethal traditional martial arts.',
    history: 'The origins of Pencak Silat are rooted in the tribal warfare and self-defense practices of the Malay peoples dating back over a thousand years, with influences from Indian, Chinese, and indigenous fighting systems. Historical records from the Majapahit Empire (1293-1527) and the Srivijaya Kingdom describe warrior classes trained in systematic combat arts. The term "Pencak Silat" was officially adopted in 1948 to unify the hundreds of regional styles under one name by the Indonesian Pencak Silat Association (IPSI). Pencak Silat made its debut as an official sport at the 2018 Asian Games in Jakarta, where Indonesia dominated the medal count.',
    characteristics: [
      'Low stances and ground-level attacks targeting legs and joints',
      'Rapid takedowns, sweeps, and throws from close range',
      'Extensive blade and machete (golok/parang) techniques',
      'Animal-inspired movements (tiger, snake, eagle, monkey)',
      'Jurus (pre-arranged combat sequences) as training foundation',
      'Deep spiritual and cultural dimensions including inner power (tenaga dalam)'
    ],
    keyPrinciples: [
      'Efficiency and lethality—end the fight immediately',
      'Low center of gravity for stability and explosive movement',
      'Deception through angles, feints, and level changes',
      'Respect for the weapon—a blade changes everything',
      'Spiritual discipline accompanies physical training'
    ],
    rankingSystem: {
      type: 'sash',
      ranks: [
        { name: 'White (Pemula/Beginner)', color: '#FFFFFF' },
        { name: 'Yellow (Dasar)', color: '#FFD700' },
        { name: 'Green (Menengah)', color: '#2ECC71' },
        { name: 'Blue (Lanjutan)', color: '#1E90FF' },
        { name: 'Red (Terampil)', color: '#E74C3C' },
        { name: 'Brown (Mahir)', color: '#8B4513' },
        { name: 'Black (Pendekar/Master)', color: '#1A1A2E' }
      ]
    },
    weapons: [
      { name: 'Keris (Dagger)', icon: '🗡️', description: 'An asymmetrical, often wavy-bladed dagger considered a spiritual object and symbol of status throughout the Malay world.' },
      { name: 'Golok (Machete)', icon: '⚔️', description: 'A heavy chopping blade used for both agricultural work and close-quarters combat with devastating slashing power.' },
      { name: 'Parang (Cleaver)', icon: '⚔️', description: 'A large single-edged blade used throughout Southeast Asia as a tool and weapon, similar to a machete.' },
      { name: 'Toya (Staff)', icon: '🥢', description: 'A long wooden staff used for sweeping, blocking, and striking at range, often a practitioner\'s first weapon.' }
    ],
    famousPractitioners: ['Eddie Nalapraya', 'Cecep Arif Rahman', 'Iko Uwais', 'Tony Jaa'],
    techniqueCount: 0
  },

  kendo: {
    id: 'kendo',
    name: 'Kendo',
    origin: 'Japan',
    icon: '⚔️',
    color: '#2D3436',
    type: 'weapons',
    description: 'Kendo, meaning "the way of the sword," is a modern Japanese martial art of fencing that descended from traditional swordsmanship (kenjutsu) practiced by the samurai class. Using bamboo swords (shinai) and protective armor (bogu), kendoka engage in explosive, high-energy bouts scored by clean strikes to designated target areas. Kendo is as much a path of character development as it is a combat discipline, with the All Japan Kendo Federation stating its purpose is "to discipline the human character through the application of the principles of the katana."',
    history: 'Kendo evolved from the sword-fighting techniques of the samurai that were refined over centuries of Japanese feudal warfare. In the 18th century, Naganuma Shirouemon developed the first protective equipment (bogu) and bamboo training sword (shinai), allowing full-contact practice without fatal injury. After the Meiji Restoration in 1868, samurai culture declined, but kendo was preserved as a form of physical education in schools and police training. Following a brief ban during the Allied Occupation after World War II, the All Japan Kendo Federation was established in 1952, reviving the art as a modern budo (martial way).',
    characteristics: [
      'Full-contact sparring with shinai (bamboo sword) and bogu (armor)',
      'Four target areas: men (head), kote (wrist), do (torso), tsuki (throat)',
      'Kiai (spirit shout) required for a valid strike',
      'Kata practice with bokuto (wooden sword) preserving classical techniques',
      'Emphasis on zanshin—sustained alertness after striking',
      'Strict etiquette and ceremonial protocols in the dojo'
    ],
    keyPrinciples: [
      'Ki-Ken-Tai-Ichi—unity of spirit, sword, and body in every strike',
      'Seme—pressuring the opponent\'s center to create openings',
      'Zanshin—continued awareness and readiness after each action',
      'The purpose of Kendo is to perfect human character',
      'Reiho (etiquette)—respect permeates every aspect of practice'
    ],
    rankingSystem: {
      type: 'dan',
      ranks: [
        { name: '6th Kyu (Rokkyu)', color: '#FFFFFF' },
        { name: '4th Kyu (Yonkyu)', color: '#BDC3C7' },
        { name: '2nd Kyu (Nikyu)', color: '#636E72' },
        { name: '1st Kyu (Ikkyu)', color: '#2D3436' },
        { name: 'Shodan (1st Dan)', color: '#1A1A2E' },
        { name: 'Sandan (3rd Dan)', color: '#1A1A2E' },
        { name: 'Godan (5th Dan)', color: '#4A0E4E' },
        { name: 'Hachidan (8th Dan)', color: '#DAA520' }
      ]
    },
    weapons: [
      { name: 'Shinai (Bamboo Sword)', icon: '⚔️', description: 'A four-slat bamboo practice sword used for full-contact sparring, representing the katana.' },
      { name: 'Bokuto/Bokken (Wooden Sword)', icon: '⚔️', description: 'A solid wooden training sword used for kata practice and solo technique refinement.' },
      { name: 'Katana (Japanese Sword)', icon: '🗡️', description: 'The curved, single-edged steel sword of the samurai, studied in kata form and iaido (drawing cuts).' }
    ],
    famousPractitioners: ['Miyamoto Musashi', 'Mochida Moriji', 'Chiba Masashi', 'Eiga Naoki'],
    techniqueCount: 0
  },

  boxing: {
    id: 'boxing',
    name: 'Boxing',
    origin: 'Global',
    icon: '🥊',
    color: '#D63031',
    type: 'striking',
    description: 'Boxing, often called "the sweet science," is the world\'s oldest and most refined striking art, focusing exclusively on punching technique, footwork, and head movement. With origins stretching back to ancient civilizations, modern boxing has produced some of the greatest athletes in human history and remains the most watched combat sport globally. Its principles of timing, distance management, and defensive evasion form the striking foundation of virtually every modern fighter.',
    history: 'Boxing dates back to at least 3000 BC in ancient Sumer and was included in the ancient Olympic Games in 688 BC, where fighters wrapped their hands in leather thongs called himantes. The modern era of boxing began in 18th-century England with Jack Broughton\'s rules of 1743, later superseded by the Marquess of Queensberry Rules in 1867, which introduced gloves, three-minute rounds, and the ten-count. Boxing was included in the modern Olympic Games in 1904 and has since produced legendary champions across weight divisions. The sport has served as a pathway out of poverty for countless athletes and holds a unique place in global sporting culture.',
    characteristics: [
      'Four fundamental punches: jab, cross, hook, and uppercut',
      'Sophisticated footwork and ring generalship',
      'Head movement, slipping, and rolling for defense',
      'Weight class system from minimumweight to heavyweight',
      'Combination punching and counter-punching strategies',
      'Precise distance management and timing'
    ],
    keyPrinciples: [
      'Hit and don\'t get hit—offense and defense are intertwined',
      'The jab is the most important punch in boxing',
      'Footwork wins fights—control position and angle',
      'Timing beats speed, and precision beats power',
      'Mental toughness and heart define a true champion'
    ],
    rankingSystem: {
      type: 'level',
      ranks: [
        { name: 'Novice', color: '#FFFFFF' },
        { name: 'Amateur (Open Class)', color: '#3498DB' },
        { name: 'National Amateur', color: '#2ECC71' },
        { name: 'Elite Amateur / Olympic', color: '#FFD700' },
        { name: 'Professional (Debut)', color: '#E74C3C' },
        { name: 'Contender', color: '#8B0000' },
        { name: 'World Champion', color: '#DAA520' }
      ]
    },
    weapons: [],
    famousPractitioners: ['Muhammad Ali', 'Sugar Ray Robinson', 'Floyd Mayweather Jr.', 'Manny Pacquiao'],
    techniqueCount: 0
  }
};
