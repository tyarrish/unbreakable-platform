import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressTree } from '@/components/ui/progress-tree'
import { TrendingUp } from 'lucide-react'

interface JourneyContextProps {
  currentModule: {
    title: string
    orderNumber: number
  }
  totalModules?: number
}

export function JourneyContext({ currentModule, totalModules = 8 }: JourneyContextProps) {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-rogue-forest/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rogue-forest/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-rogue-forest" />
          </div>
          <div>
            <CardTitle className="text-xl">Your Leadership Journey</CardTitle>
            <p className="text-sm text-rogue-slate mt-1">
              {totalModules}-Month Program • {currentModule.title}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Tree Visualization */}
        <div className="mt-4">
          <ProgressTree
            progress={(currentModule.orderNumber / totalModules) * 100}
            showLabel={false}
          />
        </div>
        
        <div className="mt-6 p-4 bg-rogue-cream/50 rounded-lg">
          <p className="text-sm text-rogue-slate leading-relaxed">
            This journey isn't measured in percentages or completion rates. It's measured in the
            questions you're willing to sit with, the conversations you're brave enough to have,
            and the leader you're becoming.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

