'use client'

import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MODELS, DEFAULT_MODEL_ID } from '@/config/ai'

interface ModelSelectorProps {
  selectedModelId: string
  onModelChange: (modelId: string) => void
}

export function ModelSelector({ 
  selectedModelId = DEFAULT_MODEL_ID, 
  onModelChange
}: ModelSelectorProps) {
  const modelOptions = Object.values(MODELS)
  const selectedModel = MODELS[selectedModelId] || MODELS[DEFAULT_MODEL_ID]

  return (
    <div className="flex items-center space-x-1">
      <p className="text-sm text-muted-foreground mr-2 hidden sm:inline-block">Model:</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
          >
            <span className="text-xs">{selectedModel.name}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {modelOptions.map((model) => (
            <DropdownMenuItem
              key={model.id}
              className={cn(
                "text-xs flex items-center gap-2 cursor-pointer",
                selectedModelId === model.id && "font-medium"
              )}
              onClick={() => onModelChange(model.id)}
            >
              <div className="flex-1">{model.name}</div>
              {selectedModelId === model.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}