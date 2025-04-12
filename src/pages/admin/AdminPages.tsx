
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash, Plus, RefreshCw } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  lastModified: Date;
}

const AdminPages: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([
    {
      id: '1',
      title: 'الصفحة الرئيسية',
      slug: 'home',
      status: 'published',
      lastModified: new Date(2023, 3, 15)
    },
    {
      id: '2',
      title: 'من نحن',
      slug: 'about',
      status: 'published',
      lastModified: new Date(2023, 2, 20)
    },
    {
      id: '3',
      title: 'الخدمات',
      slug: 'services',
      status: 'draft',
      lastModified: new Date(2023, 3, 10)
    },
    {
      id: '4',
      title: 'اتصل بنا',
      slug: 'contact',
      status: 'published',
      lastModified: new Date(2023, 3, 1)
    }
  ]);
  
  const { toast } = useToast();

  const handleViewPage = (id: string) => {
    toast({
      title: "View Page",
      description: `Viewing page with ID: ${id}`
    });
  };

  const handleEditPage = (id: string) => {
    toast({
      title: "Edit Page",
      description: `Editing page with ID: ${id}`
    });
  };

  const handleDeletePage = (id: string) => {
    setPages(pages.filter(page => page.id !== id));
    toast({
      title: "Page Deleted",
      description: "The page has been deleted successfully"
    });
  };

  const handleAddPage = () => {
    toast({
      title: "Add Page",
      description: "Creating a new page"
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshed",
      description: "Page list refreshed"
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
          <div className="space-x-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleAddPage}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Table>
          <TableCaption>List of website pages</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.id}</TableCell>
                <TableCell>{page.title}</TableCell>
                <TableCell>{page.slug}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    page.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {page.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell>{page.lastModified.toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      onClick={() => handleViewPage(page.id)}
                      variant="ghost" 
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleEditPage(page.id)}
                      variant="ghost" 
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeletePage(page.id)}
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AdminPages;
