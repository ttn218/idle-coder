<script lang="ts">
  import { marketingUpgrades } from "../stores/marketing";
  import { activeUsers, codingPoints } from "../stores/game";
  import { GameController } from "../core/GameController";
  import { formatNumber, getPrice, getSumPrice, getMaxBuyable } from "../lib/utils";
  
  let buyAmount = 1;
  
  // Group by category
  $: groupedMarketing = $marketingUpgrades.reduce((acc, upgrade) => {
    const category = upgrade.category || "Marketing";
    if (!acc[category]) acc[category] = [];
    acc[category].push(upgrade);
    return acc;
  }, {} as Record<string, typeof $marketingUpgrades>);
  
  // Calculate costs for display
  $: calculatedItems = Object.entries(groupedMarketing).reduce((acc, [category, items]) => {
    acc[category] = items.map(item => {
      let count = 0;
      let cost = 0;
      const currentLevel = item.level;
      
      if (buyAmount === -1) { // MAX mode
        count = getMaxBuyable(item.basePrice, currentLevel, $activeUsers);
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
  }, {} as Record<string, any[]>);
  
  function handleBuy(upgrade: any) {
    const quantity = buyAmount === -1 ? upgrade.buyCount : buyAmount;
    GameController.purchaseMarketing(upgrade.id, quantity);
  }
</script>

<div class="marketing-panel">
  <h2>마케팅 (Marketing)</h2>
  <p class="subtitle">활성 유저를 소비하여 영구 보너스를 획득하세요!</p>
  
  <div class="buy-controls">
    <button class:active={buyAmount === 1} on:click={() => buyAmount = 1}>x1</button>
    <button class:active={buyAmount === 10} on:click={() => buyAmount = 10}>x10</button>
    <button class:active={buyAmount === -1} on:click={() => buyAmount = -1}>MAX</button>
  </div>
  
  {#each Object.entries(calculatedItems) as [category, upgrades]}
    <div class="category-section">
      <h3>{category}</h3>
      <div class="upgrades-grid">
        {#each upgrades as upgrade}
          <div class="upgrade-card">
            <div class="upgrade-header">
              <span class="name">{upgrade.name}</span>
              <span class="level">Lv.{upgrade.level}</span>
            </div>
            <div class="description">{upgrade.description}</div>
            <div class="upgrade-footer">
              <span class="cost">
                💼 {formatNumber(upgrade.currentCost)} Users
              </span>
              <button 
                on:click={() => handleBuy(upgrade)}
                disabled={$activeUsers < upgrade.currentCost || upgrade.buyCount === 0}
              >
                Buy {buyAmount === -1 ? upgrade.buyCount : buyAmount}
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .marketing-panel {
    padding: 20px;
  }
  
  .subtitle {
    color: #888;
    margin-bottom: 20px;
  }
  
  .buy-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .buy-controls button {
    padding: 8px 16px;
    background: #2a2a2a;
    border: 1px solid #444;
    color: #fff;
    cursor: pointer;
  }
  
  .buy-controls button.active {
    background: #4a9eff;
    border-color: #6ab0ff;
  }
  
  .category-section {
    margin-bottom: 30px;
  }
  
  .category-section h3 {
    color: #ffd700;
    margin-bottom: 15px;
  }
  
  .upgrades-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 15px;
  }
  
  .upgrade-card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 15px;
  }
  
  .upgrade-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .name {
    font-weight: bold;
    color: #fff;
  }
  
  .level {
    color: #4a9eff;
    font-size: 0.9em;
  }
  
  .description {
    font-size: 0.85em;
    color: #aaa;
    margin-bottom: 12px;
  }
  
  .upgrade-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .cost {
    color: #ffd700;
    font-weight: bold;
  }
  
  .upgrade-footer button {
    padding: 6px 12px;
    background: #4a9eff;
    border: none;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .upgrade-footer button:disabled {
    background: #444;
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
