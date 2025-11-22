<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Upgrade } from '../types';
  import { formatNumber } from '../utils/format';

  export let codingPoints: number = 0;
  export let upgrades: Upgrade[] = [];
  export let costMultiplier: number = 1;

  const dispatch = createEventDispatcher();

  let buyAmount: 1 | 10 | -1 = 1; // -1 represents MAX
  let expandedCategories: Record<string, boolean> = {
    'Hardware': true,
    'Software': true,
    'Personnel': true,
    'Buff': true
  };

  // Group upgrades by category
  $: groupedUpgrades = upgrades.reduce((acc, upgrade) => {
    const category = upgrade.category || 'Misc';
    if (!acc[category]) acc[category] = [];
    acc[category].push(upgrade);
    return acc;
  }, {} as Record<string, Upgrade[]>);

  function toggleCategory(category: string) {
    expandedCategories[category] = !expandedCategories[category];
  }

  // Helper functions using geometric series formulas
  function getPrice(basePrice: number, level: number): number {
    return basePrice * Math.pow(1.5, level) * costMultiplier;
  }

  function getSumPrice(basePrice: number, level: number, count: number): number {
    // We need to apply multiplier to the base price for the current level
    const currentBasePrice = basePrice * Math.pow(1.5, level) * costMultiplier;
    
    if (count === 1) return currentBasePrice;
    
    // Geometric series sum: a * (r^n - 1) / (r - 1)
    // where a = currentBasePrice, r = 1.5, n = count
    return currentBasePrice * (Math.pow(1.5, count) - 1) / (1.5 - 1);
  }

  function getMaxBuyable(basePrice: number, level: number, currentPoints: number): number {
    const currentBasePrice = basePrice * Math.pow(1.5, level) * costMultiplier;
    
    if (currentPoints < currentBasePrice) return 0;
    
    // Inverse formula: n = log_r( (Sum * (r-1) / a) + 1 )
    return Math.floor(Math.log(1 + (currentPoints * (1.5 - 1)) / currentBasePrice) / Math.log(1.5));
  }

  // Reactive calculation for all items
  $: calculatedItems = Object.entries(groupedUpgrades).reduce((acc, [category, items]) => {
    acc[category] = items.map(item => {
      let count = 0;
      let cost = 0;
      
      // Use the level from the upgrades prop, fallback to item.level if not found (though upgrades should be the source of truth)
      // The 'upgrades' prop is the array of current upgrade states.
      // We need to find the specific upgrade object in the 'upgrades' array that matches 'item.id'.
      // However, 'items' here comes from 'groupedUpgrades' which is derived from 'upgrades'.
      // So 'item' IS the current upgrade state.
      const currentLevel = item.level; 

      if (buyAmount === -1) { // MAX mode
        count = getMaxBuyable(item.basePrice, currentLevel, codingPoints);
        // If count is 0, we might want to show the cost for 1 item but disable it, 
        // or show 0 cost. Let's show cost for next 1 item if count is 0 so user knows how much they need.
        if (count > 0) {
          cost = getSumPrice(item.basePrice, currentLevel, count);
        } else {
          cost = getPrice(item.basePrice, currentLevel);
        }
      } else { // x1, x10 mode
        count = buyAmount;
        cost = getSumPrice(item.basePrice, currentLevel, count);
      }

      return { 
        ...item, 
        buyCount: count, 
        currentCost: Math.floor(cost) 
      };
    });
    return acc;
  }, {} as Record<string, (Upgrade & { buyCount: number, currentCost: number })[]>);

  function buyUpgrade(upgrade: Upgrade & { buyCount: number, currentCost: number }) {
    if (upgrade.buyCount > 0 && codingPoints >= upgrade.currentCost) {
      dispatch('buy', { 
        index: upgrades.findIndex(u => u.id === upgrade.id),
        price: upgrade.currentCost,
        type: upgrade.type, 
        effectValue: upgrade.effectValue * upgrade.buyCount,
        amount: upgrade.buyCount
      });
    }
  }
</script>

<div class="shop-container">
  <div class="header">
    <h2>Upgrade Shop</h2>
    <div class="buy-controls">
      <button class:active={buyAmount === 1} on:click={() => buyAmount = 1}>x1</button>
      <button class:active={buyAmount === 10} on:click={() => buyAmount = 10}>x10</button>
      <button class:active={buyAmount === -1} on:click={() => buyAmount = -1}>MAX</button>
    </div>
  </div>
  
  <div class="upgrade-list">
    {#each Object.entries(calculatedItems) as [category, items]}
      <div class="category-section">
        <button class="category-header" on:click={() => toggleCategory(category)}>
          <span class="arrow">{expandedCategories[category] ? '▼' : '▶'}</span>
          {category}
        </button>
        
        {#if expandedCategories[category]}
          <div class="category-items">
            {#each items as upgrade}
              {@const canBuy = (buyAmount === -1 ? upgrade.buyCount > 0 : true) && codingPoints >= upgrade.currentCost}
              
              <div class="upgrade-item">
                <div class="info">
                  <h3>{upgrade.name}</h3>
                  <div class="details">
                    <span class="level">Lv. {upgrade.level}</span>
                    <span class="effect">{upgrade.description}</span>
                  </div>
                </div>
                <button 
                  class="buy-btn" 
                  on:click={() => buyUpgrade(upgrade)} 
                  disabled={!canBuy}
                >
                  {#if buyAmount === -1}
                    Buy Max ({upgrade.buyCount})<br>
                    {formatNumber(upgrade.currentCost)} pts
                  {:else}
                    Buy x{buyAmount}<br>
                    {formatNumber(upgrade.currentCost)} pts
                  {/if}
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .shop-container {
    background-color: #252526;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    padding: 15px;
    background-color: #2d2d2d;
    border-bottom: 1px solid #3e3e42;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 {
    margin: 0;
    color: #fff;
    font-size: 1.2rem;
  }

  .buy-controls {
    display: flex;
    gap: 5px;
  }

  .buy-controls button {
    background-color: #3e3e42;
    color: #ccc;
    border: 1px solid #555;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 0.8rem;
    border-radius: 3px;
  }

  .buy-controls button.active {
    background-color: #007acc;
    color: #fff;
    border-color: #007acc;
  }

  .upgrade-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .category-section {
    margin-bottom: 10px;
  }

  .category-header {
    width: 100%;
    text-align: left;
    background-color: #333;
    color: #fff;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 4px;
  }

  .category-header:hover {
    background-color: #3e3e42;
  }

  .arrow {
    font-size: 0.8rem;
    width: 15px;
  }

  .category-items {
    padding: 5px 0;
  }

  .upgrade-item {
    background-color: #2d2d2d;
    border: 1px solid #3e3e42;
    padding: 10px;
    margin-top: 5px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .info {
    flex: 1;
  }

  .info h3 {
    margin: 0 0 5px 0;
    font-size: 0.95rem;
    color: #d4d4d4;
  }

  .details {
    display: flex;
    flex-direction: column;
    font-size: 0.8rem;
    color: #9cdcfe;
  }

  .level {
    color: #ce9178;
    margin-bottom: 2px;
  }

  .buy-btn {
    background-color: #4caf50;
    color: #fff;
    border: none;
    padding: 8px 12px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.85rem;
    min-width: 100px;
    text-align: center;
    line-height: 1.2;
  }

  .buy-btn:hover:not(:disabled) {
    background-color: #45a049;
  }

  .buy-btn:disabled {
    background-color: #3e3e42;
    color: #666;
    cursor: not-allowed;
  }
</style>
