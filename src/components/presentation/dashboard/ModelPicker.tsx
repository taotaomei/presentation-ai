"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fallbackModels,
  getSelectedModel,
  setSelectedModel,
  useLocalModels,
} from "@/hooks/presentation/useLocalModels";
import { cn } from "@/lib/utils";
import { usePresentationState } from "@/states/presentation-state";
import { Bot, Check, ChevronsUpDown, Cpu, Globe, Loader2, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ModelPicker({
  shouldShowLabel = true,
}: {
  shouldShowLabel?: boolean;
}) {
  const { modelProvider, setModelProvider, modelId, setModelId, customBaseURL } =
    usePresentationState();

  const { data: modelsData, isLoading, isInitialLoad } = useLocalModels(customBaseURL);
  const hasRestoredFromStorage = useRef(false);
  const [open, setOpen] = useState(false);

  // Load saved model selection from localStorage on mount
  useEffect(() => {
    if (!hasRestoredFromStorage.current) {
      const savedModel = getSelectedModel();
      if (savedModel) {
        console.log("Restoring model from localStorage:", savedModel);
        setModelProvider(
          savedModel.modelProvider as "openai" | "ollama" | "lmstudio" | "custom",
        );
        setModelId(savedModel.modelId);
      }
      hasRestoredFromStorage.current = true;
    }
  }, [setModelProvider, setModelId]);

  // Use cached data if available, otherwise show fallback
  const displayData = modelsData || {
    localModels: fallbackModels,
    downloadableModels: [],
    showDownloadable: true,
  };

  const { localModels, downloadableModels, showDownloadable } = displayData;

  // Group models by provider
  const ollamaModels = localModels.filter(
    (model) => model.provider === "ollama",
  );
  const lmStudioModels = localModels.filter(
    (model) => model.provider === "lmstudio",
  );
  const customModels = localModels.filter(
    (model) => model.provider === "custom",
  );
  const downloadableOllamaModels = downloadableModels.filter(
    (model) => model.provider === "ollama",
  );

  // Helper function to create model option
  const createModelOption = (
    model: (typeof localModels)[0],
    isDownloadable = false,
  ) => ({
    id: model.id,
    label: model.name,
    displayLabel:
      model.provider === "ollama"
        ? `ollama ${model.name}`
        : model.provider === "lmstudio"
          ? `lm-studio ${model.name}`
          : model.name,
    icon: model.provider === "ollama" ? Cpu : model.provider === "lmstudio" ? Monitor : Globe,
    description: isDownloadable
      ? `Downloadable ${model.provider === "ollama" ? "Ollama" : "LM Studio"} model (will auto-download)`
      : model.provider === "custom"
        ? "Custom API model"
        : `Local ${model.provider === "ollama" ? "Ollama" : "LM Studio"} model`,
    isDownloadable,
  });

  // Get current model value
  const getCurrentModelValue = () => {
    if (modelProvider === "ollama") {
      return `ollama-${modelId}`;
    } else if (modelProvider === "lmstudio") {
      return `lmstudio-${modelId}`;
    } else if (modelProvider === "custom") {
      return `custom-${modelId}`;
    }
    return modelProvider;
  };

  // Get current model option for display
  const getCurrentModelOption = () => {
    const currentValue = getCurrentModelValue();

    if (currentValue === "openai") {
      return {
        label: "GPT-4o-mini",
        icon: Bot,
      };
    }

    // Check local models first
    const localModel = localModels.find((model) => model.id === currentValue);
    if (localModel) {
      return {
        label: localModel.name,
        icon: localModel.provider === "ollama" ? Cpu : Monitor,
      };
    }

    // Check downloadable models
    const downloadableModel = downloadableModels.find(
      (model) => model.id === currentValue,
    );
    if (downloadableModel) {
      return {
        label: downloadableModel.name,
        icon: downloadableModel.provider === "ollama" ? Cpu : Monitor,
      };
    }

    return {
      label: "Select model",
      icon: Bot,
    };
  };

  // Handle model change
  const handleModelChange = (value: string) => {
    console.log("Model changed to:", value);
    if (value === "openai") {
      setModelProvider("openai");
      setModelId("");
      setSelectedModel("openai", "");
      console.log("Saved to localStorage: openai, ''");
    } else if (value.startsWith("ollama-")) {
      const model = value.replace("ollama-", "");
      setModelProvider("ollama");
      setModelId(model);
      setSelectedModel("ollama", model);
      console.log("Saved to localStorage: ollama,", model);
    } else if (value.startsWith("lmstudio-")) {
      const model = value.replace("lmstudio-", "");
      setModelProvider("lmstudio");
      setModelId(model);
      setSelectedModel("lmstudio", model);
      console.log("Saved to localStorage: lmstudio,", model);
    } else if (value.startsWith("custom-")) {
      const model = value.replace("custom-", "");
      setModelProvider("custom");
      setModelId(model);
      setSelectedModel("custom", model);
      console.log("Saved to localStorage: custom,", model);
    }
    setOpen(false);
  };

  return (
    <div>
      {shouldShowLabel && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Text Model
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between overflow-hidden"
          >
            <div className="flex items-center gap-2 min-w-0">
              {(() => {
                const currentOption = getCurrentModelOption();
                const Icon = currentOption.icon;
                return <Icon className="h-4 w-4 flex-shrink-0" />;
              })()}
              <span className="truncate text-sm">
                {getCurrentModelOption().label}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              
              {/* Loading indicator when fetching models */}
              {isLoading && !isInitialLoad && (
                <CommandGroup heading="Loading Models">
                  <CommandItem disabled>
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm">
                          Refreshing models...
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          Checking for new models
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                </CommandGroup>
              )}

              {/* OpenAI Group */}
              <CommandGroup heading="Cloud Models">
                <CommandItem
                  value="openai"
                  onSelect={() => handleModelChange("openai")}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Bot className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm">GPT-4o-mini</span>
                      <span className="text-xs text-muted-foreground truncate">
                        Cloud-based AI model
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      getCurrentModelValue() === "openai" ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              </CommandGroup>

              {/* Local Ollama Models */}
              {ollamaModels.length > 0 && (
                <CommandGroup heading="Local Ollama Models">
                  {ollamaModels.map((model) => {
                    const option = createModelOption(model);
                    const Icon = option.icon;
                    return (
                      <CommandItem
                        key={option.id}
                        value={`${option.displayLabel} ${option.description}`}
                        onSelect={() => handleModelChange(option.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm">
                              {option.displayLabel}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {option.description}
                            </span>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            getCurrentModelValue() === option.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* Local LM Studio Models */}
              {lmStudioModels.length > 0 && (
                <CommandGroup heading="Local LM Studio Models">
                  {lmStudioModels.map((model) => {
                    const option = createModelOption(model);
                    const Icon = option.icon;
                    return (
                      <CommandItem
                        key={option.id}
                        value={`${option.displayLabel} ${option.description}`}
                        onSelect={() => handleModelChange(option.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm">
                              {option.displayLabel}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {option.description}
                            </span>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            getCurrentModelValue() === option.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* Custom Models */}
              {customModels.length > 0 && (
                <CommandGroup heading="Custom API Models">
                  {customModels.map((model) => {
                    const option = createModelOption(model);
                    const Icon = option.icon;
                    return (
                      <CommandItem
                        key={option.id}
                        value={`${option.displayLabel} ${option.description}`}
                        onSelect={() => handleModelChange(option.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm">
                              {option.displayLabel}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {option.description}
                            </span>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            getCurrentModelValue() === option.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* Downloadable Ollama Models */}
              {showDownloadable && downloadableOllamaModels.length > 0 && (
                <CommandGroup heading="Downloadable Ollama Models">
                  {downloadableOllamaModels.map((model) => {
                    const option = createModelOption(model, true);
                    const Icon = option.icon;
                    return (
                      <CommandItem
                        key={option.id}
                        value={`${option.displayLabel} ${option.description}`}
                        onSelect={() => handleModelChange(option.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm">
                              {option.displayLabel}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {option.description}
                            </span>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            getCurrentModelValue() === option.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
