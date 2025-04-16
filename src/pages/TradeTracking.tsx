
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Clock, ExternalLink, Landmark, LineChart, Maximize2, PieChart, Save, Star, Tag, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import HashtagBadge from '@/components/HashtagBadge';
import TradeChart from '@/components/TradeChart';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import StarRating from '@/components/StarRating';

const TradeTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTrade, updateTrade } = useTrade();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const trade = id ? getTrade(id) : undefined;
  const [notes, setNotes] = useState(trade?.notes || '');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [rating, setRating] = useState(trade?.rating || 0);
  
  if (!trade) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Trade Not Found</h2>
          <p className="text-gray-500 mb-6">The trade you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/trades')}>Go Back to Trades</Button>
        </div>
      </Layout>
    );
  }
  
  const formattedDate = format(new Date(trade.date), 'MMMM d, yyyy');
  
  const handleSaveNotes = () => {
    if (id) {
      updateTrade(id, { notes });
      toast({
        title: "Notes saved",
        description: "Your trade notes have been updated successfully",
      });
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (id) {
      updateTrade(id, { rating: newRating });
      toast({
        title: "Rating updated",
        description: "Your trade rating has been updated successfully",
      });
    }
  };

  const openEnlargedImage = (imageUrl: string) => {
    setEnlargedImage(imageUrl);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };
  
  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{trade.pair} {trade.type} Trade</h1>
          <p className="text-gray-500">{formattedDate}</p>
        </div>
        
        <div className={cn(
          "text-2xl font-bold",
          trade.profitLoss > 0 ? "text-emerald-500" : "text-red-500"
        )}>
          {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Trade Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Wallet className="mr-2 h-4 w-4" />
                Trade Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Account</dt>
                  <dd className="font-medium">{trade.account}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd>
                    <Badge variant={trade.type === 'Buy' ? "success" : "destructive"}>
                      {trade.type}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Lot Size</dt>
                  <dd className="font-medium">{trade.lotSize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Return %</dt>
                  <dd className={cn(
                    "font-medium",
                    trade.returnPercentage > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {trade.returnPercentage > 0 ? '+' : ''}{trade.returnPercentage}%
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <LineChart className="mr-2 h-4 w-4" />
                Price Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Entry</dt>
                  <dd className="font-medium">{trade.entry.toFixed(5)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Exit</dt>
                  <dd className="font-medium">{trade.exit.toFixed(5)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Stop Loss</dt>
                  <dd className="font-medium">{trade.stopLoss ? trade.stopLoss.toFixed(5) : "N/A"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Take Profit</dt>
                  <dd className="font-medium">{trade.takeProfit ? trade.takeProfit.toFixed(5) : "N/A"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Date</dt>
                  <dd className="font-medium">{formattedDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Duration</dt>
                  <dd className="flex items-center font-medium">
                    <Clock className="mr-1 h-3 w-3" />
                    {trade.durationMinutes} minutes
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium">
                    {format(new Date(trade.createdAt), 'MMM d, yyyy')}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
        
        {/* Trade Rating Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Star className="mr-2 h-4 w-4" />
              Trade Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">How would you rate this trade?</p>
              <StarRating 
                rating={rating} 
                onRatingChange={handleRatingChange}
                size="large"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Risk & Reward Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <PieChart className="mr-2 h-4 w-4" />
              Risk & Reward
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Risk %</dt>
                  <dd className="font-medium">{trade.riskPercentage}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Risk Amount</dt>
                  <dd className="font-medium">
                    {trade.stopLoss ? 
                      Math.abs((trade.entry - trade.stopLoss) * trade.lotSize * 10000).toFixed(2) 
                      : "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reward Amount</dt>
                  <dd className="font-medium">
                    {trade.takeProfit ? 
                      Math.abs((trade.takeProfit - trade.entry) * trade.lotSize * 10000).toFixed(2) 
                      : "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">R Multiple</dt>
                  <dd className="font-medium">
                    {trade.stopLoss ? 
                      (Math.abs(trade.profitLoss) / 
                      Math.abs((trade.entry - trade.stopLoss) * trade.lotSize * 10000)).toFixed(2) 
                      : "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Win/Loss</dt>
                  <dd>
                    <Badge variant={trade.profitLoss > 0 ? "success" : "destructive"}>
                      {trade.profitLoss > 0 ? "Win" : "Loss"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Return on Risk</dt>
                  <dd className="font-medium">
                    {trade.stopLoss ? 
                      ((trade.profitLoss / 
                      Math.abs((trade.entry - trade.stopLoss) * trade.lotSize * 10000)) * 100).toFixed(2) + "%" 
                      : "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Profit/Loss</dt>
                  <dd className={cn(
                    "font-medium",
                    trade.profitLoss > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Return %</dt>
                  <dd className={cn(
                    "font-medium",
                    trade.returnPercentage > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {trade.returnPercentage > 0 ? '+' : ''}{trade.returnPercentage}%
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
        
        {/* Chart Section */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Chart Analysis</CardTitle>
            <CardDescription>TradingView chart with trade details</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            <TradeChart trade={trade} />
          </CardContent>
        </Card>

        {/* Trade Images Section */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Images</CardTitle>
            <CardDescription>Before and after trade images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Trade Image */}
              <div className="rounded-md overflow-hidden border">
                <div className="bg-gray-50 p-2 border-b">
                  <h3 className="font-medium">Before Trade</h3>
                </div>
                {trade.beforeImageUrl ? (
                  <div className="relative">
                    <img 
                      src={trade.beforeImageUrl} 
                      alt="Before trade" 
                      className="w-full h-auto object-contain max-h-[300px]"
                    />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                      onClick={() => openEnlargedImage(trade.beforeImageUrl!)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50">
                    <p className="text-gray-500">No before image available</p>
                  </div>
                )}
              </div>
              
              {/* After Trade Image */}
              <div className="rounded-md overflow-hidden border">
                <div className="bg-gray-50 p-2 border-b">
                  <h3 className="font-medium">After Trade</h3>
                </div>
                {trade.afterImageUrl ? (
                  <div className="relative">
                    <img 
                      src={trade.afterImageUrl} 
                      alt="After trade" 
                      className="w-full h-auto object-contain max-h-[300px]"
                    />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                      onClick={() => openEnlargedImage(trade.afterImageUrl!)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50">
                    <p className="text-gray-500">No after image available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Chart Image */}
            {trade.imageUrl && (
              <div className="mt-6 rounded-md overflow-hidden border">
                <div className="bg-gray-50 p-2 border-b">
                  <h3 className="font-medium">Additional Chart Image</h3>
                </div>
                <div className="relative">
                  <img 
                    src={trade.imageUrl} 
                    alt="Trade chart" 
                    className="w-full h-auto object-contain max-h-[400px]"
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                    onClick={() => openEnlargedImage(trade.imageUrl!)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tags & Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {trade.hashtags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {trade.hashtags.map(tag => (
                      <HashtagBadge key={tag} tag={tag} size="md" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tags added to this trade.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Landmark className="mr-2 h-4 w-4" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 text-sm text-center py-6">
                <p>Market analysis functionality coming soon.</p>
                <p>In future versions, this will include market conditions, news events, and other analysis.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Trade Notes
            </CardTitle>
            <CardDescription>Add detailed notes about your trade strategy, outcomes, and lessons learned</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your detailed notes about this trade..."
              className="min-h-[150px] mb-4"
            />
            <Button onClick={handleSaveNotes} className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              Save Notes
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Enlarged Image Dialog */}
      <Dialog open={!!enlargedImage} onOpenChange={closeEnlargedImage}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {enlargedImage && (
            <div className="relative">
              <img 
                src={enlargedImage} 
                alt="Enlarged trade image" 
                className="w-full h-auto"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-4 right-4"
                onClick={closeEnlargedImage}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TradeTracking;
