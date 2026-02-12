export interface Property {
    id: string;
    url: string;
    status: string;
    price: number;
    beds: number;
    baths_full: number;
    baths_half: number;
    sqft: number;
    year_built: number | null;
    lot_sqft: number;
    style: string;
    property_type: string;
    description: string;
    street: string;
    unit: string;
    city: string;
    state: string;
    zip_code: string;
    formatted_address: string;
    latitude: number | null;
    longitude: number | null;
    primary_photo: string;
    photos: string[];
    agent_name: string;
    agent_phone: string;
    agent_email: string;
    days_on_mls: number;
    price_per_sqft: number;
    hoa_fee: number;
    list_date: string;
    neighborhoods: string;
    stories: number;
    garage: number;
}

export interface OwnerInfo {
    name: string;
    type: "LLC" | "Individual" | "Trust" | "Corporation";
    email: string;
    phone: string;
    mailingAddress: string;
    acquisitionDate: string;
    acquisitionPrice: number;
    estimatedEquity: number;
    linkedProperties: number;
    riskScore: "Low" | "Medium" | "High";
}

export interface DashboardStats {
    totalProperties: number;
    avgPrice: number;
    medianPrice: number;
    opportunities: number; // properties below market (price_per_sqft < avg)
    avgDaysOnMarket: number;
    totalValue: number;
}
