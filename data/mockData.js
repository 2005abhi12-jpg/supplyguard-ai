// Mock data for SupplyGuard AI — Supply Chain Dashboard

export const suppliers = [
  { id: "S001", name: "Tata Steel Ltd", city: "Mumbai", lat: 19.076, lng: 72.8777, status: "normal", reliability_score: 92 },
  { id: "S002", name: "Bharat Electronics", city: "Delhi", lat: 28.7041, lng: 77.1025, status: "at_risk", reliability_score: 74 },
  { id: "S003", name: "Bajaj Auto Parts", city: "Pune", lat: 18.5204, lng: 73.8567, status: "normal", reliability_score: 88 },
  { id: "S004", name: "Ashok Leyland Components", city: "Chennai", lat: 13.0827, lng: 80.2707, status: "disrupted", reliability_score: 45 },
  { id: "S005", name: "Wipro Infrastructure", city: "Bangalore", lat: 12.9716, lng: 77.5946, status: "normal", reliability_score: 95 },
  { id: "S006", name: "Hetero Pharma", city: "Hyderabad", lat: 17.885, lng: 78.0867, status: "at_risk", reliability_score: 68 },
  { id: "S007", name: "ITC Packaging", city: "Kolkata", lat: 22.5726, lng: 88.3639, status: "normal", reliability_score: 85 },
  { id: "S008", name: "Adani Ports Materials", city: "Ahmedabad", lat: 23.0225, lng: 72.5714, status: "disrupted", reliability_score: 38 },
];

export const warehouses = [
  { id: "W001", name: "Central Hub Mumbai", city: "Mumbai", lat: 19.076, lng: 72.8777, status: "normal", reliability_score: 96 },
  { id: "W002", name: "North India DC", city: "Delhi", lat: 28.2041, lng: 77.6025, status: "normal", reliability_score: 91 },
  { id: "W003", name: "South Zone Warehouse", city: "Chennai", lat: 13.5, lng: 79.8, status: "at_risk", reliability_score: 72 },
  { id: "W004", name: "East Region Hub", city: "Kolkata", lat: 22.5726, lng: 88.3639, status: "normal", reliability_score: 89 },
];

export const retailers = [
  { id: "R001", name: "Reliance Retail Outlet", city: "Bangalore", lat: 12.9716, lng: 77.5946, status: "normal", reliability_score: 94 },
  { id: "R002", name: "DMart Hypermarket", city: "Pune", lat: 18.5204, lng: 73.8567, status: "normal", reliability_score: 90 },
  { id: "R003", name: "BigBasket Fulfillment", city: "Hyderabad", lat: 17.385, lng: 78.4867, status: "at_risk", reliability_score: 76 },
];

export const routes = [
  { id: "RT001", from: "Tata Steel Ltd", to: "Central Hub Mumbai", from_lat: 19.076, from_lng: 72.8777, to_lat: 19.076, to_lng: 72.8777, risk_score: 12, status: "normal", distance_km: 45, base_eta_hours: 6 },
  { id: "RT002", from: "Bharat Electronics", to: "North India DC", from_lat: 28.7041, from_lng: 77.1025, to_lat: 28.7041, to_lng: 77.1025, risk_score: 65, status: "at_risk", distance_km: 120, base_eta_hours: 12 },
  { id: "RT003", from: "Bajaj Auto Parts", to: "Central Hub Mumbai", from_lat: 18.5204, from_lng: 73.8567, to_lat: 19.076, to_lng: 72.8777, risk_score: 22, status: "normal", distance_km: 150, base_eta_hours: 8 },
  { id: "RT004", from: "Ashok Leyland Components", to: "South Zone Warehouse", from_lat: 13.0827, from_lng: 80.2707, to_lat: 13.0827, to_lng: 80.2707, risk_score: 88, status: "disrupted", distance_km: 30, base_eta_hours: 4 },
  { id: "RT005", from: "Central Hub Mumbai", to: "BigBasket Fulfillment", from_lat: 19.076, from_lng: 72.8777, to_lat: 17.385, to_lng: 78.4867, risk_score: 35, status: "normal", distance_km: 710, base_eta_hours: 14 },
  { id: "RT006", from: "North India DC", to: "DMart Hypermarket", from_lat: 28.2041, from_lng: 77.6025, to_lat: 18.5204, to_lng: 73.8567, risk_score: 48, status: "at_risk", distance_km: 1400, base_eta_hours: 36 },
  { id: "RT007", from: "Wipro Infrastructure", to: "South Zone Warehouse", from_lat: 12.9716, from_lng: 77.5946, to_lat: 13.0827, to_lng: 80.2707, risk_score: 18, status: "normal", distance_km: 350, base_eta_hours: 10 },
  { id: "RT008", from: "ITC Packaging", to: "East Region Hub", from_lat: 22.5726, from_lng: 88.3639, to_lat: 22.5726, to_lng: 88.3639, risk_score: 25, status: "normal", distance_km: 55, base_eta_hours: 5 },
  { id: "RT009", from: "Adani Ports Materials", to: "Central Hub Mumbai", from_lat: 23.0225, from_lng: 72.5714, to_lat: 19.076, to_lng: 72.8777, risk_score: 92, status: "disrupted", distance_km: 525, base_eta_hours: 18 },
  { id: "RT010", from: "East Region Hub", to: "Reliance Retail Outlet", from_lat: 22.5726, from_lng: 88.3639, to_lat: 12.9716, to_lng: 77.5946, risk_score: 55, status: "at_risk", distance_km: 1850, base_eta_hours: 48 },
];

// Aggregated KPI data for the dashboard
export const kpiData = {
  totalSuppliers: suppliers.length,
  atRiskSuppliers: suppliers.filter(s => s.status === "at_risk").length,
  disruptedSuppliers: suppliers.filter(s => s.status === "disrupted").length,
  avgReliability: Math.round(suppliers.reduce((sum, s) => sum + s.reliability_score, 0) / suppliers.length),
  totalRoutes: routes.length,
  highRiskRoutes: routes.filter(r => r.risk_score > 60).length,
  totalWarehouses: warehouses.length,
  totalRetailers: retailers.length,
};

// Monthly trend data for charts
export const monthlyTrends = [
  { month: "Sep", disruptions: 2, avgRisk: 32, onTime: 94 },
  { month: "Oct", disruptions: 3, avgRisk: 38, onTime: 89 },
  { month: "Nov", disruptions: 1, avgRisk: 28, onTime: 96 },
  { month: "Dec", disruptions: 5, avgRisk: 52, onTime: 78 },
  { month: "Jan", disruptions: 4, avgRisk: 46, onTime: 82 },
  { month: "Feb", disruptions: 3, avgRisk: 41, onTime: 87 },
  { month: "Mar", disruptions: 2, avgRisk: 35, onTime: 91 },
  { month: "Apr", disruptions: 3, avgRisk: 44, onTime: 85 },
];
