
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Globe, FileText, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';

// Sample pages data
const samplePages = [
  { id: 1, title: 'Home', slug: 'home', status: 'published', lastUpdated: '2025-04-01' },
  { id: 2, title: 'About Us', slug: 'about-us', status: 'published', lastUpdated: '2025-04-02' },
  { id: 3, title: 'Services', slug: 'services', status: 'published', lastUpdated: '2025-04-03' },
  { id: 4, title: 'Contact', slug: 'contact', status: 'published', lastUpdated: '2025-04-04' },
  { id: 5, title: 'Blog', slug: 'blog', status: 'published', lastUpdated: '2025-04-05' },
  { id: 6, title: 'FAQ', slug: 'faq', status: 'draft', lastUpdated: '2025-04-06' },
];

const AdminPages: React.FC = () => {
  const [pages, setPages] = useState(samplePages);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditPage = (pageId: number) => {
    toast({
      title: "Edit Page",
      description: `Editing page with ID: ${pageId}`
    });
  };

  const handleDeletePage = (pageId: number) => {
    setPages(pages.filter(page => page.id !== pageId));
    toast({
      title: "Page Deleted",
      description: "The page has been deleted successfully"
    });
  };

  const handleCreatePage = () => {
    toast({
      title: "Create Page",
      description: "Creating a new page"
    });
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Page Management
        </h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Manage website pages and content.
          </p>
          <Button 
            onClick={handleCreatePage}
            className="bg-green-600 hover:bg-green-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Page
          </Button>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex mb-4">
          <div className="relative w-full">
            <Input
              className="pl-10 pr-4"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <TableRow key={page.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{page.id}</TableCell>
                    <TableCell>{page.title}</TableCell>
                    <TableCell>/{page.slug}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        page.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {page.status}
                      </span>
                    </TableCell>
                    <TableCell>{page.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-blue-600"
                          onClick={() => handleEditPage(page.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm 
                      ? "No pages found matching your search."
                      : "No pages have been created yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AdminPages;
