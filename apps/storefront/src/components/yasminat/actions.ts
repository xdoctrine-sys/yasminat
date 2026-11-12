'use server';

import {listOffers} from '@/lib/data/offers';
import {listProducts} from '@/lib/data/products';
import {getBuyboxWinner, rankOffers, getOfferStock, getOfferAmount, type StoreOffer} from '@/lib/helpers/buybox';

/** Resolve the real seller offer on intent; never submit the design's demo IDs. */
export async function resolveQuickOffer(productId: string, countryCode: string) {
  const {offers} = await listOffers({productId, countryCode});
  const winner = getBuyboxWinner(rankOffers(offers as StoreOffer[]));
  if (!winner || getOfferAmount(winner) === null) return null;
  return {id: winner.id, stock: getOfferStock(winner), amount: getOfferAmount(winner)!, currency: winner.calculated_price!.currency_code || 'qar', original: typeof winner.metadata?.yasminat_old_price==='number'&&winner.metadata?.yasminat_preview_batch ? winner.metadata.yasminat_old_price : winner.calculated_price?.original_amount ?? null};
}

export async function favoriteProducts(ids: string[], countryCode: string) {
  const safe = ids.filter(id => typeof id === 'string' && id.length < 160).slice(0, 100);
  if (!safe.length) return [];
  const {response} = await listProducts({countryCode, queryParams: {limit: 100, ...({id: safe} as object)}});
  return response.products;
}
