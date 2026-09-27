/**
 * 1.16: onboarding's second randomizer — suggests a fun, dojo-nickname-style name alongside the
 * avatar generator. Mirrors Kiai/Services/NameGenerator.swift exactly.
 */
const ADJECTIVES = ['Iron', 'Swift', 'Silent', 'Golden', 'Crimson', 'Jade', 'Silver', 'Shadow', 'Blazing', 'Steel', 'Quiet', 'Fierce']
const NOUNS = ['Crane', 'Tiger', 'Falcon', 'Dragon', 'Fox', 'Wolf', 'Phoenix', 'Panther', 'Hawk', 'Viper', 'Lotus', 'Storm']

export function randomName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adjective} ${noun}`
}
