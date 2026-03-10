import { itemCards } from '../game/content/items';

export function MerchantScreen({ gold, onBuy, onLeave }: { gold: number; onBuy: (itemId: string) => void; onLeave: () => void }) {
  const offers = ['grappling_hook', 'vial_of_faith', 'splinter_bomb'].map((id) => itemCards[id]);
  return (
    <section className="panel">
      <h2>Merchant</h2>
      <p>Gold: {gold}</p>
      {offers.map((item) => (
        <div key={item.id} className="merchant-item">
          <strong>{item.name}</strong> ({item.price}g) - {item.description}
          <button onClick={() => onBuy(item.id)} disabled={gold < (item.price ?? 0)}>Buy</button>
        </div>
      ))}
      <button onClick={onLeave}>Continue</button>
    </section>
  );
}
