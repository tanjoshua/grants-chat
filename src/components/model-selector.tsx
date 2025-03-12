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
      <p className="text-xs text-muted-foreground mr-1">Model:</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 px-2 py-0 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <span className="text-xs">{selectedModel.name}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {modelOptions.map((model) => (
            <DropdownMenuItem
              key={model.id}
              className={cn(
                "text-xs flex items-center gap-1 cursor-pointer py-1.5",
                selectedModelId === model.id && "font-medium"
              )}
              onClick={() => onModelChange(model.id)}
            >
              <div className="flex-1">{model.name}</div>
              {selectedModelId === model.id && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}