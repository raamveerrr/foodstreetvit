# DigitalFoodStreet — Firebase backend

Everything in this folder is deployed with the Firebase CLI from your machine
(Lovable cannot deploy Firebase for you).

```bash
cd firebase
npm --prefix functions install
firebase login
firebase use digitalfoodstreet

# security rules + indexes
firebase deploy --only firestore:rules,firestore:indexes

# cloud functions
firebase deploy --only functions
```

## Secrets (never in the frontend)

```bash
firebase functions:secrets:set CASHFREE_APP_ID
firebase functions:secrets:set CASHFREE_SECRET_KEY
firebase functions:secrets:set CASHFREE_WEBHOOK_SECRET
# optional: CASHFREE_ENV=production
```

Set the webhook URL in the Cashfree dashboard to the deployed
`cashfreeWebhook` HTTPS function URL.

## What each function guarantees

| Function | Guarantee |
| --- | --- |
| `createPaymentSession` | Builds a Cashfree Easy Split order: shop amount → shop's vendor, commission → platform. |
| `confirmPayment` | Re-checks payment status with Cashfree, then issues the order's single receipt. |
| `cashfreeWebhook` | Signature-verified authoritative payment signal; idempotent with `confirmPayment`. |
| `redeemReceipt` | Atomic one-time pickup: a receipt can never be redeemed twice. |
| `connectShopPayouts` | Registers a shop as a Cashfree vendor; only the owner may call it. |

## Rules summary

- Students read/write only their own orders; they can only create
  `PENDING_PAYMENT` orders with no receipt.
- Shop owners write only shops they own and those shops' menus; they can move an
  order's fulfilment status but cannot touch money fields.
- Receipts are read-only for clients — issued and redeemed by functions only.
- Images are never stored in Firestore; only Cloudinary URLs and public IDs.
