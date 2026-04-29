const API_BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join(", ");
      } else if (typeof errorBody.message === "string") {
        message = errorBody.message;
      }
    } catch {
      // Keep fallback message when backend response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export function toDateTimeLabel(value: string | null | undefined): string {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
}

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

export type CarStatus = "available" | "rented" | "maintenance" | "cleaning" | "damaged";
export type RentalStatus = "pending" | "active" | "completed" | "cancelled";

export interface ApiCarCategory {
  id: number;
  name: string;
  pricePerDay: string | number;
}

export interface ApiCar {
  id: number;
  brand: string;
  model: string;
  manufactureYear: number;
  mileage: number;
  status: CarStatus;
  categoryId: number;
  category?: ApiCarCategory;
}

export interface ApiClient {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  documentNumber: string | null;
}

export interface ApiPayment {
  id: number;
  rentalId: number;
  amount: string | number;
  paymentDate: string | null;
  rental?: ApiRental;
}

export interface ApiRole {
  id: number;
  name: string;
}

export interface ApiEmployee {
  id: number;
  firstName: string;
  lastName: string;
  roleId: number;
  login: string;
  passwordHash: string;
  role?: ApiRole;
}

export interface ApiService {
  id: number;
  name: string;
  price: string | number;
}

export interface ApiRentalService {
  rentalId: number;
  serviceId: number;
  service?: ApiService;
}

export interface ApiRental {
  id: number;
  clientId: number;
  carId: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  startMileage: number | null;
  endMileage: number | null;
  totalPrice: string | number | null;
  status: string;
  client?: ApiClient;
  car?: ApiCar;
  employee?: ApiEmployee;
  rentalServices?: ApiRentalService[];
}

export interface ApiFine {
  id: number;
  rentalId: number;
  description: string | null;
  amount: string | number;
  rental?: ApiRental;
}

export const categoriesApi = {
  list: () => request<ApiCarCategory[]>("/car-categories"),
};

export const carsApi = {
  list: () => request<ApiCar[]>("/cars"),
  create: (data: {
    brand: string;
    model: string;
    manufactureYear: number;
    mileage: number;
    status: CarStatus;
    categoryId: number;
  }) =>
    request<ApiCar>("/cars", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: number,
    data: Partial<{
      brand: string;
      model: string;
      manufactureYear: number;
      mileage: number;
      status: CarStatus;
      categoryId: number;
    }>,
  ) =>
    request<ApiCar>(`/cars/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<ApiCar>(`/cars/${id}`, {
      method: "DELETE",
    }),
};

export const clientsApi = {
  list: () => request<ApiClient[]>("/clients"),
  create: (data: {
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
    documentNumber?: string | null;
  }) =>
    request<ApiClient>("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: number,
    data: Partial<{
      firstName: string;
      lastName: string;
      phone?: string | null;
      email?: string | null;
      documentNumber?: string | null;
    }>,
  ) =>
    request<ApiClient>(`/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<ApiClient>(`/clients/${id}`, {
      method: "DELETE",
    }),
};

export const employeesApi = {
  list: () => request<ApiEmployee[]>("/employees"),
};

export const rentalsApi = {
  list: () => request<ApiRental[]>("/rentals"),
  get: (id: number) => request<ApiRental>(`/rentals/${id}`),
  create: (data: {
    clientId: number;
    carId: number;
    employeeId: number;
    startDate: string;
    endDate: string;
    startMileage?: number;
    endMileage?: number;
    status?: RentalStatus;
    serviceIds?: number[];
  }) =>
    request<ApiRental>("/rentals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const paymentsApi = {
  list: () => request<ApiPayment[]>("/payments"),
  create: (data: { rentalId: number; amount: number; paymentDate?: string }) =>
    request<ApiPayment>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<ApiPayment>(`/payments/${id}`, {
      method: "DELETE",
    }),
};

export const servicesApi = {
  list: () => request<ApiService[]>("/services"),
  create: (data: { name: string; price: number }) =>
    request<ApiService>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<{ name: string; price: number }>) =>
    request<ApiService>(`/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<ApiService>(`/services/${id}`, {
      method: "DELETE",
    }),
};

export const finesApi = {
  list: () => request<ApiFine[]>("/fines"),
  create: (data: { rentalId: number; description?: string; amount: number }) =>
    request<ApiFine>("/fines", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<ApiFine>(`/fines/${id}`, {
      method: "DELETE",
    }),
};
