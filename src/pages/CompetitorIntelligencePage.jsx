import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Search,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Eye,
  Target,
  ExternalLink,
  AppWindow,
} from 'lucide-react';

export default function CompetitorIntelligencePage() {
  const [inquiries, setInquiries] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [selectedApp, setSelectedApp] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch inquiries
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (inquiriesError) throw inquiriesError;
      setInquiries(inquiriesData || []);

      // Fetch apps with their competitors
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (appsError) throw appsError;
      setApps(appsData || []);
    } catch (error) {
      console.error('Error fetching competitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build competitor data structure from apps
  const buildCompetitorData = () => {
    const competitorMap = new Map();

    // Iterate through each app and its competitors
    apps.forEach((app) => {
      const competitorsList = Array.isArray(app.competitors) ? app.competitors : [];

      competitorsList.forEach((comp) => {
        const competitorName = typeof comp === 'string' ? comp : comp.name;
        const competitorUrl = typeof comp === 'object' ? comp.url : null;

        if (!competitorMap.has(competitorName)) {
          competitorMap.set(competitorName, {
            name: competitorName,
            url: competitorUrl,
            apps: [],
            total: 0,
            complaints: [],
            praises: [],
            featureGaps: [],
            threads: [],
          });
        }

        // Add this app to the competitor's app list
        const compData = competitorMap.get(competitorName);
        if (!compData.apps.find((a) => a.id === app.id)) {
          compData.apps.push({
            id: app.id,
            name: app.name,
            logo_url: app.logo_url,
          });
        }
      });
    });

    // Scan inquiries for mentions of each competitor
    inquiries.forEach((inquiry) => {
      const text = `${inquiry.title} ${inquiry.content}`.toLowerCase();

      competitorMap.forEach((compData, compName) => {
        if (text.includes(compName.toLowerCase())) {
          compData.total++;
          compData.threads.push(inquiry);

          // Detect sentiment (simplified keyword matching)
          if (
            text.includes('problem') ||
            text.includes('issue') ||
            text.includes('bug') ||
            text.includes('slow') ||
            text.includes('difficult') ||
            text.includes('expensive') ||
            text.includes('doesn\'t work') ||
            text.includes('not working')
          ) {
            compData.complaints.push({
              inquiry,
              snippet: inquiry.title,
            });
          } else if (
            text.includes('great') ||
            text.includes('love') ||
            text.includes('excellent') ||
            text.includes('perfect') ||
            text.includes('amazing') ||
            text.includes('recommend')
          ) {
            compData.praises.push({
              inquiry,
              snippet: inquiry.title,
            });
          }

          // Detect feature gaps
          if (
            text.includes('missing') ||
            text.includes('need') ||
            text.includes('wish') ||
            text.includes('lacking') ||
            text.includes('should have') ||
            text.includes('doesn\'t have') ||
            text.includes('no support for')
          ) {
            compData.featureGaps.push({
              inquiry,
              snippet: inquiry.title,
            });
          }
        }
      });
    });

    return Array.from(competitorMap.values()).filter((m) => m.total > 0);
  };

  const competitorData = buildCompetitorData();
  const sortedCompetitors = [...competitorData].sort((a, b) => b.total - a.total);

  // Filter competitors by search term and selected app
  const filteredCompetitors = sortedCompetitors.filter((comp) => {
    const matchesSearch = searchTerm
      ? comp.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesApp = selectedApp === 'all'
      ? true
      : comp.apps.some((app) => app.id === selectedApp);

    return matchesSearch && matchesApp;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading competitor intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Competitor Intelligence</h1>
        <p className="text-gray-600 mt-2">
          Track competitor mentions, complaints, praises, and feature gaps in the Shopify Community
        </p>
      </div>

      {/* App Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by FinalApps Product</CardTitle>
          <CardDescription>View competitors for specific apps or all apps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedApp === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedApp('all')}
              size="sm"
            >
              All Apps ({sortedCompetitors.length} competitors)
            </Button>
            {apps.map((app) => {
              const appCompetitors = sortedCompetitors.filter((comp) =>
                comp.apps.some((a) => a.id === app.id)
              );
              return (
                <Button
                  key={app.id}
                  variant={selectedApp === app.id ? 'default' : 'outline'}
                  onClick={() => setSelectedApp(app.id)}
                  size="sm"
                >
                  {app.name} ({appCompetitors.length})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mentions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {competitorData.reduce((sum, c) => sum + c.total, 0)}
                </p>
              </div>
              <Eye className="h-10 w-10 text-finalapps-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Complaints</p>
                <p className="text-3xl font-bold text-red-600">
                  {competitorData.reduce((sum, c) => sum + c.complaints.length, 0)}
                </p>
              </div>
              <TrendingDown className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Praises</p>
                <p className="text-3xl font-bold text-green-600">
                  {competitorData.reduce((sum, c) => sum + c.praises.length, 0)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Feature Gaps</p>
                <p className="text-3xl font-bold text-orange-600">
                  {competitorData.reduce((sum, c) => sum + c.featureGaps.length, 0)}
                </p>
              </div>
              <Target className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search competitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Competitor Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompetitors.map((comp) => (
          <Card
            key={comp.name}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedCompetitor(comp)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{comp.name}</CardTitle>
                <Badge variant="primary">{comp.total} mentions</Badge>
              </div>
              {/* Show which FinalApps apps this competitor competes with */}
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Competes with:</p>
                <div className="flex flex-wrap gap-1">
                  {comp.apps.map((app) => (
                    <Badge key={app.id} variant="outline" className="text-xs">
                      {app.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Complaints</span>
                  <span className="font-medium text-red-600">{comp.complaints.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Praises</span>
                  <span className="font-medium text-green-600">{comp.praises.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Feature Gaps</span>
                  <span className="font-medium text-orange-600">{comp.featureGaps.length}</span>
                </div>
              </div>

              {/* Sentiment Bar */}
              <div className="mt-4">
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${(comp.complaints.length / comp.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(comp.praises.length / comp.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-orange-500"
                    style={{
                      width: `${(comp.featureGaps.length / comp.total) * 100}%`,
                    }}
                  />
                  <div className="bg-gray-300 flex-1" />
                </div>
              </div>

              {/* Optional: Show competitor URL if available */}
              {comp.url && (
                <div className="mt-3 pt-3 border-t">
                  <a
                    href={comp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-finalapps-blue hover:underline flex items-center"
                  >
                    Visit competitor site
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View Modal/Section */}
      {selectedCompetitor && (
        <Card className="border-2 border-finalapps-blue">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{selectedCompetitor.name} - Detailed Insights</CardTitle>
                <CardDescription>
                  Analyzing {selectedCompetitor.total} mentions across {selectedCompetitor.threads.length} threads
                </CardDescription>
                {/* Show which apps this competitor competes with */}
                <div className="mt-3 flex items-center gap-2">
                  <AppWindow className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Competes with:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCompetitor.apps.map((app) => (
                      <Badge key={app.id} variant="outline" className="text-xs">
                        {app.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedCompetitor.url && (
                  <div className="mt-2">
                    <a
                      href={selectedCompetitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-finalapps-blue hover:underline flex items-center gap-1"
                    >
                      Visit competitor website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => setSelectedCompetitor(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="complaints" className="space-y-4">
              <TabsList>
                <TabsTrigger value="complaints">
                  Complaints ({selectedCompetitor.complaints.length})
                </TabsTrigger>
                <TabsTrigger value="praises">
                  Praises ({selectedCompetitor.praises.length})
                </TabsTrigger>
                <TabsTrigger value="gaps">
                  Feature Gaps ({selectedCompetitor.featureGaps.length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All Threads ({selectedCompetitor.threads.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="complaints" className="space-y-3">
                {selectedCompetitor.complaints.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No complaints found</p>
                ) : (
                  selectedCompetitor.complaints.map((item, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="danger" className="mb-2">
                              Complaint
                            </Badge>
                            <h4 className="font-medium text-gray-900">{item.snippet}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.inquiry.content}
                            </p>
                          </div>
                          <a
                            href={item.inquiry.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-finalapps-blue hover:text-blue-700 ml-4"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="praises" className="space-y-3">
                {selectedCompetitor.praises.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No praises found</p>
                ) : (
                  selectedCompetitor.praises.map((item, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="success" className="mb-2">
                              Praise
                            </Badge>
                            <h4 className="font-medium text-gray-900">{item.snippet}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.inquiry.content}
                            </p>
                          </div>
                          <a
                            href={item.inquiry.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-finalapps-blue hover:text-blue-700 ml-4"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="gaps" className="space-y-3">
                {selectedCompetitor.featureGaps.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No feature gaps found</p>
                ) : (
                  selectedCompetitor.featureGaps.map((item, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="warning" className="mb-2">
                              Feature Gap
                            </Badge>
                            <h4 className="font-medium text-gray-900">{item.snippet}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.inquiry.content}
                            </p>
                          </div>
                          <a
                            href={item.inquiry.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-finalapps-blue hover:text-blue-700 ml-4"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-3">
                {selectedCompetitor.threads.map((thread, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{thread.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{thread.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(thread.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={thread.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-finalapps-blue hover:text-blue-700 ml-4"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
