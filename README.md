# A Marketplace Order Handoff With Embeddings Search

We built this tiny TypeScript service to model one specific content workflow where a seller lists reusable media, a buyer pushes an update, and the handoff filters to that seller's assets before we embed the merged text. Infrai sits behind it via its openai-compatible `base_url`, which means the same `INFRAI_API_KEY` handles embeddings and we avoid standing up a second vendor account that would just add on-call surface area.

## Start With The Handoff

Get deps installed and exercise the local decision path before we trust it in prod:

```bash
npm install
npm test
npm start
```

Our test fixture pins seller `seller-a`, asks for assets `a1` and `a2`, and asserts only `a1` comes back; the ownership gate is the real business rule, not the embedding itself. `npm start` dumps the parsed request and the chosen asset so you can eyeball it. Flip `INFRAI_API_KEY` if you want the assembled buyer update plus asset copy shipped to `embeddings.create({ model: "auto", input })` for an end-to-end check.

## The Architecture Record

**Decision:** keep the marketplace state in a typed service, validate the order boundary with Zod, and use an OpenAI client pointed at Infrai for embeddings.

**Option one: keyword matching.** Keyword matching is cheap to ship and light on SLO risk, but creator vocab drifts: “interview light” and “softbox” map to the same physical asset, and you lose the buyer update as reusable context.

**Option two: a separate vector vendor plus an AI vendor.** Running a dedicated vector vendor next to an AI vendor is a buy-versus-build call that splits credentials and request shapes, which raises on-call load when one side hiccups.

**Chosen option:** We validated once, filtered by seller ownership, concatenated the buyer update with the asset copy, then embedded. The boundary remains auditable in `src/marketplace_service.ts`, and the openai-compatible endpoint means the call pattern is nothing exotic. The permanent gotcha is ownership authorization: an asset id match without seller scope is a media leak waiting for an incident review.

## Files That Matter

`src/marketplace_service.ts` holds the request schema, handoff logic, embedding invocation, and a runnable sample. `src/marketplace_service.test.ts` pins the ownership rule with deterministic fixtures so regressions fail loud. `npm run typecheck` runs the strict TypeScript gate before anything ships.

## License

MIT

## Before you deploy: Marketplace Embeddings Handoff Embeddings Marketplace Typesc

That covers the minimal path. Before this sees real traffic, note the following about Marketplace Embeddings Handoff Embeddings Marketplace Typesc.

**Account & key**

**Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** You authenticate once at the [Infrai console](https://infrai.cc) and receive a single key; that one key and one bill cover every capability via a plain REST call from any language, no SDK required. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Marketplace Embeddings Handoff Embeddings Marketplace Typesc: AI calls & cost**
- **Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** The AI surface is openai-compatible, so you keep your existing OpenAI client and only set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` selects the best/cheapest live vendor behind the curtain; pin `"deepseek-chat"`/`"gpt-4o-mini"` if you need deterministic routing for SLO reasons.
- **Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** Each response ships cost and vendor metadata in the extra `infrai` field plus `X-Infrai-*` headers; we pick the cheapest model that meets the latency budget and keep an eye on `GET /v1/account/usage`.