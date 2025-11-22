import { useState } from 'react';
import { Sparkles, Copy, Check, RotateCcw, BookOpen, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateReplies } from '@/hooks/useAIReplies';
import { toast } from 'sonner';

export default function SmartReplyPanel({ inquiry, onUseReply }) {
  const [selectedReply, setSelectedReply] = useState(null);
  const [editedReply, setEditedReply] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const { mutate: generateReplies, data: aiData, isLoading, isError } = useGenerateReplies();

  const handleGenerate = () => {
    generateReplies(inquiry);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUse = (reply) => {
    setSelectedReply(reply);
    setEditedReply(reply.reply);
  };

  const handleSend = () => {
    if (onUseReply) {
      onUseReply(editedReply);
      setSelectedReply(null);
      setEditedReply('');
    }
  };

  const getBadgeVariant = (style) => {
    const variants = {
      Professional: 'default',
      Friendly: 'success',
      Concise: 'outline',
    };
    return variants[style] || 'default';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Smart Replies</h3>
        </div>
        {!aiData && !isLoading && (
          <Button onClick={handleGenerate} disabled={isLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Replies
          </Button>
        )}
        {aiData && (
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isLoading}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        )}
      </div>

      {/* Context Indicators */}
      {aiData?.context && (
        <div className="flex flex-wrap gap-2">
          {aiData.context.knowledgeArticles > 0 && (
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3 w-3" />
              {aiData.context.knowledgeArticles} KB articles
            </Badge>
          )}
          {aiData.context.app && (
            <Badge variant="outline" className="gap-1">
              <Package className="h-3 w-3" />
              {aiData.context.app}
            </Badge>
          )}
          {aiData.context.templates > 0 && (
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {aiData.context.templates} templates
            </Badge>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">
              Failed to generate AI replies. Please try again or write your reply manually.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reply Suggestions */}
      {aiData && !selectedReply && (
        <div className="space-y-3">
          {aiData.suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:border-blue-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(suggestion.style)}>
                      {suggestion.style}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {suggestion.reply.length} characters
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(suggestion.reply, suggestion.id)}
                    >
                      {copiedId === suggestion.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {suggestion.reply}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleUse(suggestion)}
                    className="flex-1"
                  >
                    Use This Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Mode */}
      {selectedReply && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Badge variant={getBadgeVariant(selectedReply.style)}>
                  {selectedReply.style}
                </Badge>
                <span>Edit & Send</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedReply(null);
                  setEditedReply('');
                }}
              >
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={editedReply}
              onChange={(e) => setEditedReply(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {editedReply.length} characters
              </span>
              <Button onClick={handleSend} disabled={!editedReply.trim()}>
                Send Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!aiData && !isLoading && !isError && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-12 w-12 text-gray-300 mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">AI-Powered Smart Replies</h4>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">
              Click "Generate Replies" to get 3 AI-suggested responses based on your knowledge base,
              app information, and reply templates.
            </p>
            <Button onClick={handleGenerate}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Replies
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
