<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { fade } from 'svelte/transition';
  import UpgradeShop from './components/UpgradeShop.svelte';
  import ResearchTree from './components/ResearchTree.svelte';
  import AchievementNotification from './components/AchievementNotification.svelte';
  
  // Import types and data
  import type { Upgrade, Tech, Achievement } from './types';
  import { researchItems } from './data/researchItems';

  import { formatNumber } from './lib/utils';
  import { GameController } from './core/GameController';

  // Import stores (only for UI binding)
  import { 
    codingPoints, 
    clickPower, 
    pointsPerSecond, 
    activeUsers, 
    prestigeMultiplier,
    prestigeBoost,
    prestigeExponent,
  } from './stores/game';
  import { researchedTechs } from './stores/research';
  import { achievements } from './stores/achievements';

  // Calculate tech effects for UI display (simplified)
  $: autoClickUnlocked = $researchedTechs.includes("loop");
  $: currentCostDiscount = 1; // TODO: Get from store if needed for display
  $: currentPpsMultiplier = 1; // TODO: Get from store
  $: currentClickMultiplier = 1; // TODO: Get from store

  // Tech Multipliers Calculation
  $: techEffects = $researchedTechs.reduce((acc, techId) => {
    const tech = researchItems.find((t: Tech) => t.id === techId);
    if (tech && tech.effects) {
      tech.effects.forEach(effect => {
        switch (effect.type) {
          case 'clickMultiplier':
            acc.clickMultiplier *= effect.value;
            break;
          case 'ppsMultiplier':
            acc.ppsMultiplier *= effect.value;
            break;
          case 'costDiscount':
            acc.costDiscount *= effect.value;
            break;
          case 'unlockFeature':
            // Handle feature unlock for UI if needed
            if (effect.value === 1) acc.autoClick = true; // Assuming value 1 is loop/autoClick
            break;
        }
      });
    }
    return acc;
  }, { clickMultiplier: 1, ppsMultiplier: 1, costDiscount: 1, autoClick: false });

  $: costMultiplier = techEffects.costDiscount;
  $: techPpsMultiplier = techEffects.ppsMultiplier;
  $: clickMultiplier = techEffects.clickMultiplier;

  // Import source code as raw strings
  import appSource from './App.svelte?raw';
  import shopSource from './components/UpgradeShop.svelte?raw';
  import researchSource from './components/ResearchTree.svelte?raw';

  let displayCode: string = "";
  let snippetIndex: number = 0;
  let codeDisplayElement: HTMLElement;

  let showSaveMessage: boolean = false;
  let showReleaseMessage: boolean = false;
  let gainedUsers: number = 0;

  // Derived values for UI
  $: pendingUsers = Math.floor(Math.pow($codingPoints / 1000, $prestigeExponent));

  // Syntax Highlighting
  $: formattedCode = displayCode
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(\/\/.*)|('.*?'|".*?")|\b(const|let|var|function|return|if|else|import|from|class|export)\b/g, (match, comment, string, keyword) => {
      if (comment) return `<span class="comment">${comment}</span>`;
      if (string) return `<span class="string">${string}</span>`;
      if (keyword) return `<span class="keyword">${keyword}</span>`;
      return match;
    });

  // Combine sources and split into lines
  const codeSnippets: string[] = (appSource + "\n" + shopSource + "\n" + researchSource)
    .split('\n')
    .map(line => line + '\n');

  let currentTab: 'upgrades' | 'research' | 'achievements' | 'system' = 'upgrades';

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      GameController.handleUserCodeInput();

      const snippet = codeSnippets[snippetIndex % codeSnippets.length];
      displayCode += snippet;
      snippetIndex++;

      if (codeDisplayElement) {
        setTimeout(() => {
          codeDisplayElement.scrollTop = codeDisplayElement.scrollHeight;
        }, 0);
      }
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    // Placeholder
  }
  
  afterUpdate(() => {
    if (codeDisplayElement) {
      codeDisplayElement.scrollTop = codeDisplayElement.scrollHeight;
    }
  });

  function triggerRelease() {
    const result = GameController.triggerPrestige();
    if (result !== null) {
      gainedUsers = result;
      displayCode = "";
      snippetIndex = 0;
      
      showReleaseMessage = true;
      setTimeout(() => {
        showReleaseMessage = false;
      }, 3000);
    }
  }

  function handleSave() {
    if (GameController.handleSave()) {
      showSaveMessage = true;
      setTimeout(() => showSaveMessage = false, 2000);
    }
  }

  function handleReset() {
    GameController.handleReset();
  }

  onMount(() => {
    GameController.startGameLoop();
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
      GameController.stopGameLoop();
    };
  });
