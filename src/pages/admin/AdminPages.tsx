
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  File, 
  FileEdit, 
  FilePlus, 
  Trash2, 
  Save, 
  Eye,
  Search,
  RefreshCcw
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  lastEdited: string;
  createdBy: string;
}

const demoPages: Page[] = [
  {
    id: '1',
    title: 'Homepage',
    slug: '/',
    status: 'published',
    lastEdited: '2025-04-01',
    createdBy: 'Admin'
  },
  {
    id: '2',
    title: 'About Us',
    slug: '/about',
    status: 'published',
    lastEdited: '2025-03-15',
    createdBy: 'Admin'
  },
  {
    id: '3',
    title: 'Contact',
    slug: '/contact',
    status: 'published',
    lastEdited: '2025-03-20',
    createdBy: 'Admin'
  },
  {
    id: '4',
    title: 'Privacy Policy',
    slug: '/privacy',
    status: 'published',
    lastEdited: '2025-02-10',
    createdBy: 'Admin'
  },
  {
    id: '5',
    title: 'Terms of Service',
    slug: '/terms',
    status: 'draft',
    lastEdited: '2025-04-05',
    createdBy: 'Admin'
  },
];

const AdminPages: React.FC = () => {
  const [pages, setPages] = useState<Page[]>(demoPages);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPageDialogOpen, setNewPageDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const { toast } = useToast();

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePage = (newPage: Omit<Page, 'id' | 'lastEdited' | 'createdBy'>) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const page: Page = {
      id: (pages.length + 1).toString(),
      title: newPage.title,
      slug: newPage.slug,
      status: newPage.status,
      lastEdited: currentDate,
      createdBy: 'Admin'
    };
    
    setPages([...pages, page]);
    setNewPageDialogOpen(false);
    
    toast({
      title: "Page Created",
      description: `${page.title} has been created successfully`
    });
  };

  const handleUpdatePage = (updatedPage: Page) => {
    const updatedPages = pages.map(page => 
      page.id === updatedPage.id ? {...updatedPage, lastEdited: new Date().toISOString().split('T')[0]} : page
    );
    
    setPages(updatedPages);
    setEditingPage(null);
    
    toast({
      title: "Page Updated",
      description: `${updatedPage.title} has been updated successfully`
    });
  };

  const handleDeletePage = (id: string) => {
    const pageToDelete = pages.find(page => page.id === id);
    const updatedPages = pages.filter(page => page.id !== id);
    
    setPages(updatedPages);
    
    toast({
      title: "Page Deleted",
      description: `${pageToDelete?.title} has been deleted`
    });
  };

  const NewPageForm = () => {
    const [pageData, setPageData] = useState({
      title: '',
      slug: '',
      status: 'draft' as 'draft' | 'published'
    });
    
    const handleChange = (field: string, value: string) => {
      setPageData({...pageData, [field]: value});
      
      // Auto-generate slug from title
      if (field === 'title') {
        const slug = value.toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
        setPageData({...pageData, title: value, slug});
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Page Title</Label>
          <Input 
            id="title" 
            value={pageData.title} 
            onChange={e => handleChange('title', e.target.value)}
            placeholder="Enter page title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Page URL</Label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">/</span>
            <Input 
              id="slug" 
              value={pageData.slug} 
              onChange={e => handleChange('slug', e.target.value)}
              placeholder="page-url"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            defaultValue={pageData.status}
            onValueChange={value => handleChange('status', value as 'draft' | 'published')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setNewPageDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleCreatePage(pageData)}
            disabled={!pageData.title || !pageData.slug}
          >
            Create Page
          </Button>
        </div>
      </div>
    );
  };

  const EditPageForm = ({ page }: { page: Page }) => {
    const [pageData, setPageData] = useState({
      ...page
    });
    
    const handleChange = (field: string, value: string) => {
      setPageData({...pageData, [field]: value});
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Page Title</Label>
          <Input 
            id="edit-title" 
            value={pageData.title} 
            onChange={e => handleChange('title', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-slug">Page URL</Label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">/</span>
            <Input 
              id="edit-slug" 
              value={pageData.slug} 
              onChange={e => handleChange('slug', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select 
            defaultValue={pageData.status}
            onValueChange={value => handleChange('status', value as 'draft' | 'published')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setEditingPage(null)}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleUpdatePage(pageData as Page)}
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Pages Management
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Create and manage website pages and content.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Website Pages</CardTitle>
              <CardDescription>Manage your website pages and content</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-8 gap-1" onClick={() => setPages(demoPages)}>
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              <Button className="h-8 gap-1" onClick={() => setNewPageDialogOpen(true)}>
                <FilePlus className="h-4 w-4" />
                <span className="hidden md:inline">New Page</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search pages..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-4 text-left align-middle font-medium">Title</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">URL</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">Last Edited</th>
                    <th className="h-10 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.length > 0 ? (
                    filteredPages.map((page) => (
                      <tr 
                        key={page.id} 
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">{page.title}</td>
                        <td className="p-4 align-middle text-muted-foreground">{page.slug}</td>
                        <td className="p-4 align-middle">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            page.status === 'published' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-500' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-500'
                          }`}>
                            {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">{page.lastEdited}</td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingPage(page)}
                            >
                              <FileEdit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() => handleDeletePage(page.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="h-24 text-center">
                        No pages found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Page Dialog */}
      <Dialog open={newPageDialogOpen} onOpenChange={setNewPageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Add a new page to your website.
            </DialogDescription>
          </DialogHeader>
          <NewPageForm />
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>
              Make changes to the page details.
            </DialogDescription>
          </DialogHeader>
          {editingPage && <EditPageForm page={editingPage} />}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPages;
