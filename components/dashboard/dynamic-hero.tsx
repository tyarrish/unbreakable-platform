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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mb-12"
    >
      <div className="relative bg-gradient-to-br from-rogue-forest/5 via-white/40 to-rogue-sage/5 backdrop-blur-sm border border-rogue-sage/20 -mx-8 px-8 py-10 rounded-2xl shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rogue-gold/5 rounded-full blur-3xl -z-10" />
        <div className="relative z-10">
          <p className="text-3xl md:text-4xl font-bold text-rogue-forest leading-tight">
            <span className="text-rogue-gold">{name}.</span>
            {restOfMessage && (
              <>
                {' '}
                <span className="font-semibold">{restOfMessage}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

