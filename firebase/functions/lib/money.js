/**
 * Authoritative money maths. Nothing here ever reads a client-supplied amount.
 *
 * Values are kept apart on purpose so the platform can always answer:
 *  - how much the customer paid          (customerAmount)
 *  - how much DigitalFoodStreet earned   (platformCommission)
 *  - how much belongs to the shop        (shopGrossAmount / shopNetAmount)
 *  - what the gateway charged            (cashfreeCharges)
 *  - what was refunded                   (refundAmount)
 */
export const DEFAULT_COMMISSION = {
    mode: "PERCENTAGE",
    value: 1,
    gatewayChargesBorneBy: "PLATFORM",
    discountRate: 0,
};
export const round2 = (n) => Math.round(n * 100) / 100;
export function commissionFor(amount, config) {
    const raw = config.mode === "FIXED" ? config.value : (amount * config.value) / 100;
    return round2(Math.min(amount, Math.max(0, raw)));
}
export function computeAmounts(subtotal, config) {
    const discount = round2(subtotal * (config.discountRate ?? 0));
    const customerAmount = round2(subtotal - discount);
    const platformCommission = commissionFor(customerAmount, config);
    // Gateway charges are only known once Cashfree settles; they start at 0 and
    // are filled in from settlement data, never guessed at checkout time.
    const cashfreeCharges = 0;
    const shopGrossAmount = round2(customerAmount - platformCommission);
    return {
        subtotal: round2(subtotal),
        discount,
        customerAmount,
        platformCommission,
        cashfreeCharges,
        shopGrossAmount,
        shopNetAmount: shopGrossAmount,
        refundAmount: 0,
    };
}
/** Human-readable, collision-free receipt number: FS-4821 style. */
export function receiptNumber(sequence) {
    return `FS-${String(sequence).padStart(4, "0")}`;
}
