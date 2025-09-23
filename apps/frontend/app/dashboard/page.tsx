"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Globe, Plus, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

type UptimeStatus = "good" | "bad" | "unknown";

function StatusIndicator({ status }: { status: UptimeStatus }) {
  const statusConfig = {
    good: { color: "bg-green-500", label: "Online", variant: "default" as const },
    bad: { color: "bg-red-500", label: "Offline", variant: "destructive" as const },
    unknown: { color: "bg-gray-500", label: "Unknown", variant: "secondary" as const }
  };

  const config = statusConfig[status];
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    </div>
  );
}

function UptimeTicks({ ticks }: { ticks: UptimeStatus[] }) {
  return (
    <div className="flex gap-1">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={`w-3 h-8 rounded-sm ${
            tick === 'good' ? 'bg-green-500' : tick === 'bad' ? 'bg-red-500' : 'bg-muted'
          }`}
          title={tick === 'good' ? 'Online' : tick === 'bad' ? 'Offline' : 'Unknown'}
        />
      ))}
    </div>
  );
}

function CreateWebsiteModal({ children, onClose }: { children: React.ReactNode; onClose: (url: string | null) => void }) {
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (url.trim()) {
      onClose(url.trim());
      setUrl('');
      setOpen(false);
    }
  };

  const handleCancel = () => {
    onClose(null);
    setUrl('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Website</DialogTitle>
          <DialogDescription>
            Enter the URL of the website you want to monitor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!url.trim()}>
            Add Website
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ProcessedWebsite {
  id: string;
  url: string;
  status: UptimeStatus;
  uptimePercentage: number;
  lastChecked: string;
  uptimeTicks: UptimeStatus[];
}

function WebsiteCard({ website }: { website: ProcessedWebsite }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">{website.url}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Clock className="h-3 w-3" />
                <span>Last checked: {website.lastChecked}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <StatusIndicator status={website.status} />
            <div className="text-right">
              <div className="flex items-center space-x-1">
                {website.uptimePercentage >= 95 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="font-semibold">{website.uptimePercentage.toFixed(1)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">uptime</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Last 30 minutes activity</Label>
                </div>
                <UptimeTicks ticks={website.uptimeTicks} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusIndicator status={website.status} />
                </div>
                <div>
                  <p className="text-muted-foreground">Uptime</p>
                  <p className="font-medium">{website.uptimePercentage.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

function DashboardStats({ websites }: { websites: ProcessedWebsite[] }) {
  const stats = useMemo(() => {
    const total = websites.length;
    const online = websites.filter(w => w.status === 'good').length;
    const offline = websites.filter(w => w.status === 'bad').length;
    const avgUptime = total > 0 ? websites.reduce((acc, w) => acc + w.uptimePercentage, 0) / total : 0;
    
    return { total, online, offline, avgUptime };
  }, [websites]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.online}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Offline</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgUptime.toFixed(1)}%</div>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  const {websites, refreshWebsites} = useWebsites();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users via effect to keep hooks order stable
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  const processedWebsites = useMemo(() => {
    return websites.map(website => {
      // Sort ticks by creation time
      const sortedTicks = [...website.ticks].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Get the most recent 30 minutes of ticks
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentTicks = sortedTicks.filter(tick => 
        new Date(tick.createdAt) > thirtyMinutesAgo
      );

      // Aggregate ticks into 3-minute windows (10 windows total)
      const windows: UptimeStatus[] = [];

      for (let i = 0; i < 10; i++) {
        const windowStart = new Date(Date.now() - (i + 1) * 3 * 60 * 1000);
        const windowEnd = new Date(Date.now() - i * 3 * 60 * 1000);
        
        const windowTicks = recentTicks.filter(tick => {
          const tickTime = new Date(tick.createdAt);
          return tickTime >= windowStart && tickTime < windowEnd;
        });

        // Window is considered up if majority of ticks are up
        const upTicks = windowTicks.filter(tick => tick.status === 'Good').length;
        windows[9 - i] = windowTicks.length === 0 ? "unknown" : (upTicks / windowTicks.length) >= 0.5 ? "good" : "bad";
      }

      // Calculate overall status and uptime percentage
      const totalTicks = sortedTicks.length;
      const upTicks = sortedTicks.filter(tick => tick.status === 'Good').length;
      const uptimePercentage = totalTicks === 0 ? 100 : (upTicks / totalTicks) * 100;

      // Get the most recent status
      const currentStatus = windows[windows.length - 1];

      // Format the last checked time
      const lastChecked = sortedTicks[0]
        ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
        : 'Never';

      return {
        id: website.id,
        url: website.url,
        status: currentStatus,
        uptimePercentage,
        lastChecked,
        uptimeTicks: windows,
      };
    });
  }, [websites]);

  // Loading / redirect placeholders while keeping hooks order consistent
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Redirecting to sign in...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Website Monitor</h1>
              <p className="text-muted-foreground">
                Monitor your websites and track their uptime performance.
              </p>
            </div>
            <CreateWebsiteModal
              onClose={async (url) => {
                if (url === null) return;
                if (!session?.user?.id) return;

                try {
                  await axios.post(`${API_BACKEND_URL}/api/v1/website`, {
                    url,
                  }, {
                    headers: {
                      Authorization: `Bearer ${session.user.id}`,
                    },
                  });
                  refreshWebsites();
                } catch (error) {
                  console.error('Failed to add website:', error);
                }
              }}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Website
              </Button>
            </CreateWebsiteModal>
          </div>

          {/* Stats Overview */}
          <DashboardStats websites={processedWebsites} />

          {/* Websites List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Websites</h2>
              <Badge variant="secondary">{processedWebsites.length} total</Badge>
            </div>
            
            {processedWebsites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No websites yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Get started by adding your first website to monitor.
                  </p>
                  <CreateWebsiteModal
                    onClose={async (url) => {
                      if (url === null) return;
                      if (!session?.user?.id) return;

                      try {
                        await axios.post(`${API_BACKEND_URL}/api/v1/website`, {
                          url,
                        }, {
                          headers: {
                            Authorization: `Bearer ${session.user.id}`,
                          },
                        });
                        refreshWebsites();
                      } catch (error) {
                        console.error('Failed to add website:', error);
                      }
                    }}
                  >
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Website
                    </Button>
                  </CreateWebsiteModal>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {processedWebsites.map((website) => (
                  <WebsiteCard key={website.id} website={website} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;