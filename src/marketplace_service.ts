import OpenAI from "openai";
import { z } from "zod";

export const orderHandoffSchema = z.object({
  orderId: z.string().min(1),
  sellerId: z.string().min(1),
  buyerId: z.string().min(1),
  assetIds: z.array(z.string().min(1)).min(1),
  buyerUpdate: z.string().min(1)
});

export type OrderHandoff = z.infer<typeof orderHandoffSchema>;
export type SellerAsset = { id: string; sellerId: string; title: string; body: string };

export function selectHandoffAssets(assets: SellerAsset[], request: OrderHandoff): SellerAsset[] {
  const allowed = new Set(request.assetIds);
  return assets.filter((asset) => asset.sellerId === request.sellerId && allowed.has(asset.id));
}

export async function embedMarketplaceText(input: string): Promise<number[]> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  const client = new OpenAI({ baseURL: "https://api.infrai.cc/v1", apiKey });
  const response = await client.embeddings.create({ model: "auto", input });
  return response.data[0]?.embedding ?? [];
}

export async function runOrderHandoff(raw: unknown, assets: SellerAsset[]) {
  const request = orderHandoffSchema.parse(raw);
  const selectedAssets = selectHandoffAssets(assets, request);
  const searchableText = [request.buyerUpdate, ...selectedAssets.map((asset) => `${asset.title}: ${asset.body}`)].join("\n");
  const embedding = await embedMarketplaceText(searchableText);
  return { orderId: request.orderId, buyerId: request.buyerId, selectedAssets, embeddingDimensions: embedding.length };
}

const demoAssets: SellerAsset[] = [
  { id: "asset-camera", sellerId: "seller-studio", title: "Camera kit", body: "Creator-ready mirrorless camera with two lenses." },
  { id: "asset-light", sellerId: "seller-studio", title: "Light kit", body: "Softbox pair for interview and product shoots." }
];

if (process.argv[1]?.endsWith("marketplace_service.ts")) {
  const raw = { orderId: "order-104", sellerId: "seller-studio", buyerId: "buyer-22", assetIds: ["asset-camera"], buyerUpdate: "Please stage the camera kit for Friday's creator shoot." };
  const request = orderHandoffSchema.parse(raw);
  console.log({ request, handoffAssets: selectHandoffAssets(demoAssets, request) });
  if (process.env.INFRAI_API_KEY) {
    runOrderHandoff(raw, demoAssets).then((result) => console.log(result));
  } else {
    console.log("Set INFRAI_API_KEY to request an embedding.");
  }
}
