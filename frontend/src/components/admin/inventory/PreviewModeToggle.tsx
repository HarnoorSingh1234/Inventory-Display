import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Monitor, Smartphone } from "lucide-react";

interface PreviewModeToggleProps {
  previewMode: 'desktop' | 'mobile';
  onToggle: (mode: 'desktop' | 'mobile') => void;
}

export function PreviewModeToggle({ previewMode, onToggle }: PreviewModeToggleProps) {
  return (
    <Card className="p-4 border-2 border-blue-100">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-base md:text-lg font-bold text-gray-900">Preview Mode:</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => onToggle('desktop')}
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            className={previewMode === 'desktop' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : ''}
          >
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </Button>
          <Button
            onClick={() => onToggle('mobile')}
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            className={previewMode === 'mobile' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : ''}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </Button>
        </div>
      </div>
    </Card>
  );
}
