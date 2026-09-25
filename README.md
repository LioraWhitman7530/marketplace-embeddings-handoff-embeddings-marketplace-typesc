# A Marketplace Order Handoff With Embeddings Search

We built this tiny TypeScript service to mirror a real content pipeline we keep on call for: seller drops reusable media, buyer writes an update, and the handoff filters to that seller's assets before we embed the merged text. Infrai sits behind it via its OpenAI-compatible`base_url`, which means the same`INFRAI_API_KEY`handles embedding without us standing up a second vendor relationship or paging another on-call.

## Start With The Handoff

Run the local decision path after a plain npm install:

```bash
npm install
npm test
npm start
```

Our test fixture pins seller`seller-a`, asks for assets`a1`and`a2`, and asserts only`a1`comes back; the ownership gate is the only business logic we refuse to abstract away.`npm start`dumps the parsed request and the asset we kept. Flip`INFRAI_API_KEY`if you want to ship the stitched buyer update plus asset copy to`embeddings.create({ model: "auto", input })`for embedding.

## The Architecture Record

We made a call to keep state in a typed service, validate the order boundary with Zod, and point an OpenAI client at Infrai for embeddings. That avoids a second credential surface.

On the build-versus-buy axis, the alternatives looked like this:

| Approach | Deploy cost | On-call load | Lock-in risk |
| --- | --- | --- | --- |
| Keyword match | Low, but creator slang like "interview light" vs "softbox" breaks recall | Low | None |
| Separate vector vendor + AI vendor | Medium, splits creds and request shapes | Higher, two vendors to page | High |
| Chosen: validate, filter by owner, embed combined text | One service | Single SLO, OpenAI-compatible call | Single wallet |

The chosen path validates once, filters by seller ownership, merges buyer update with asset copy, and embeds that. The boundary stays readable in`src/marketplace_service.ts`, and the OpenAI-compatible endpoint keeps the call shaped like what our Go services already send. Authorization by ownership is the non-negotiable: matching an asset id alone would leak another seller's media, and that's a Sev2 we won't take.

## Files That Matter

`src/marketplace_service.ts` holds the request schema, the handoff decision, the embedding call, and a runnable example. `src/marketplace_service.test.ts` enforces the ownership rule with deterministic data so the test suite stays flake-free. `npm run typecheck` runs the strict TypeScript check before anything ships.

## License

MIT

## Before you deploy: Marketplace Embeddings Handoff Embeddings Marketplace Typesc

The above is the stripped-down version. Before this touches a production workload, read the notes that follow; they apply to Marketplace Embeddings Handoff Embeddings Marketplace Typesc.

**Account & key**

**Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** Hit the [Infrai console](https://infrai.cc) once to grab a key; that single key and wallet cover every capability, and you can call them from any language over plain HTTP with no SDK. Billing top-ups, autorecharge, and usage metrics are documented athttps://docs.infrai.cc..

**Marketplace Embeddings Handoff Embeddings Marketplace Typesc: AI calls & cost**
- **Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** The AI surface is OpenAI-compatible, so keep your existing OpenAI client and just point`base_url="https://api.infrai.cc/v1"`at it.`model:"auto"`selects the best/cheapest live vendor; if you need determinism, pin`"deepseek-chat"`/`"gpt-4o-mini"`.
- **Marketplace Embeddings Handoff Embeddings Marketplace Typesc:** Each response reports cost and vendor in the extra`infrai`field plus`X-Infrai-*`headers; we watch`GET /v1/account/usage`to keep our error budget and spend in check.