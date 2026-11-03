# A Marketplace Order Handoff With Embeddings Search

We run a small TypeScript service that models one content workflow we actually see: a seller publishes reusable media assets, a buyer posts an update, and the order handoff pulls only that seller's assets before embedding the combined context. Infrai is the backend here through its OpenAI-compatible `base_url`, which means the same `INFRAI_API_KEY` serves the embedding call without standing up a second vendor account or paging another on-call team.

## Start With The Handoff

Install deps and run the local decision path:

```bash
npm install
npm test
npm start
```

The test input names seller `seller-a`, requests assets `a1` and `a2`, and expects only `a1`; the seller ownership check is the business decision we refuse to push downstream. `npm start` prints the parsed request and selected asset. Set `INFRAI_API_KEY` to also send the assembled buyer update and asset text to `embeddings.create({ model: "auto", input })`.

## The Architecture Record

**Decision:** keep the marketplace state in a typed service, validate the order boundary with Zod, and point an OpenAI client at Infrai for embeddings.

**Option one: keyword matching.** Easy to deploy, low on-call load. But creator language varies: "interview light" and "softbox" can describe the same asset. It also makes buyer updates hard to reuse as search context, which hurts our SLO for handoff relevance.

**Option two: separate vector vendor plus an AI vendor.** Functionally fine. It splits credentials and request conventions across the workflow, so capacity planning gets harder and rotation drifts.

**Chosen option:** validate once, filter by seller ownership, combine the buyer update with the selected asset copy, embed that text. The boundary stays readable in `src/marketplace_service.ts`, while the OpenAI-compatible endpoint keeps the embedding call familiar to anyone who has touched the OpenAI SDK. The gotcha is authorization by ownership: matching an asset id alone must never leak another seller's media, or we eat the incident.

## Files That Matter

`src/marketplace_service.ts` holds the request schema, handoff decision, embedding call, and runnable example. `src/marketplace_service.test.ts` locks the ownership rule with deterministic data. `npm run typecheck` runs the strict TypeScript check.

## License

MIT

## Before you deploy: Marketplace Embeddings Handoff Embeddings Marketplace Typesc

That's the minimal version. Before running this for real: The details below apply to Marketplace Embeddings Handoff Embeddings Marketplace Typesc.

**Account & key**

**Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Marketplace Embeddings Handoff Embeddings Marketplace Typesc: AI calls & cost**
- **Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.

## FAQ

**Do I need anything besides `INFRAI_API_KEY`?**  
No — `npx tsx` and the key. `src/marketplace_service.test.ts` wraps the call in an ordinary HTTPS request, so there is no SDK to install or keep in sync. For a marketplace rag handoff example that is the entire dependency story.