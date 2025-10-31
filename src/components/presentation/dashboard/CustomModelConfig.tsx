"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCustomApiKey,
  getCustomBaseURL,
  setCustomApiKey,
  setCustomBaseURL,
} from "@/hooks/presentation/useLocalModels";
import { usePresentationState } from "@/states/presentation-state";
import { Eye, EyeOff, Key, Link } from "lucide-react";
import { useEffect, useState } from "react";

export function CustomModelConfig({
  shouldShowLabel = true,
}: {
  shouldShowLabel?: boolean;
}) {
  const { customBaseURL, setCustomBaseURL: setStateBaseURL, customApiKey, setCustomApiKey: setStateApiKey } =
    usePresentationState();
  const [showApiKey, setShowApiKey] = useState(false);
  const [localBaseURL, setLocalBaseURL] = useState(customBaseURL);
  const [localApiKey, setLocalApiKey] = useState(customApiKey);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBaseURL = getCustomBaseURL();
    const savedApiKey = getCustomApiKey();
    if (savedBaseURL) {
      setLocalBaseURL(savedBaseURL);
      setStateBaseURL(savedBaseURL);
    }
    if (savedApiKey) {
      setLocalApiKey(savedApiKey);
      setStateApiKey(savedApiKey);
    }
  }, [setStateBaseURL, setStateApiKey]);

  const handleBaseURLChange = (value: string) => {
    setLocalBaseURL(value);
    setStateBaseURL(value);
    setCustomBaseURL(value);
  };

  const handleApiKeyChange = (value: string) => {
    setLocalApiKey(value);
    setStateApiKey(value);
    setCustomApiKey(value);
  };

  return (
    <div className="space-y-4">
      <div>
        {shouldShowLabel && (
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom API Base URL
          </label>
        )}
        <div className="relative">
          <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="e.g., http://localhost:8080"
            value={localBaseURL}
            onChange={(e) => handleBaseURLChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        {shouldShowLabel && (
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key (optional)
          </label>
        )}
        <div className="relative">
          <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type={showApiKey ? "text" : "password"}
            placeholder="Enter your API key"
            value={localApiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            className="pl-10 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