</script>

<main>
  <div class="left-panel">
    <div class="status-bar">
      <h1>Coding Points: {formatNumber($codingPoints)}</h1>
      <div class="stats">
        <span>CPC: {formatNumber($clickPower * $prestigeMultiplier * clickMultiplier)}</span>
        <span>PPS: {formatNumber($pointsPerSecond * $prestigeMultiplier * techPpsMultiplier)}</span>
      </div>
      {#if $activeUsers > 0}
        <div class="prestige-stats">
          Active Users: {formatNumber($activeUsers)} 
          (Bonus: +{formatNumber(($prestigeMultiplier - 1) * 100)}%)
          <span class="research-boost" title="Research Boost">
            (x{formatNumber($prestigeBoost + 1)})
          </span>
        </div>
      {/if}
    </div>
    
    <pre 
      bind:this={codeDisplayElement} 
      class="code-display"
    >{@html formattedCode}</pre>
    
    {#if showSaveMessage}
      <div class="toast save-toast" transition:fade>Game Saved!</div>
    {/if}
    {#if showReleaseMessage}
      <div class="toast release-toast">
        🎉 Service Release Successful!<br>
        Acquired {formatNumber(gainedUsers)} Active Users!
      </div>
    {/if}
  </div>

  <div class="right-panel">
    <div class="tabs">
      <button 
        class:active={currentTab === 'upgrades'} 
        on:click={() => currentTab = 'upgrades'}
      >Upgrades</button>
      <button 
        class:active={currentTab === 'research'} 
        on:click={() => currentTab = 'research'}
      >Research</button>
      <button 
        class:active={currentTab === 'achievements'} 
        on:click={() => currentTab = 'achievements'}
      >Achievements</button>
      <button 
        class:active={currentTab === 'system'} 
        on:click={() => currentTab = 'system'}
      >System</button>
    </div>

    <div class="tab-content">
      {#if currentTab === 'upgrades'}
        <UpgradeShop />
      {:else if currentTab === 'research'}
        <ResearchTree />
      {:else if currentTab === 'achievements'}
        <div class="achievements-panel">
          <h2>Achievements</h2>
          <div class="achievements-list">
            {#each $achievements as achievement}
              <div class="achievement-item" class:unlocked={achievement.unlocked}>
                <div class="icon">{achievement.unlocked ? '🏆' : '🔒'}</div>
                <div class="info">
                  <div class="name">{achievement.name}</div>
                  <div class="desc">{achievement.description}</div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else if currentTab === 'system'}
        <div class="system-panel">
          <h2>System & Statistics</h2>
          
          <div class="stats-group">
            <p>Total Coding Points: {formatNumber($codingPoints)}</p>
            <p>Click Power (CPC): {formatNumber($clickPower * $prestigeMultiplier * clickMultiplier)}</p>
            <p>Points Per Second (PPS): {formatNumber($pointsPerSecond * $prestigeMultiplier * techPpsMultiplier)}</p>
            <p>Active Users: {formatNumber($activeUsers)}</p>
            <p>Prestige Bonus: +{formatNumber(($prestigeMultiplier - 1) * 100)}% (Research Boost: x{formatNumber($prestigeBoost + 1)})</p>
          </div>

          <div class="controls-group">
            {#if $codingPoints >= 10000}
              <button class="release-btn" on:click={triggerRelease} title="Reset for +{formatNumber(pendingUsers)} Users">
                🚀 Service Release (Get {formatNumber(pendingUsers)} Users)
              </button>
            {:else}
              <button class="release-btn disabled" disabled>
                🚀 Service Release (Need 10,000 pts)
              </button>
            {/if}
            
            <div class="row">
              <button class="save-btn" on:click={handleSave}>Save Game</button>
              <button class="reset-btn" on:click={handleReset}>Reset Data</button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <AchievementNotification />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #1e1e1e;
    color: #0f0;
    font-family: 'Courier New', Courier, monospace;
    overflow: hidden;
  }

  main {
    display: flex;
    height: 100vh;
    width: 100vw;
    box-sizing: border-box;
  }

  .left-panel {
    flex: 6;
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-right: 1px solid #333;
    position: relative;
    min-width: 0; /* Fix flex child overflow */
  }

  .status-bar {
    margin-bottom: 20px;
    text-align: center;
  }

  h1 {
    margin: 0 0 10px 0;
    text-shadow: 0 0 10px #0f0;
    font-size: 2rem;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 1.2rem;
    color: #88ff88;
  }

  .prestige-stats {
    margin-top: 5px;
    color: #ffd700;
    font-weight: bold;
    text-shadow: 0 0 5px #ffd700;
  }

  .code-display {
    flex: 1;
    background-color: #1e1e1e;
    color: #d4d4d4;
    border: 1px solid #333;
    padding: 10px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 1.1rem;
    overflow-y: auto;
    white-space: pre-wrap;
    margin: 0;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }

  /* Syntax Highlighting */
  :global(.keyword) { color: #c586c0; font-weight: bold; }
  :global(.string) { color: #ce9178; }
  :global(.comment) { color: #6a9955; }

  .right-panel {
    flex: 4;
    min-width: 350px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #252526;
    border-left: 1px solid #333;
  }

  .tabs {
    display: flex;
    background-color: #2d2d2d;
    border-bottom: 1px solid #333;
  }

  .tabs button {
    flex: 1;
    background: none;
    border: none;
    padding: 15px;
    color: #969696;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: background-color 0.2s, color 0.2s;
    border-right: 1px solid #333;
  }

  .tabs button:last-child {
    border-right: none;
  }

  .tabs button:hover {
    background-color: #3e3e42;
    color: #fff;
  }

  .tabs button.active {
    background-color: #1e1e1e;
    color: #fff;
    border-top: 2px solid #007acc;
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
    background-color: #1e1e1e;
  }

  .system-panel {
    padding: 20px;
    color: #fff;
  }

  .system-panel h2 {
    border-bottom: 1px solid #555;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  .stats-group p {
    margin: 10px 0;
    font-size: 1.1rem;
    color: #ccc;
  }

  .controls-group {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .row {
    display: flex;
    gap: 10px;
  }

  .save-btn {
    flex: 1;
    background-color: #0e639c;
    color: #fff;
    border: none;
    padding: 10px;
    cursor: pointer;
    border-radius: 3px;
  }

  .save-btn:hover {
    background-color: #1177bb;
  }

  .reset-btn {
    flex: 1;
    background-color: #330000;
    color: #ff4444;
    border: 1px solid #ff4444;
    padding: 10px;
    cursor: pointer;
    border-radius: 3px;
  }

  .reset-btn:hover {
    background-color: #550000;
  }

  .release-btn {
    width: 100%;
    background-color: #000;
    color: #ffd700;
    border: 2px solid #ffd700;
    padding: 15px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1.1rem;
    box-shadow: 0 0 10px #ffd700;
    animation: pulse 2s infinite;
    border-radius: 5px;
  }

  .release-btn:hover {
    background-color: #332b00;
  }

  .release-btn.disabled {
    background-color: #333;
    color: #666;
    border-color: #555;
    box-shadow: none;
    animation: none;
    cursor: not-allowed;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 10px #ffd700; }
    50% { box-shadow: 0 0 20px #ffd700; }
    100% { box-shadow: 0 0 10px #ffd700; }
  }

  .toast {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 20px;
    pointer-events: none;
    text-align: center;
    animation: fadeOut 3s forwards;
    z-index: 100;
  }

  .save-toast {
    bottom: 20px;
    background-color: rgba(0, 255, 0, 0.2);
    border: 1px solid #0f0;
    color: #0f0;
    animation: fadeOut 2s forwards;
  }

  .release-toast {
    top: 50%;
    background-color: rgba(255, 215, 0, 0.9);
    border: 2px solid #fff;
    color: #000;
    font-weight: bold;
    font-size: 1.5rem;
    box-shadow: 0 0 30px #ffd700;
  }

  @keyframes fadeOut {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }

  .achievements-panel {
    padding: 20px;
    color: #fff;
  }

  .achievements-panel h2 {
    border-bottom: 1px solid #555;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  .achievements-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .achievement-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background-color: #2d2d2d;
    border: 1px solid #333;
    border-radius: 5px;
    opacity: 0.5;
    transition: all 0.3s;
  }

  .achievement-item.unlocked {
    opacity: 1;
    background-color: #333;
    border-color: #ffd700;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.1);
  }

  .achievement-item .icon {
    font-size: 2rem;
  }

  .achievement-item .info {
    display: flex;
    flex-direction: column;
  }

  .achievement-item .name {
    font-weight: bold;
    font-size: 1.1rem;
    color: #fff;
  }

  .achievement-item.unlocked .name {
    color: #ffd700;
  }

  .achievement-item .desc {
    color: #aaa;
    font-size: 0.9rem;
  }
</style>
