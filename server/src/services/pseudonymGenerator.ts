// Pseudonym generator - creates fun anonymous usernames
// Format: Adjective + Animal (e.g., "SleepyPanda", "BoldTiger")

const adjectives = [
  // Moods
  'Sleepy', 'Lazy', 'Chill', 'Hyper', 'Mellow', 'Grumpy', 'Happy', 'Moody',
  'Dreamy', 'Drowsy', 'Bored', 'Curious', 'Zen', 'Chaotic', 'Calm',
  
  // Personalities
  'Bold', 'Shy', 'Clever', 'Witty', 'Sneaky', 'Brave', 'Goofy', 'Nerdy',
  'Sassy', 'Quirky', 'Chill', 'Wild', 'Silly', 'Smooth', 'Edgy',
  
  // Vibes
  'Cosmic', 'Mystic', 'Neon', 'Pixel', 'Cyber', 'Retro', 'Astral', 'Electric',
  'Fuzzy', 'Spicy', 'Crispy', 'Minty', 'Sparkly', 'Glitchy', 'Toasty',
  
  // Random cool ones
  'Midnight', 'Shadow', 'Silent', 'Swift', 'Turbo', 'Mega', 'Ultra', 'Hyper',
  'Rapid', 'Stealth', 'Phantom', 'Ghost', 'Ninja', 'Rogue', 'Wandering',
  
  // Colors
  'Crimson', 'Azure', 'Golden', 'Silver', 'Violet', 'Coral', 'Jade', 'Amber',
  
  // Weather/Nature
  'Stormy', 'Sunny', 'Frosty', 'Misty', 'Windy', 'Cloudy', 'Rainy', 'Thunder',
]

const animals = [
  // Common cute ones
  'Panda', 'Koala', 'Otter', 'Fox', 'Owl', 'Cat', 'Dog', 'Bunny',
  'Hamster', 'Penguin', 'Seal', 'Duck', 'Goose', 'Raccoon', 'Hedgehog',
  
  // Majestic ones
  'Tiger', 'Lion', 'Wolf', 'Bear', 'Eagle', 'Hawk', 'Falcon', 'Panther',
  'Jaguar', 'Leopard', 'Lynx', 'Phoenix', 'Dragon', 'Griffin', 'Raven',
  
  // Ocean creatures
  'Shark', 'Dolphin', 'Whale', 'Octopus', 'Jellyfish', 'Squid', 'Orca', 'Narwhal',
  
  // Exotic ones
  'Llama', 'Alpaca', 'Capybara', 'Sloth', 'Axolotl', 'Platypus', 'Quokka',
  'Lemur', 'Meerkat', 'Wombat', 'Kiwi', 'Toucan', 'Parrot', 'Flamingo',
  
  // Insects/small creatures (cute context)
  'Bee', 'Moth', 'Mantis', 'Cricket', 'Firefly', 'Beetle',
  
  // Mythical
  'Unicorn', 'Yeti', 'Kraken', 'Hydra', 'Sphinx', 'Chimera',
  
  // Reptiles
  'Gecko', 'Chameleon', 'Turtle', 'Frog', 'Newt', 'Salamander',
  
  // Birds
  'Sparrow', 'Robin', 'Crow', 'Magpie', 'Hummingbird', 'Pelican',
]

export function generatePseudonym(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adjective}${animal}`
}

// Generate a unique pseudonym that's not in the existing list
export function generateUniquePseudonym(existing: Set<string>): string {
  let attempts = 0
  const maxAttempts = 100
  
  while (attempts < maxAttempts) {
    const pseudonym = generatePseudonym()
    if (!existing.has(pseudonym)) {
      return pseudonym
    }
    attempts++
  }
  
  // Fallback: add random numbers
  const base = generatePseudonym()
  const suffix = Math.floor(Math.random() * 1000)
  return `${base}${suffix}`
}
