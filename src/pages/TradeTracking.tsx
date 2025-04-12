
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTrade } from '@/contexts/TradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, Landmark, LineChart, PieChart, Tag, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import HashtagBadge from '@/components/HashtagBadge';
import TradeChart from '@/components/TradeChart';

const TradeTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTrade } = useTrade();
  const navigate = useNavigate();
  
  const trade = id ? getTrade(id) : undefined;
  
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
          trade.profitLoss > 0 ? "text-profit" : "text-loss"
        )}>
          {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
        </div>
      </div>
      
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="images">Trade Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
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
                      trade.returnPercentage > 0 ? "text-profit" : "text-loss"
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
                      trade.profitLoss > 0 ? "text-profit" : "text-loss"
                    )}>
                      {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Return %</dt>
                    <dd className={cn(
                      "font-medium",
                      trade.returnPercentage > 0 ? "text-profit" : "text-loss"
                    )}>
                      {trade.returnPercentage > 0 ? '+' : ''}{trade.returnPercentage}%
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Tags & Notes
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
                
                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  {trade.notes ? (
                    <p className="text-gray-600">{trade.notes}</p>
                  ) : (
                    <p className="text-gray-500 text-sm">No notes for this trade.</p>
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
        </TabsContent>
        
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Trade Chart Analysis</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[500px]">
              <TradeChart trade={trade} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Trade Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Before Trade</CardTitle>
              </CardHeader>
              <CardContent>
                {trade.beforeImageUrl ? (
                  <div className="rounded-md overflow-hidden border">
                    <img 
                      src={trade.beforeImageUrl} 
                      alt="Before trade" 
                      className="w-full h-auto object-contain max-h-[400px]"
                    />
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-md">
                    <p className="text-gray-500">No before image available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* After Trade Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">After Trade</CardTitle>
              </CardHeader>
              <CardContent>
                {trade.afterImageUrl ? (
                  <div className="rounded-md overflow-hidden border">
                    <img 
                      src={trade.afterImageUrl} 
                      alt="After trade" 
                      className="w-full h-auto object-contain max-h-[400px]"
                    />
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-md">
                    <p className="text-gray-500">No after image available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Chart Image */}
          {trade.imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Chart Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md overflow-hidden border">
                  <img 
                    src={trade.imageUrl} 
                    alt="Trade chart" 
                    className="w-full h-auto object-contain max-h-[600px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default TradeTracking;
