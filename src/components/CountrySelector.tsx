
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface Country {
  value: string;
  label: string;
}

// List of countries
export const countries: Country[] = [
  { value: 'af', label: 'Afghanistan' },
  { value: 'al', label: 'Albania' },
  { value: 'dz', label: 'Algeria' },
  { value: 'ad', label: 'Andorra' },
  { value: 'ao', label: 'Angola' },
  { value: 'ai', label: 'Anguilla' },
  { value: 'ag', label: 'Antigua and Barbuda' },
  { value: 'ar', label: 'Argentina' },
  { value: 'am', label: 'Armenia' },
  { value: 'aw', label: 'Aruba' },
  { value: 'au', label: 'Australia' },
  { value: 'at', label: 'Austria' },
  { value: 'az', label: 'Azerbaijan' },
  { value: 'bs', label: 'Bahamas' },
  { value: 'bh', label: 'Bahrain' },
  { value: 'bd', label: 'Bangladesh' },
  { value: 'bb', label: 'Barbados' },
  { value: 'by', label: 'Belarus' },
  { value: 'be', label: 'Belgium' },
  { value: 'bz', label: 'Belize' },
  { value: 'bj', label: 'Benin' },
  { value: 'bm', label: 'Bermuda' },
  { value: 'bt', label: 'Bhutan' },
  { value: 'bo', label: 'Bolivia' },
  { value: 'ba', label: 'Bosnia and Herzegovina' },
  { value: 'bw', label: 'Botswana' },
  { value: 'br', label: 'Brazil' },
  { value: 'io', label: 'British Indian Ocean Territory' },
  { value: 'vg', label: 'British Virgin Islands' },
  { value: 'bn', label: 'Brunei' },
  { value: 'bg', label: 'Bulgaria' },
  { value: 'bf', label: 'Burkina Faso' },
  { value: 'bi', label: 'Burundi' },
  { value: 'kh', label: 'Cambodia' },
  { value: 'cm', label: 'Cameroon' },
  { value: 'ca', label: 'Canada' },
  { value: 'cv', label: 'Cape Verde' },
  { value: 'ky', label: 'Cayman Islands' },
  { value: 'cf', label: 'Central African Republic' },
  { value: 'td', label: 'Chad' },
  { value: 'cl', label: 'Chile' },
  { value: 'cn', label: 'China' },
  { value: 'co', label: 'Colombia' },
  { value: 'km', label: 'Comoros' },
  { value: 'cg', label: 'Congo' },
  { value: 'ck', label: 'Cook Islands' },
  { value: 'cr', label: 'Costa Rica' },
  { value: 'hr', label: 'Croatia' },
  { value: 'cu', label: 'Cuba' },
  { value: 'cw', label: 'Curaçao' },
  { value: 'cy', label: 'Cyprus' },
  { value: 'cz', label: 'Czech Republic' },
  { value: 'cd', label: 'Democratic Republic of the Congo' },
  { value: 'dk', label: 'Denmark' },
  { value: 'dj', label: 'Djibouti' },
  { value: 'dm', label: 'Dominica' },
  { value: 'do', label: 'Dominican Republic' },
  { value: 'ec', label: 'Ecuador' },
  { value: 'eg', label: 'Egypt' },
  { value: 'sv', label: 'El Salvador' },
  { value: 'gq', label: 'Equatorial Guinea' },
  { value: 'er', label: 'Eritrea' },
  { value: 'ee', label: 'Estonia' },
  { value: 'et', label: 'Ethiopia' },
  { value: 'fk', label: 'Falkland Islands' },
  { value: 'fo', label: 'Faroe Islands' },
  { value: 'fj', label: 'Fiji' },
  { value: 'fi', label: 'Finland' },
  { value: 'fr', label: 'France' },
  { value: 'gf', label: 'French Guiana' },
  { value: 'pf', label: 'French Polynesia' },
  { value: 'ga', label: 'Gabon' },
  { value: 'gm', label: 'Gambia' },
  { value: 'ge', label: 'Georgia' },
  { value: 'de', label: 'Germany' },
  { value: 'gh', label: 'Ghana' },
  { value: 'gi', label: 'Gibraltar' },
  { value: 'gr', label: 'Greece' },
  { value: 'gl', label: 'Greenland' },
  { value: 'gd', label: 'Grenada' },
  { value: 'gp', label: 'Guadeloupe' },
  { value: 'gu', label: 'Guam' },
  { value: 'gt', label: 'Guatemala' },
  { value: 'gg', label: 'Guernsey' },
  { value: 'gn', label: 'Guinea' },
  { value: 'gw', label: 'Guinea-Bissau' },
  { value: 'gy', label: 'Guyana' },
  { value: 'ht', label: 'Haiti' },
  { value: 'hn', label: 'Honduras' },
  { value: 'hk', label: 'Hong Kong' },
  { value: 'hu', label: 'Hungary' },
  { value: 'is', label: 'Iceland' },
  { value: 'in', label: 'India' },
  { value: 'id', label: 'Indonesia' },
  { value: 'ir', label: 'Iran' },
  { value: 'iq', label: 'Iraq' },
  { value: 'ie', label: 'Ireland' },
  { value: 'im', label: 'Isle of Man' },
  { value: 'il', label: 'Israel' },
  { value: 'it', label: 'Italy' },
  { value: 'ci', label: 'Ivory Coast' },
  { value: 'jm', label: 'Jamaica' },
  { value: 'jp', label: 'Japan' },
  { value: 'je', label: 'Jersey' },
  { value: 'jo', label: 'Jordan' },
  { value: 'kz', label: 'Kazakhstan' },
  { value: 'ke', label: 'Kenya' },
  { value: 'ki', label: 'Kiribati' },
  { value: 'xk', label: 'Kosovo' },
  { value: 'kw', label: 'Kuwait' },
  { value: 'kg', label: 'Kyrgyzstan' },
  { value: 'la', label: 'Laos' },
  { value: 'lv', label: 'Latvia' },
  { value: 'lb', label: 'Lebanon' },
  { value: 'ls', label: 'Lesotho' },
  { value: 'lr', label: 'Liberia' },
  { value: 'ly', label: 'Libya' },
  { value: 'li', label: 'Liechtenstein' },
  { value: 'lt', label: 'Lithuania' },
  { value: 'lu', label: 'Luxembourg' },
  { value: 'mo', label: 'Macau' },
  { value: 'mk', label: 'Macedonia' },
  { value: 'mg', label: 'Madagascar' },
  { value: 'mw', label: 'Malawi' },
  { value: 'my', label: 'Malaysia' },
  { value: 'mv', label: 'Maldives' },
  { value: 'ml', label: 'Mali' },
  { value: 'mt', label: 'Malta' },
  { value: 'mh', label: 'Marshall Islands' },
  { value: 'mq', label: 'Martinique' },
  { value: 'mr', label: 'Mauritania' },
  { value: 'mu', label: 'Mauritius' },
  { value: 'yt', label: 'Mayotte' },
  { value: 'mx', label: 'Mexico' },
  { value: 'fm', label: 'Micronesia' },
  { value: 'md', label: 'Moldova' },
  { value: 'mc', label: 'Monaco' },
  { value: 'mn', label: 'Mongolia' },
  { value: 'me', label: 'Montenegro' },
  { value: 'ms', label: 'Montserrat' },
  { value: 'ma', label: 'Morocco' },
  { value: 'mz', label: 'Mozambique' },
  { value: 'mm', label: 'Myanmar' },
  { value: 'na', label: 'Namibia' },
  { value: 'nr', label: 'Nauru' },
  { value: 'np', label: 'Nepal' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'nc', label: 'New Caledonia' },
  { value: 'nz', label: 'New Zealand' },
  { value: 'ni', label: 'Nicaragua' },
  { value: 'ne', label: 'Niger' },
  { value: 'ng', label: 'Nigeria' },
  { value: 'nu', label: 'Niue' },
  { value: 'kp', label: 'North Korea' },
  { value: 'mp', label: 'Northern Mariana Islands' },
  { value: 'no', label: 'Norway' },
  { value: 'om', label: 'Oman' },
  { value: 'pk', label: 'Pakistan' },
  { value: 'pw', label: 'Palau' },
  { value: 'ps', label: 'Palestine' },
  { value: 'pa', label: 'Panama' },
  { value: 'pg', label: 'Papua New Guinea' },
  { value: 'py', label: 'Paraguay' },
  { value: 'pe', label: 'Peru' },
  { value: 'ph', label: 'Philippines' },
  { value: 'pn', label: 'Pitcairn Islands' },
  { value: 'pl', label: 'Poland' },
  { value: 'pt', label: 'Portugal' },
  { value: 'pr', label: 'Puerto Rico' },
  { value: 'qa', label: 'Qatar' },
  { value: 're', label: 'Réunion' },
  { value: 'ro', label: 'Romania' },
  { value: 'ru', label: 'Russia' },
  { value: 'rw', label: 'Rwanda' },
  { value: 'bl', label: 'Saint Barthélemy' },
  { value: 'sh', label: 'Saint Helena' },
  { value: 'kn', label: 'Saint Kitts and Nevis' },
  { value: 'lc', label: 'Saint Lucia' },
  { value: 'mf', label: 'Saint Martin' },
  { value: 'pm', label: 'Saint Pierre and Miquelon' },
  { value: 'vc', label: 'Saint Vincent and the Grenadines' },
  { value: 'ws', label: 'Samoa' },
  { value: 'sm', label: 'San Marino' },
  { value: 'st', label: 'São Tomé and Príncipe' },
  { value: 'sa', label: 'Saudi Arabia' },
  { value: 'sn', label: 'Senegal' },
  { value: 'rs', label: 'Serbia' },
  { value: 'sc', label: 'Seychelles' },
  { value: 'sl', label: 'Sierra Leone' },
  { value: 'sg', label: 'Singapore' },
  { value: 'sx', label: 'Sint Maarten' },
  { value: 'sk', label: 'Slovakia' },
  { value: 'si', label: 'Slovenia' },
  { value: 'sb', label: 'Solomon Islands' },
  { value: 'so', label: 'Somalia' },
  { value: 'za', label: 'South Africa' },
  { value: 'kr', label: 'South Korea' },
  { value: 'ss', label: 'South Sudan' },
  { value: 'es', label: 'Spain' },
  { value: 'lk', label: 'Sri Lanka' },
  { value: 'sd', label: 'Sudan' },
  { value: 'sr', label: 'Suriname' },
  { value: 'sj', label: 'Svalbard and Jan Mayen' },
  { value: 'sz', label: 'Swaziland' },
  { value: 'se', label: 'Sweden' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'sy', label: 'Syria' },
  { value: 'tw', label: 'Taiwan' },
  { value: 'tj', label: 'Tajikistan' },
  { value: 'tz', label: 'Tanzania' },
  { value: 'th', label: 'Thailand' },
  { value: 'tl', label: 'Timor-Leste' },
  { value: 'tg', label: 'Togo' },
  { value: 'tk', label: 'Tokelau' },
  { value: 'to', label: 'Tonga' },
  { value: 'tt', label: 'Trinidad and Tobago' },
  { value: 'tn', label: 'Tunisia' },
  { value: 'tr', label: 'Turkey' },
  { value: 'tm', label: 'Turkmenistan' },
  { value: 'tc', label: 'Turks and Caicos Islands' },
  { value: 'tv', label: 'Tuvalu' },
  { value: 'vi', label: 'U.S. Virgin Islands' },
  { value: 'ug', label: 'Uganda' },
  { value: 'ua', label: 'Ukraine' },
  { value: 'ae', label: 'United Arab Emirates' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'uy', label: 'Uruguay' },
  { value: 'uz', label: 'Uzbekistan' },
  { value: 'vu', label: 'Vanuatu' },
  { value: 'va', label: 'Vatican City' },
  { value: 've', label: 'Venezuela' },
  { value: 'vn', label: 'Vietnam' },
  { value: 'wf', label: 'Wallis and Futuna' },
  { value: 'eh', label: 'Western Sahara' },
  { value: 'ye', label: 'Yemen' },
  { value: 'zm', label: 'Zambia' },
  { value: 'zw', label: 'Zimbabwe' }
];

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCountry = countries.find((country) => country.value === value);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
        >
          {selectedCountry ? selectedCountry.label : "Select a country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.value}
                value={country.value}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {country.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
