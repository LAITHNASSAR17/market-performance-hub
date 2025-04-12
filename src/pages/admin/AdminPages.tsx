
import React, { useState, useEffect } from 'react';
import { 
  File, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Search,
  Save,
  X,
  ExternalLink,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

interface Page {
  id: string;
  title: string;
  path: string;
  status: 'published' | 'draft';
  lastModified: string;
  content?: string;
  template?: string;
}

// Sample data for pages
const samplePages: Page[] = [
  {
    id: '1',
    title: 'Home',
    path: '/',
    status: 'published',
    lastModified: '2025-04-10',
    template: 'default',
    content: '<h1>Welcome to TradeTracker</h1><p>Your trading journal solution.</p>'
  },
  {
    id: '2',
    title: 'Dashboard',
    path: '/dashboard',
    status: 'published',
    lastModified: '2025-04-09',
    template: 'dashboard',
    content: '<h1>Dashboard</h1><p>View your trading stats and reports.</p>'
  },
  {
    id: '3',
    title: 'About Us',
    path: '/about',
    status: 'published',
    lastModified: '2025-04-08',
    template: 'default',
    content: '<h1>About TradeTracker</h1><p>Learn about our company and mission.</p>'
  },
  {
    id: '4',
    title: 'Terms of Service',
    path: '/terms',
    status: 'published',
    lastModified: '2025-04-07',
    template: 'legal',
    content: '<h1>Terms of Service</h1><p>Please read our terms of service carefully.</p>'
  },
  {
    id: '5',
    title: 'Privacy Policy',
    path: '/privacy',
    status: 'published',
    lastModified: '2025-04-06',
    template: 'legal',
    content: '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>'
  },
  {
    id: '6',
    title: 'New Feature Announcement',
    path: '/blog/new-feature',
    status: 'draft',
    lastModified: '2025-04-05',
    template: 'blog',
    content: '<h1>Exciting New Features</h1><p>Check out our latest updates.</p>'
  }
];

// Available page templates
const templates = [
  { id: 'default', name: 'Default Template' },
  { id: 'dashboard', name: 'Dashboard Template' },
  { id: 'blog', name: 'Blog Template' },
  { id: 'legal', name: 'Legal Document Template' },
  { id: 'landing', name: 'Landing Page Template' }
];

const AdminPages = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [pages, setPages] = useState<Page[]>(samplePages);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formPath, setFormPath] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('draft');
  const [formTemplate, setFormTemplate] = useState('default');
  const [formContent, setFormContent] = useState('');

  // Filter pages based on search term
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePage = () => {
    // Reset form fields
    setFormTitle('');
    setFormPath('');
    setFormStatus('draft');
    setFormTemplate('default');
    setFormContent('');
    
    // Show create dialog
    setIsCreating(true);
  };

  const handleEditPage = (page: Page) => {
    setCurrentPage(page);
    
    // Populate form with page data
    setFormTitle(page.title);
    setFormPath(page.path);
    setFormStatus(page.status);
    setFormTemplate(page.template || 'default');
    setFormContent(page.content || '');
    
    // Show edit dialog
    setIsEditing(true);
  };

  const handleDeletePage = (page: Page) => {
    setCurrentPage(page);
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    if (!currentPage) return;
    
    // Remove the page from the list
    setPages(pages.filter(p => p.id !== currentPage.id));
    
    // Close the dialog
    setIsDeleting(false);
    
    // Show success toast
    toast({
      title: "Page Deleted",
      description: `${currentPage.title} has been deleted successfully`,
    });
  };

  const handleSavePage = () => {
    // Validate form
    if (!formTitle) {
      toast({
        title: "Error",
        description: "Page title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formPath) {
      toast({
        title: "Error",
        description: "Page path is required",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new page object
    const updatedPage: Page = {
      id: currentPage?.id || Date.now().toString(),
      title: formTitle,
      path: formPath.startsWith('/') ? formPath : `/${formPath}`,
      status: formStatus,
      lastModified: new Date().toISOString().split('T')[0],
      template: formTemplate,
      content: formContent
    };
    
    if (isCreating) {
      // Add new page
      setPages([...pages, updatedPage]);
      toast({
        title: "Page Created",
        description: `${updatedPage.title} has been created successfully`,
      });
    } else {
      // Update existing page
      setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
      toast({
        title: "Page Updated",
        description: `${updatedPage.title} has been updated successfully`,
      });
    }
    
    // Close dialogs
    setIsEditing(false);
    setIsCreating(false);
  };

  const handlePreviewPage = (path: string) => {
    window.open(path, '_blank');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create, edit, and manage the pages of your website.
          </p>
        </header>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreatePage} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Page</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Website Pages</CardTitle>
            <CardDescription>
              All pages in your website. {pages.length} total pages.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Path</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Last Modified</th>
                    <th className="px-4 py-3 text-left">Template</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPages.length > 0 ? (
                    filteredPages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <File className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{page.title}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{page.path}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            page.status === 'published' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{page.lastModified}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {page.template || 'Default'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          {isMobile ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePreviewPage(page.path)}>
                                  <Eye className="mr-2 h-4 w-4" /> Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditPage(page)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePage(page)}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handlePreviewPage(page.path)}
                                title="Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditPage(page)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeletePage(page)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        {searchTerm ? 'No pages found matching your search' : 'No pages found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit/Create Page Dialog */}
      <Dialog open={isEditing || isCreating} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setIsCreating(false);
        }
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Page' : 'Edit Page'}</DialogTitle>
            <DialogDescription>
              {isCreating 
                ? 'Create a new page for your website. Add content, set the status, and choose a template.' 
                : 'Make changes to the page. Set content, status, and save when you\'re done.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Page Title"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="path" className="text-right">
                Path
              </Label>
              <div className="col-span-3 flex items-center rounded-md border border-input">
                <span className="pl-3 text-gray-400">/</span>
                <Input
                  id="path"
                  value={formPath.startsWith('/') ? formPath.substring(1) : formPath}
                  onChange={(e) => setFormPath(`/${e.target.value}`)}
                  placeholder="page-path"
                  className="border-0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={formStatus} 
                onValueChange={(value) => setFormStatus(value as 'published' | 'draft')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Template
              </Label>
              <Select 
                value={formTemplate} 
                onValueChange={setFormTemplate}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Page content (HTML supported)"
                className="col-span-3 min-h-[200px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setIsCreating(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSavePage}>
              <Save className="mr-2 h-4 w-4" />
              {isCreating ? 'Create Page' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={(open) => {
        if (!open) setIsDeleting(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentPage && (
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                <h3 className="font-medium text-red-800 dark:text-red-400">
                  {currentPage.title}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Path: {currentPage.path}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPages;
