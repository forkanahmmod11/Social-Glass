import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

export default function ResultCard({ title, icon: Icon, children, content, onSave }) {
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async () => {
    if (saved) return;
    await onSave();
    setSaved(true);
    toast.success("Saved to Collections!");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          {title}
        </CardTitle>
        <div className="flex gap-1">
          {content && (
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 rounded-lg" title="Copy">
              <Copy className="w-4 h-4" />
            </Button>
          )}
          {onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className={`h-8 w-8 rounded-lg ${saved ? "text-primary" : ""}`}
              title={saved ? "Saved!" : "Save to Collections"}
            >
              {saved ? <BookmarkCheck className="w-4 h-4 fill-primary text-primary" /> : <Bookmark className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}