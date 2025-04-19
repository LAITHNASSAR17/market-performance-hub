
import React from 'react';
import { Label } from "@/components/ui/label";
import { Listbox } from '@headlessui/react';
import { cn } from "@/lib/utils";

interface MarketSession {
  id: string;
  name: string;
}

const marketSessions: MarketSession[] = [
  { id: 'asia', name: 'Asia' },
  { id: 'london', name: 'London' },
  { id: 'newYork', name: 'New York' },
  { id: 'londonClose', name: 'London Close' },
  { id: 'overlap', name: 'Overlap' },
  { id: 'other', name: 'Other' },
];

interface MarketSessionSelectorProps {
  selectedSession: string;
  onSessionChange: (value: string) => void;
}

const MarketSessionSelector: React.FC<MarketSessionSelectorProps> = ({
  selectedSession,
  onSessionChange
}) => {
  return (
    <div>
      <Label htmlFor="marketSession">Market Session</Label>
      <Listbox value={selectedSession} onChange={onSessionChange}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selectedSession}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1.5 1.5 0 01.354 2.929l4.5 4.5a1.5 1.5 0 11-2.122 2.122L10 9.121l-2.732 2.732a1.5 1.5 0 11-2.122-2.122l4.5-4.5A1.5 1.5 0 0110 3zm0 14a1.5 1.5 0 01-.354-2.929l-4.5-4.5a1.5 1.5 0 112.122-2.122L10 14.879l2.732-2.732a1.5 1.5 0 112.122 2.122l-4.5 4.5A1.5 1.5 0 0110 17z" clipRule="evenodd" />
              </svg>
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {marketSessions.map((session) => (
              <Listbox.Option
                key={session.id}
                className={({ active }) =>
                  cn("relative cursor-default select-none py-2 pl-10 pr-4",
                    active ? "bg-amber-100 text-amber-900" : "text-gray-900")}
                value={session.name}
              >
                {({ selected }) => (
                  <>
                    <span className={cn("block truncate", selected ? 'font-medium' : 'font-normal')}>
                      {session.name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default MarketSessionSelector;
