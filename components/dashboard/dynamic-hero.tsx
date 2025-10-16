import { motion } from 'framer-motion'

interface DynamicHeroProps {
  message: string
}

export function DynamicHero({ message }: DynamicHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="bg-white/40 backdrop-blur-sm border-b border-rogue-sage/10 -mx-8 px-8 py-8 rounded-lg">
        <p className="text-2xl md:text-3xl font-semibold text-rogue-forest leading-relaxed">
          {message}
        </p>
      </div>
    </motion.div>
  )
}

