import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDb, getFns } from "./client";
import { friendlyError } from "./errors";
import type { ReceiptDoc } from "./types";

const receiptsCol = () => collection(getDb(), "receipts");

export function subscribeStudentReceipts(
  studentId: string,
  onData: (receipts: ReceiptDoc[]) => void,
  onError: (message: string) => void,
) {
  return onSnapshot(
    query(
      receiptsCol(),
      where("studentId", "==", studentId),
      orderBy("createdAt", "desc"),
      limit(50),
    ),
    (snap) => onData(snap.docs.map((d) => d.data() as ReceiptDoc)),
    (err) => onError(friendlyError(err, "Unable to load your receipts.")),
  );
}

export function subscribeShopReceipts(
  shopId: string,
  onData: (receipts: ReceiptDoc[]) => void,
  onError: (message: string) => void,
) {
  return onSnapshot(
    query(receiptsCol(), where("shopId", "==", shopId), orderBy("createdAt", "desc"), limit(100)),
    (snap) => onData(snap.docs.map((d) => d.data() as ReceiptDoc)),
    (err) => onError(friendlyError(err, "Unable to load receipts.")),
  );
}

/**
 * One-time redemption.
 *
 * The swipe is only a gesture — this callable is the security boundary. It runs
 * an atomic transaction server-side, so two simultaneous swipes can never both
 * succeed and a redeemed receipt can never return to ACTIVE.
 */
export async function redeemReceipt(receiptId: string): Promise<{ redeemedAt: string }> {
  try {
    const call = httpsCallable<{ receiptId: string }, { redeemedAt: string }>(
      getFns(),
      "redeemReceipt",
    );
    const res = await call({ receiptId });
    return res.data;
  } catch (err) {
    const code = String((err as { code?: string })?.code ?? "");
    if (code.includes("failed-precondition")) throw new Error("Receipt already used.");
    throw new Error(friendlyError(err, "We couldn't confirm this pickup."));
  }
}
