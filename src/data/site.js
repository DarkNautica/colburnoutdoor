import {
  ClipboardCheck,
  Flower2,
  Leaf,
  Ruler,
  Scissors,
  Shovel,
  Sprout,
  SunMedium,
  Trees,
} from 'lucide-react';

export const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Seasonal Care', href: '#seasonal-care' },
  { label: 'Contact', href: '#contact' },
];

export const services = [
  {
    title: 'Lawn Mowing',
    text: 'Recurring cuts that keep the lawn even, clean, and easy to enjoy.',
    icon: Leaf,
  },
  {
    title: 'Edging & Trimming',
    text: 'Crisp lines around walks, beds, fences, and hard-to-reach corners.',
    icon: Scissors,
  },
  {
    title: 'Mulch & Bed Care',
    text: 'Fresh bed definition, tidy mulch, and detail work around plants.',
    icon: Shovel,
  },
  {
    title: 'Seasonal Cleanup',
    text: 'A reset for overgrowth, fallen branches, and weather-worn spaces.',
    icon: Sprout,
  },
  {
    title: 'Shrub Pruning',
    text: 'Careful shaping that respects the plant and the look of the home.',
    icon: Trees,
  },
  {
    title: 'Leaf Removal',
    text: 'Clear lawns, beds, and walkways when the season starts piling up.',
    icon: Flower2,
  },
];

export const processSteps = [
  {
    title: 'Walk the property',
    text: 'Start with the yard, the edges, and the places that need special attention.',
    icon: Ruler,
  },
  {
    title: 'Care for the details',
    text: 'Mow, trim, edge, clear, and clean up with a steady order of work.',
    icon: ClipboardCheck,
  },
  {
    title: 'Leave it tidy',
    text: 'Finish with a final pass so beds, walks, and lawn lines feel complete.',
    icon: SunMedium,
  },
];

export const seasonalPlans = [
  {
    season: 'Spring',
    title: 'Refresh the yard after winter',
    items: ['Cleanup and bed reset', 'Fresh edging', 'Mulch touch-ups'],
  },
  {
    season: 'Summer',
    title: 'Keep growth under control',
    items: ['Routine mowing', 'Trimming and pruning', 'Walkway clearing'],
  },
  {
    season: 'Fall',
    title: 'Get leaves and beds handled',
    items: ['Leaf removal', 'Final mow planning', 'Shrub cleanup'],
  },
  {
    season: 'Winter',
    title: 'Plan the next clean start',
    items: ['Property notes', 'Maintenance planning', 'Seasonal follow-up'],
  },
];

export const formServices = [
  'Recurring Lawn Care',
  'One-Time Cleanup',
  'Edging & Trimming',
  'Mulch & Bed Care',
  'Shrub Pruning',
  'Leaf Removal',
];
