
import React from 'react';
import Layout from '@/components/Layout';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Playbooks: React.FC = () => {
  const { playbooks, loading } = usePlaybooks();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trading Playbooks</h1>
          <p className="text-gray-500">
            Create and manage your trading strategies and rules
          </p>
        </div>
        <Button onClick={() => navigate('/playbooks/new')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Playbook
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading playbooks...</p>
        </div>
      ) : playbooks.length === 0 ? (
        <div className="text-center py-16 px-4">
          <h3 className="font-medium text-lg mb-2">No playbooks yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first trading playbook to document your strategies and rules
          </p>
          <Button onClick={() => navigate('/playbooks/new')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create your first playbook
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((playbook) => (
            <Card 
              key={playbook.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/playbooks/${playbook.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{playbook.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  {playbook.description || 'No description provided'}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm">
                    Rules: <span className="font-medium">{playbook.rules?.length || 0}</span>
                  </div>
                  <div className="flex space-x-1">
                    {(playbook.tags || []).slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-muted px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Playbooks;
