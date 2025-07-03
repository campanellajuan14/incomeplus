import { Property } from './property';

// Saved Properties
export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  notes?: string;
  property?: Property;
}

// Saved Searches
export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  search_criteria: SearchCriteria;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchCriteria {
  location?: {
    city?: string;
    province?: string;
    postal_code?: string;
  };
  price_range?: {
    min?: number;
    max?: number;
  };
  property_type?: string[];
  bedrooms?: {
    min?: number;
    max?: number;
  };
  bathrooms?: {
    min?: number;
    max?: number;
  };
  keywords?: string;
  [key: string]: any;
}

// Property Inquiries
export interface PropertyInquiry {
  id: string;
  user_id: string;
  property_id: string;
  agent_email: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
  property?: Property;
  messages?: Message[];
}

// Messages
export interface Message {
  id: string;
  inquiry_id: string;
  sender_id: string;
  message: string;
  is_from_agent: boolean;
  created_at: string;
  read_at?: string;
}

// User Activity
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data?: any;
  created_at: string;
}

export type ActivityType = 
  | 'property_viewed' 
  | 'property_saved' 
  | 'search_performed' 
  | 'inquiry_sent' 
  | 'message_sent'
  | 'profile_updated'
  | 'property_uploaded'
  | 'property_updated';

// User Profile
export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  bio?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  created_at: string;
  updated_at: string;
}

// Property Expenses
export interface PropertyExpense {
  id: string;
  property_id: string;
  user_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// Property Income
export interface PropertyIncome {
  id: string;
  property_id: string;
  user_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// Notification Settings
export interface NotificationSettings {
  id: string;
  user_id: string;
  email_new_properties: boolean;
  email_price_changes: boolean;
  email_inquiry_responses: boolean;
  email_weekly_digest: boolean;
  sms_urgent_updates: boolean;
  created_at: string;
  updated_at: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalProperties: number;
  savedProperties: number;
  activeInquiries: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  propertiesViewed: number;
  searchesPerformed: number;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Financial Analytics Types
export interface FinancialMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  totalROI: number;
  occupancyRate: number;
  averageRent: number;
}

export interface PropertyPerformance {
  property_id: string;
  property_title: string;
  address: string;
  monthly_income: number;
  monthly_expenses: number;
  net_cash_flow: number;
  roi_percentage: number;
  occupancy_rate: number;
}

// Dashboard Navigation Types
export type DashboardTab = 
  | 'overview'
  | 'properties'
  | 'saved'
  | 'analytics'
  | 'messages'
  | 'activity'
  | 'settings';

export interface DashboardTabConfig {
  id: DashboardTab;
  label: string;
  icon: string;
}

// Form Types
export interface SavePropertyForm {
  property_id: string;
  notes?: string;
}

export interface SaveSearchForm {
  name: string;
  search_criteria: SearchCriteria;
  email_notifications: boolean;
}

export interface InquiryForm {
  property_id: string;
  agent_email: string;
  subject: string;
  message: string;
}

export interface ExpenseForm {
  property_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

export interface IncomeForm {
  property_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

export interface ProfileForm {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  bio?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
}

// API Response Types
export interface DashboardResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Filter and Sort Types
export interface ActivityFilter {
  activity_type?: ActivityType[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface MessageFilter {
  status?: 'unread' | 'read' | 'all';
  date_range?: {
    start: string;
    end: string;
  };
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
} 