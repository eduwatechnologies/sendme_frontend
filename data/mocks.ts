export interface Runner {
  id: string;
  name: string;
  photo: string;
  location: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  availability: 'Available' | 'Busy' | 'Offline';
  completedErrands: number;
  coordinates: [number, number]; // [latitude, longitude]
}

export const MOCK_RUNNERS: Runner[] = [
  {
    id: '1',
    name: 'Tunde Bakare',
    photo: 'https://ui-avatars.com/api/?name=Tunde+Bakare&background=random',
    location: 'Lagos Island, Lagos',
    distance: '0.5 km',
    rating: 4.8,
    reviewsCount: 124,
    availability: 'Available',
    completedErrands: 342,
    coordinates: [6.4549, 3.4246], // Lagos Island
  },
  {
    id: '2',
    name: 'Chioma Okonkwo',
    photo: 'https://ui-avatars.com/api/?name=Chioma+Okonkwo&background=random',
    location: 'Ikeja, Lagos',
    distance: '12 km',
    rating: 4.9,
    reviewsCount: 89,
    availability: 'Available',
    completedErrands: 156,
    coordinates: [6.6018, 3.3515], // Ikeja
  },
  {
    id: '3',
    name: 'Emeka Okafor',
    photo: 'https://ui-avatars.com/api/?name=Emeka+Okafor&background=random',
    location: 'Lekki Phase 1, Lagos',
    distance: '8.5 km',
    rating: 4.6,
    reviewsCount: 45,
    availability: 'Busy',
    completedErrands: 78,
    coordinates: [6.4698, 3.5852], // Lekki
  },
];

export interface Errand {
  id: string;
  title: string;
  description: string;
  pickup: string;
  dropoff: string;
  price: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  distance: string;
  timestamp: string;
}

export const MOCK_ERRANDS: Errand[] = [
  {
    id: 'e1',
    title: 'Buy Groceries',
    description: 'Buy milk, bread, and eggs from Shoprite',
    pickup: 'Shoprite, Ikeja City Mall',
    dropoff: '15 Allen Avenue, Ikeja',
    price: 2500,
    status: 'In Progress',
    distance: '2.5 km',
    timestamp: '10 mins ago',
  },
  {
    id: 'e2',
    title: 'Deliver Document',
    description: 'Pick up signed contract and deliver to client',
    pickup: 'Victoria Island',
    dropoff: 'Ikoyi',
    price: 4000,
    status: 'Pending',
    distance: '5.0 km',
    timestamp: '25 mins ago',
  },
  {
    id: 'e3',
    title: 'Pick up Laundry',
    description: 'Pick up dry cleaning from laundry service',
    pickup: 'Lekki Phase 1',
    dropoff: 'Chevron Drive',
    price: 3000,
    status: 'Completed',
    distance: '3.2 km',
    timestamp: '1 hour ago',
  },
];
