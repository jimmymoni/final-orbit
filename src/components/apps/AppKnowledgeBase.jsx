import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, BookOpen, Wrench, FileText, Video } from 'lucide-react';

export default function AppKnowledgeBase({ app }) {
  const [expandedSections, setExpandedSections] = useState({});

  // Parse KB sections from app data
  const kbSections = app?.kb_sections || [];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getSectionIcon = (sectionId) => {
    if (sectionId.includes('how') || sectionId.includes('overview')) {
      return <BookOpen className="h-4 w-4" />;
    }
    if (sectionId.includes('troubleshoot') || sectionId.includes('issue')) {
      return <Wrench className="h-4 w-4" />;
    }
    if (sectionId.includes('sop') || sectionId.includes('procedure')) {
      return <FileText className="h-4 w-4" />;
    }
    if (sectionId.includes('video') || sectionId.includes('tutorial')) {
      return <Video className="h-4 w-4" />;
    }
    return <BookOpen className="h-4 w-4" />;
  };

  if (!kbSections || kbSections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No knowledge base articles available</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back later for documentation and guides
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
        <Badge variant="outline">{kbSections.length} articles</Badge>
      </div>

      {kbSections.map((section, index) => {
        const isExpanded = expandedSections[section.id] ?? index === 0; // First section expanded by default

        return (
          <Card key={section.id} className="overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full text-left"
            >
              <CardHeader className="hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {getSectionIcon(section.id)}
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
            </button>

            {isExpanded && (
              <CardContent className="pt-0 pb-6 px-6">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {section.content || 'No content available.'}
                  </ReactMarkdown>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
