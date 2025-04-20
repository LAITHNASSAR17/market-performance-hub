
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const PlaybookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playbooks, loading } = usePlaybooks();
  
  const playbook = playbooks.find(p => p.id === id);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading playbook...</p>
        </div>
      </Layout>
    );
  }

  if (!playbook) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-medium mb-2">Playbook not found</h2>
          <p className="text-gray-500 mb-4">The playbook you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/playbooks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playbooks
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2" 
          onClick={() => navigate('/playbooks')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Playbooks
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{playbook.name}</h1>
            <p className="text-gray-500">{playbook.description || 'No description provided'}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/playbooks/edit/${playbook.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trading Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {playbook.rules && playbook.rules.length > 0 ? (
            <div className="space-y-4">
              {playbook.rules.map((rule, index) => (
                <div key={rule.id || index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{rule.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {rule.type === 'entry' && 'Entry Rule'}
                      {rule.type === 'exit' && 'Exit Rule'}
                      {rule.type === 'management' && 'Risk Management'}
                      {rule.type === 'risk' && 'Risk Control'}
                      {rule.type === 'custom' && 'Custom Rule'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              No trading rules have been added to this playbook yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          variant="default" 
          onClick={() => navigate(`/playbooks/edit/${playbook.id}`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Playbook
        </Button>
      </div>
    </Layout>
  );
};

export default PlaybookDetail;
