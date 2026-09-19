import assert from "node:assert/strict";
import { selectHandoffAssets, orderHandoffSchema, type SellerAsset } from "./marketplace_service.js";

const assets: SellerAsset[] = [
  { id: "a1", sellerId: "seller-a", title: "Storyboard pack", body: "Six reusable frames." },
  { id: "a2", sellerId: "seller-b", title: "Audio kit", body: "Two microphones." }
];
const request = orderHandoffSchema.parse({ orderId: "o1", sellerId: "seller-a", buyerId: "b1", assetIds: ["a1", "a2"], buyerUpdate: "Need the storyboard pack." });
assert.deepEqual(selectHandoffAssets(assets, request).map((asset) => asset.id), ["a1"]);
console.log("handoff decision test passed");
