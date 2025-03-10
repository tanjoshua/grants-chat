'use client';

import { deleteWebsite } from '@/app/actions/websites';
import { type Document } from '@/db/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { WebsiteContentDialog } from '@/components/website-content-dialog';

interface WebsiteListProps {
  websites: Document[];
}

export function WebsiteList({ websites }: WebsiteListProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [selectedWebsiteName, setSelectedWebsiteName] = useState<string | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

  if (!websites.length) {
    return (
      <div className="text-center p-4 border rounded-md bg-muted/20">
        <p className="text-sm text-muted-foreground">No websites added yet</p>
      </div>
    );
  }

  async function handleDelete(id: string) {
    try {
      setLoading(prev => ({ ...prev, [id]: true }));
      const result = await deleteWebsite(id);
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Website deleted successfully',
        });
      }
    } catch  {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  }



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  function handleViewContent(id: string, name: string) {
    setSelectedWebsiteId(id);
    setSelectedWebsiteName(name);
    setIsContentDialogOpen(true);
  }

  return (
    <div className="rounded-md border">
      <WebsiteContentDialog 
        websiteId={selectedWebsiteId}
        websiteName={selectedWebsiteName}
        isOpen={isContentDialogOpen}
        onOpenChange={setIsContentDialogOpen}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {websites.map((website) => (
            <TableRow 
              key={website.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleViewContent(website.id, website.name)}
            >
              <TableCell className="font-medium">{website.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[200px]">{website.url}</span>
                  <a 
                    href={website.url || ""} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(website.status)}</TableCell>
              <TableCell>
                {website.updatedAt ? formatDistanceToNow(new Date(website.updatedAt), { addSuffix: true }) : 'Never'}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={loading[website.id]}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(website.id);
                  }}
                  title="Delete website"
                >
                  {loading[website.id] ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
