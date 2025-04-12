
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { useTrade } from './TradeContext';

// Types
export type NoteFolder = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
};

export type NoteTemplate = {
  id: string;
  title: string;
  content: string;
  type: 'favorite' | 'recommended' | 'custom';
  emoji?: string;
};

export type TradeNote = {
  id: string;
  userId: string;
  title: string;
  content: string;
  tradeId?: string;
  folderId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  tradingData?: {
    netPL: number;
    contractsTraded: number;
    volume: number;
    commissions: number;
    netROI: number;
    grossPL: number;
  };
};

type TradeNotebookContextType = {
  notes: TradeNote[];
  folders: NoteFolder[];
  templates: NoteTemplate[];
  addNote: (note: Omit<TradeNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<TradeNote>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => TradeNote | undefined;
  addFolder: (folder: Omit<NoteFolder, 'id'>) => void;
  updateFolder: (id: string, folder: Partial<NoteFolder>) => void;
  deleteFolder: (id: string) => void;
  addTemplate: (template: Omit<NoteTemplate, 'id'>) => void;
  updateTemplate: (id: string, template: Partial<NoteTemplate>) => void;
  deleteTemplate: (id: string) => void;
  noteTags: string[];
  addTag: (tag: string) => void;
  loading: boolean;
};

const defaultFolders: NoteFolder[] = [
  { id: 'all', name: 'All Notes' },
  { id: 'trade-notes', name: 'Trade Notes', color: '#9c59ff' },
  { id: 'daily-journal', name: 'Daily Journal', color: '#5974ff' },
  { id: 'sessions-recap', name: 'Sessions Recap', color: '#5974ff' },
  { id: 'quarterly-goals', name: 'Quarterly Goals 📊', color: '#f5cb42' },
  { id: 'trading-plan', name: 'Trading Plan 📝', color: '#e45fff' },
  { id: '2023-goals', name: '2023 Goals + Plan 📌', color: '#4269ff' },
  { id: 'plan-of-action', name: 'Plan of Action📝', color: '#2dc653' },
  { id: 'templates', name: 'Templates', color: '#c5d3e8' },
];

const defaultTemplates: NoteTemplate[] = [
  {
    id: '1',
    title: 'Pre-Market & Post-Session',
    content: `
# PRE-MARKET CHECKLIST ✅

- [ ] Check economic calendar
- [ ] Review overnight news
- [ ] Identify key levels
- [ ] Check pre-market movers

# FUTURES 🔮

▼ ES
- Support:
- Resistance:
- Plan:

▼ NQ
- Support:
- Resistance:
- Plan:

▼ CL
- Support:
- Resistance:
- Plan:
    `,
    type: 'recommended'
  },
  {
    id: '2',
    title: 'Intra-day Check-in',
    content: `# Intra-day Check-in 📝

## Current Market Conditions
- Market sentiment:
- Key levels:
- Notable events:

## My Current State
- Mental state:
- Physical state:
- Focus level:

## Trade Performance So Far
- Number of trades:
- P&L:
- Best trade:
- Worst trade:

## Adjustments Needed
- [ ] Adjust position size
- [ ] Tighten stops
- [ ] Wait for better setups
- [ ] Take a break
`,
    type: 'favorite',
    emoji: '📝'
  },
  {
    id: '3',
    title: 'All-In-One Daily Journal',
    content: `# Daily Trading Journal 🚀

## Pre-Market
- Market outlook:
- Key levels to watch:
- Economic events:

## Trade Log
| Time | Symbol | Direction | Entry | Exit | P/L | Notes |
|------|--------|-----------|-------|------|-----|-------|
|      |        |           |       |      |     |       |
|      |        |           |       |      |     |       |

## Post-Market Review
- What worked:
- What didn't work:
- Lessons learned:
- Tomorrow's focus:
`,
    type: 'favorite',
    emoji: '🚀'
  },
  {
    id: '4',
    title: 'Mindset Assessment',
    content: `# Trading Mindset Assessment 🧠

## Current Mindset
- [ ] Focused and patient
- [ ] Impulsive and emotional
- [ ] Fearful of missing out
- [ ] Fearful of loss
- [ ] Overconfident
- [ ] Distracted

## Emotional Analysis
- Emotions driving decisions:
- Triggers identified:
- Response plan:
`,
    type: 'custom',
    emoji: '🧠'
  },
  {
    id: '5',
    title: 'Morning Game-Plan',
    content: `# Morning Game-Plan 🌞

## Market Analysis
- Overall market direction:
- Key economic events:
- Important news:

## Watchlist
| Symbol | Direction | Entry Zone | Stop | Target | Setup |
|--------|-----------|------------|------|--------|-------|
|        |           |            |      |        |       |
|        |           |            |      |        |       |

## Risk Management
- Max loss for today:
- Position sizing plan:
- Mental stops:
`,
    type: 'custom',
    emoji: '🌞'
  },
  {
    id: '6',
    title: 'Current Strengths & Weaknesses',
    content: `# Trading Strengths & Weaknesses Analysis

## Current Strengths
1. 
2. 
3. 

## Current Weaknesses
1. 
2. 
3. 

## Action Plan
- To leverage strengths:
- To address weaknesses:
- Specific exercises:
`,
    type: 'custom'
  },
  {
    id: '7',
    title: 'Quarterly Roadmap',
    content: `# Quarterly Trading Roadmap 📈

## Review of Last Quarter
- Performance metrics:
- Key achievements:
- Main challenges:

## Goals for This Quarter
1. 
2. 
3. 

## Action Steps
- Trading strategy refinements:
- Skill development focus:
- Risk management adjustments:

## Metrics to Track
- Win rate target:
- Risk-reward target:
- Max drawdown limit:
`,
    type: 'custom',
    emoji: '📈'
  }
];

// Sample notes
const sampleNotes: TradeNote[] = [
  {
    id: '1',
    userId: '1',
    title: 'MES : Jun 19, 2024',
    content: `# Pre-Market Plan

| Symbol | Game Plan |
|--------|-----------|
| ES     | Watch for breakout above 5400. Key support at 5380. |
| MES    | Follow ES direction. Smaller position size. |
| CL     | Range-bound between 82-84. Look for reversal at extremes. |

## Session Notes
Had a good trading session with multiple small winners. Focused on following the plan.
`,
    folderId: 'trade-notes',
    tags: ['futures', 'MES', 'successful'],
    createdAt: '2024-07-07T15:30:00Z',
    updatedAt: '2024-07-07T15:30:00Z',
    tradingData: {
      netPL: 607.50,
      contractsTraded: 30,
      volume: 5,
      commissions: 0,
      netROI: 0.07,
      grossPL: 607.50
    }
  },
  {
    id: '2',
    userId: '1',
    title: 'MES : Jun 25, 2024',
    content: `# Trading Session Review

Poor execution today. Entered too early without confirmation, resulting in a loss.

## Lessons Learned
- Wait for clear signal confirmation
- Reduce size when volatility increases
- Stick to the plan, no impulsive entries
`,
    folderId: 'sessions-recap',
    tags: ['futures', 'MES', 'lessons'],
    createdAt: '2024-07-07T12:15:00Z',
    updatedAt: '2024-07-07T13:45:00Z',
    tradingData: {
      netPL: -300.00,
      contractsTraded: 15,
      volume: 3,
      commissions: 0,
      netROI: -0.03,
      grossPL: -300.00
    }
  },
  {
    id: '3',
    userId: '1',
    title: 'ES : Apr 24, 2023',
    content: `# Trading Psychology Notes

Need to work on patience. Too many trades taken out of boredom rather than conviction.

## Action Items:
1. Set specific entry criteria
2. Wait for setups that meet ALL criteria
3. Take breaks between trades
`,
    folderId: 'daily-journal',
    tags: ['psychology', 'improvement'],
    createdAt: '2024-04-08T09:45:00Z',
    updatedAt: '2024-04-08T09:45:00Z'
  },
  {
    id: '4',
    userId: '1',
    title: 'MES : Jun 25, 2024',
    content: `# Trading Plan Review

Good execution on this trade. Waited for pullback to key level and entered with defined stop.

## What Worked:
- Patience in waiting for setup
- Proper position sizing
- Trailing stop execution
`,
    folderId: 'sessions-recap',
    tags: ['futures', 'MES', 'successful'],
    createdAt: '2024-07-02T09:45:00Z',
    updatedAt: '2024-07-02T09:45:00Z',
    tradingData: {
      netPL: 900.00,
      contractsTraded: 20,
      volume: 4,
      commissions: 0,
      netROI: 0.09,
      grossPL: 900.00
    }
  },
  {
    id: '5',
    userId: '1',
    title: 'MES : Jun 26, 2024',
    content: `# Quick Trade Review

Scalp trade that worked out. In and out based on momentum shift.

## Details:
- Entry on breakout
- Added on pullback
- Exited at first sign of exhaustion
`,
    folderId: 'trade-notes',
    tags: ['futures', 'MES', 'scalp'],
    createdAt: '2024-07-02T10:45:00Z',
    updatedAt: '2024-07-02T10:45:00Z',
    tradingData: {
      netPL: 262.50,
      contractsTraded: 10,
      volume: 2,
      commissions: 0,
      netROI: 0.03,
      grossPL: 262.50
    }
  },
  {
    id: '6',
    userId: '1',
    title: 'MES : Jun 26, 2024',
    content: `# Failed Setup Analysis

Trade didn't work out. Analyzed what went wrong.

## Mistakes:
- Entered against trend
- Position size too large
- Ignored warning signs
`,
    folderId: 'trade-notes',
    tags: ['futures', 'MES', 'failure'],
    createdAt: '2024-07-02T14:30:00Z',
    updatedAt: '2024-07-02T14:30:00Z',
    tradingData: {
      netPL: -300.00,
      contractsTraded: 15,
      volume: 3,
      commissions: 0,
      netROI: -0.03,
      grossPL: -300.00
    }
  },
  {
    id: '7',
    userId: '1',
    title: 'MES : Jun 21, 2024',
    content: `# Paper Trading Session

Practiced new strategy in paper trading account.

## Observations:
- Strategy showing promise
- Need more data points
- Consider live testing with small size
`,
    folderId: 'trade-notes',
    tags: ['futures', 'MES', 'paper-trading'],
    createdAt: '2024-06-26T11:30:00Z',
    updatedAt: '2024-06-26T11:30:00Z',
    tradingData: {
      netPL: 0.00,
      contractsTraded: 5,
      volume: 1,
      commissions: 0,
      netROI: 0.00,
      grossPL: 0.00
    }
  }
];

const TradeNotebookContext = createContext<TradeNotebookContextType | undefined>(undefined);

export const TradeNotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<TradeNote[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>(defaultFolders);
  const [templates, setTemplates] = useState<NoteTemplate[]>(defaultTemplates);
  const [loading, setLoading] = useState(true);
  const [noteTags, setNoteTags] = useState<string[]>([
    'futures', 'stocks', 'forex', 'crypto', 'successful', 'failure', 'lessons', 'psychology'
  ]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { trades } = useTrade();

  useEffect(() => {
    if (user) {
      // Load notes from localStorage or use sample data
      const storedNotes = localStorage.getItem('tradeNotes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        // Use sample data on first load
        setNotes(sampleNotes);
        localStorage.setItem('tradeNotes', JSON.stringify(sampleNotes));
      }

      // Load folders from localStorage or use defaults
      const storedFolders = localStorage.getItem('noteFolders');
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      } else {
        setFolders(defaultFolders);
        localStorage.setItem('noteFolders', JSON.stringify(defaultFolders));
      }

      // Load templates from localStorage or use defaults
      const storedTemplates = localStorage.getItem('noteTemplates');
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      } else {
        setTemplates(defaultTemplates);
        localStorage.setItem('noteTemplates', JSON.stringify(defaultTemplates));
      }

      // Extract all unique tags
      const tagSet = new Set<string>();
      sampleNotes.forEach(note => {
        note.tags.forEach(tag => tagSet.add(tag));
      });
      setNoteTags(prev => Array.from(new Set([...prev, ...tagSet])));
    } else {
      setNotes([]);
    }
    setLoading(false);
  }, [user]);

  const addNote = (newNoteData: Omit<TradeNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date().toISOString();
    const newNote: TradeNote = {
      ...newNoteData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: now,
      updatedAt: now
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('tradeNotes', JSON.stringify(updatedNotes));

    // Update tags
    const newTags = newNote.tags.filter(tag => !noteTags.includes(tag));
    if (newTags.length > 0) {
      setNoteTags([...noteTags, ...newTags]);
    }

    toast({
      title: "Note Added",
      description: "Your note has been added successfully",
    });
  };

  const updateNote = (id: string, noteUpdate: Partial<TradeNote>) => {
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) return;

    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = { 
      ...updatedNotes[noteIndex], 
      ...noteUpdate,
      updatedAt: new Date().toISOString()
    };
    
    setNotes(updatedNotes);
    localStorage.setItem('tradeNotes', JSON.stringify(updatedNotes));

    // Update tags if they changed
    if (noteUpdate.tags) {
      const newTags = noteUpdate.tags.filter(tag => !noteTags.includes(tag));
      if (newTags.length > 0) {
        setNoteTags([...noteTags, ...newTags]);
      }
    }

    toast({
      title: "Note Updated",
      description: "Your note has been updated successfully",
    });
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('tradeNotes', JSON.stringify(updatedNotes));

    toast({
      title: "Note Deleted",
      description: "Your note has been deleted successfully",
    });
  };

  const getNote = (id: string) => {
    return notes.find(note => note.id === id);
  };

  const addFolder = (folderData: Omit<NoteFolder, 'id'>) => {
    const newFolder: NoteFolder = {
      ...folderData,
      id: Date.now().toString()
    };

    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem('noteFolders', JSON.stringify(updatedFolders));

    toast({
      title: "Folder Added",
      description: "New folder has been created successfully",
    });
  };

  const updateFolder = (id: string, folderUpdate: Partial<NoteFolder>) => {
    const folderIndex = folders.findIndex(f => f.id === id);
    if (folderIndex === -1) return;

    const updatedFolders = [...folders];
    updatedFolders[folderIndex] = { 
      ...updatedFolders[folderIndex], 
      ...folderUpdate
    };
    
    setFolders(updatedFolders);
    localStorage.setItem('noteFolders', JSON.stringify(updatedFolders));

    toast({
      title: "Folder Updated",
      description: "Folder has been updated successfully",
    });
  };

  const deleteFolder = (id: string) => {
    // Don't allow deleting default folders
    if (defaultFolders.some(f => f.id === id)) {
      toast({
        title: "Cannot Delete",
        description: "Default folders cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    const updatedFolders = folders.filter(folder => folder.id !== id);
    setFolders(updatedFolders);
    localStorage.setItem('noteFolders', JSON.stringify(updatedFolders));

    toast({
      title: "Folder Deleted",
      description: "Folder has been deleted successfully",
    });
  };

  const addTemplate = (templateData: Omit<NoteTemplate, 'id'>) => {
    const newTemplate: NoteTemplate = {
      ...templateData,
      id: Date.now().toString()
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('noteTemplates', JSON.stringify(updatedTemplates));

    toast({
      title: "Template Added",
      description: "New template has been created successfully",
    });
  };

  const updateTemplate = (id: string, templateUpdate: Partial<NoteTemplate>) => {
    const templateIndex = templates.findIndex(t => t.id === id);
    if (templateIndex === -1) return;

    const updatedTemplates = [...templates];
    updatedTemplates[templateIndex] = { 
      ...updatedTemplates[templateIndex], 
      ...templateUpdate
    };
    
    setTemplates(updatedTemplates);
    localStorage.setItem('noteTemplates', JSON.stringify(updatedTemplates));

    toast({
      title: "Template Updated",
      description: "Template has been updated successfully",
    });
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('noteTemplates', JSON.stringify(updatedTemplates));

    toast({
      title: "Template Deleted",
      description: "Template has been deleted successfully",
    });
  };

  const addTag = (tag: string) => {
    if (!noteTags.includes(tag)) {
      setNoteTags([...noteTags, tag]);
    }
  };

  return (
    <TradeNotebookContext.Provider value={{ 
      notes, 
      folders,
      templates,
      addNote, 
      updateNote, 
      deleteNote, 
      getNote,
      addFolder,
      updateFolder,
      deleteFolder,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      loading,
      noteTags,
      addTag
    }}>
      {children}
    </TradeNotebookContext.Provider>
  );
};

export const useTradeNotebook = () => {
  const context = useContext(TradeNotebookContext);
  if (context === undefined) {
    throw new Error('useTradeNotebook must be used within a TradeNotebookProvider');
  }
  return context;
};
