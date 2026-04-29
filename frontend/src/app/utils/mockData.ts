export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  status: "available" | "rented" | "maintenance" | "cleaning" | "damaged";
  category: string;
  pricePerDay: number;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Rental {
  id: string;
  clientId: string;
  carId: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled" | "pending";
  totalPrice: number;
  serviceIds: string[];
}

export interface Payment {
  id: string;
  rentalId: string;
  amount: number;
  date: string;
  method: string;
}

export interface Fine {
  id: string;
  rentalId: string;
  description: string;
  amount: number;
  date: string;
}

export const initialCars: Car[] = [
  { id: "1", brand: "Toyota", model: "Camry", year: 2022, mileage: 15000, status: "available", category: "Sedan", pricePerDay: 50 },
  { id: "2", brand: "Honda", model: "Civic", year: 2023, mileage: 8000, status: "rented", category: "Sedan", pricePerDay: 45 },
  { id: "3", brand: "BMW", model: "X5", year: 2021, mileage: 25000, status: "maintenance", category: "SUV", pricePerDay: 120 },
  { id: "4", brand: "Mercedes", model: "C-Class", year: 2023, mileage: 5000, status: "available", category: "Luxury", pricePerDay: 110 },
  { id: "5", brand: "Ford", model: "Explorer", year: 2022, mileage: 18000, status: "cleaning", category: "SUV", pricePerDay: 85 },
];

export const initialClients: Client[] = [
  { id: "1", firstName: "John", lastName: "Doe", phone: "+1-555-0101", email: "john.doe@email.com" },
  { id: "2", firstName: "Jane", lastName: "Smith", phone: "+1-555-0102", email: "jane.smith@email.com" },
  { id: "3", firstName: "Michael", lastName: "Johnson", phone: "+1-555-0103", email: "michael.j@email.com" },
  { id: "4", firstName: "Emily", lastName: "Brown", phone: "+1-555-0104", email: "emily.brown@email.com" },
  { id: "5", firstName: "David", lastName: "Wilson", phone: "+1-555-0105", email: "david.w@email.com" },
];

export const initialServices: Service[] = [
  { id: "1", name: "GPS Navigation", price: 10, description: "Portable GPS device" },
  { id: "2", name: "Child Seat", price: 15, description: "Safety child seat" },
  { id: "3", name: "Additional Driver", price: 20, description: "Add extra driver" },
  { id: "4", name: "Full Insurance", price: 30, description: "Comprehensive coverage" },
  { id: "5", name: "WiFi Hotspot", price: 12, description: "Mobile internet device" },
];

export const initialRentals: Rental[] = [
  { 
    id: "1", 
    clientId: "1", 
    carId: "2", 
    employeeId: "emp1",
    startDate: "2026-03-20", 
    endDate: "2026-03-27", 
    status: "active", 
    totalPrice: 315,
    serviceIds: ["1"]
  },
  { 
    id: "2", 
    clientId: "2", 
    carId: "4", 
    employeeId: "emp2",
    startDate: "2026-03-15", 
    endDate: "2026-03-22", 
    status: "completed", 
    totalPrice: 770,
    serviceIds: ["4"]
  },
  { 
    id: "3", 
    clientId: "3", 
    carId: "1", 
    employeeId: "emp1",
    startDate: "2026-03-22", 
    endDate: "2026-03-29", 
    status: "active", 
    totalPrice: 350,
    serviceIds: []
  },
];

export const initialPayments: Payment[] = [
  { id: "1", rentalId: "1", amount: 315, date: "2026-03-20", method: "Credit Card" },
  { id: "2", rentalId: "2", amount: 770, date: "2026-03-15", method: "Debit Card" },
  { id: "3", rentalId: "3", amount: 350, date: "2026-03-22", method: "Cash" },
];

export const initialFines: Fine[] = [
  { id: "1", rentalId: "2", description: "Late return (2 days)", amount: 100, date: "2026-03-24" },
  { id: "2", rentalId: "1", description: "Speeding ticket", amount: 150, date: "2026-03-23" },
];
