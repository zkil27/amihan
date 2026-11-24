const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 2 });
const pesoExact = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 });
const int = new Intl.NumberFormat('en-PH');

/** ₱1,250 (drops .00) */
export const php = (n: number | null | undefined) => (n == null ? '' : peso.format(n));
/** ₱1,250.00 */
export const phpExact = (n: number | null | undefined) => (n == null ? '' : pesoExact.format(n));
export const masl = (n: number | null | undefined) => (n == null ? '' : `${int.format(n)} MASL`);
export const num = (n: number) => int.format(n);

export const date = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const dateTime = (iso: string | null | undefined) =>
    iso
        ? new Date(iso).toLocaleString('en-PH', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
        : '';

export const STATUS_LABEL: Record<string, string> = {
    pending: 'Received',
    confirmed: 'Confirmed',
    packed: 'Packed',
    shipped: 'On the way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
    requested: 'Requested',
    approved: 'Approved',
    rejected: 'Declined',
    completed: 'Completed',
    assigned: 'Assigned',
    in_transit: 'In transit',
    paid: 'Paid',
    refunded: 'Refunded',
    failed: 'Failed',
    draft: 'Draft',
    active: 'Active',
    archived: 'Archived',
    deleted: 'Deleted',
};

export const statusLabel = (s: string) => STATUS_LABEL[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
