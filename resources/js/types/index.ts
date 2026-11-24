import { LucideIcon } from 'lucide-react';

export type Role = 'customer' | 'admin' | 'staff' | 'fulfillment' | 'courier';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: Role;
    avatar?: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface Can {
    catalog: boolean;
    orders: boolean;
    returns: boolean;
    reports: boolean;
    customers: boolean;
    employees: boolean;
}

export interface Auth {
    user: User;
    can?: Can | null;
}

export interface CartLine {
    id: number;
    variant_id: number;
    product_name: string;
    product_slug: string;
    variant_name: string;
    origin: string | null;
    elevation_masl: number | null;
    image: string | null;
    price: number;
    qty: number;
    stock: number;
    line_total: number;
}

export interface CartSummary {
    lines: CartLine[];
    count: number;
    subtotal: number;
    coupon: { code: string; label: string } | null;
    discount: number;
    delivery_fee: number;
    free_delivery_over: number;
    total: number;
}

export interface Toast {
    type: 'success' | 'error' | 'info';
    message: string;
}

export interface SharedData {
    name: string;
    auth: { user: User | null; can: Can | null };
    cart: CartSummary | null;
    flash: { toast: Toast | null; added: { variant_id: number; name: string; at: number } | null };
    errors: Record<string, string>;
    [key: string]: unknown;
}

export interface ProductCard {
    id: number;
    name: string;
    slug: string;
    subtitle: string | null;
    origin: string | null;
    elevation_masl: number | null;
    category: string | null;
    image: string | null;
    price_from: number | null;
    has_range: boolean;
    in_stock: boolean;
}

export interface ProductDetail extends ProductCard {
    process: string | null;
    tasting_notes: string | null;
    story: string | null;
    brew_guide: string | null;
    images: { id: number; url: string; alt: string | null }[];
    variants: { id: number; name: string; price: number; stock: number; low: boolean }[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderSummary {
    order_no: string;
    status: OrderStatus;
    total: number;
    placed_at: string;
    item_count: number;
    first_item: string | null;
}

export interface OrderDetail extends OrderSummary {
    subtotal: number;
    discount: number;
    delivery_fee: number;
    delivery_window: string | null;
    gift_note: string | null;
    billing: { name: string; email: string; phone: string };
    shipping: { recipient: string; phone: string; line1: string; barangay: string; city: string; province: string; postal_code: string };
    customer: { id: number; name: string; email: string } | null;
    items: { id: number; product_name: string; variant_name: string; unit_price: number; qty: number; line_total: number }[];
    history: { id: number; status: string; note: string | null; at: string; by: string | null }[];
    payment: { method: 'card' | 'gcash' | 'cod'; status: string; ref: string | null; last4: string | null; amount: number } | null;
    shipment: { id: number; tracking_no: string; status: string; courier: string | null; shipped_at: string | null; delivered_at: string | null } | null;
    requests: {
        id: number;
        type: 'cancellation' | 'return';
        reason: string;
        details: string | null;
        status: 'requested' | 'approved' | 'rejected' | 'completed';
        admin_note: string | null;
        created_at: string;
        refund: { amount: number; ref: string } | null;
    }[];
    can_cancel: boolean;
    can_return: boolean;
}

/* Kept for the starter kit's settings pages. */
export interface BreadcrumbItem {
    title: string;
    href: string;
}
export interface NavGroup {
    title: string;
    items: NavItem[];
}
export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}
