'use client'

import { motion } from 'framer-motion'

interface DynamicHeroProps {
  message: string
}

export function DynamicHero({ message }: DynamicHeroProps) {
  // Split on first period to separate name from message
  const parts = message.split('. ')
  const name = parts[0]
  const restOfMessage = parts.slice(1).join('. ')
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-16 -mx-8 px-8"
    >
      <div className="relative py-12">
        {/* Subtle background accent */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-rogue-gold via-rogue-gold to-transparent rounded-full" />
        
        <div className="pl-6">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-rogue-forest leading-tight tracking-tight"
          >
            <span className="text-rogue-gold">{name}.</span>
          </motion.p>
          
          {restOfMessage && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl md:text-3xl lg:text-4xl font-semibold text-rogue-forest/90 leading-snug mt-4 max-w-4xl"
            >
              {restOfMessage}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

