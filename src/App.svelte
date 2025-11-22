<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { fade } from 'svelte/transition';
  import UpgradeShop from './components/UpgradeShop.svelte';
  import ResearchTree from './components/ResearchTree.svelte';
  import AchievementNotification from './components/AchievementNotification.svelte';
  
  // Import types and data
  import type { Upgrade, Tech, Achievement, GameState } from './types';
  import { shopItems } from './data/shopItems';
  import { researchItems } from './data/researchItems';
  import { achievements as initialAchievements } from './data/achievements';

  import { formatNumber } from './utils/format';

  // Import source code as raw strings
  import appSource from './App.svelte?raw';
  import shopSource from './components/UpgradeShop.svelte?raw';
  import researchSource from './components/ResearchTree.svelte?raw';

  let codingPoints: number = 0;
  let clickPower: number = 1;
  let pointsPerSecond: number = 0;
  let activeUsers: number = 0; // Prestige currency
  let researchedTechs: string[] = [];
  let achievements = initialAchievements; // Initialize with data
  let clickCount = 0; // Track manual clicks for achievements
  let displayCode: string = "";
  let snippetIndex: number = 0;
  let codeDisplayElement: HTMLElement;
  let autoClickInterval: number;
  let saveInterval: number;

  let showSaveMessage: boolean = false;

  let notificationQueue: Achievement[] = [];
  let currentNotification: Achievement | null = null;
  let showReleaseMessage: boolean = false;
  let gainedUsers: number = 0;
  let isKeyDown: boolean = false;
  let audioCtx: AudioContext;

  function playTypingSound() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Low frequency click/thud
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
    
    // Short burst
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  }

  let currentTab: 'upgrades' | 'research' | 'achievements' | 'system' = 'upgrades';

  // Prestige Multiplier: +10% per active user
  $: prestigeMultiplier = 1 + (activeUsers * 0.1);
  $: prestigeExponent = researchedTechs.includes('viral_marketing') ? 0.6 : 0.5; // Square root is 0.5
  $: pendingUsers = Math.floor(Math.pow(codingPoints / 1000, prestigeExponent));

  // Tech Multipliers Calculation
  $: techEffects = researchedTechs.reduce((acc, techId) => {
    const tech = researchItems.find((t: Tech) => t.id === techId);
    if (tech && tech.effect) {
      switch (tech.effect.type) {
        case 'loop':
          acc.autoClick = true;
          break;
        case 'function':
          acc.costDiscount *= (1 - (tech.effect.value || 0));
          break;
        case 'oop':
          // Default to double PPS if no value provided, otherwise use value as multiplier addend (e.g. 0.5 => 1.5x)
          acc.ppsMultiplier *= (tech.effect.value ? (1 + tech.effect.value) : 2);
          break;
      }
    }
    return acc;
  }, { clickMultiplier: 1, ppsMultiplier: 1, costDiscount: 1, autoClick: false });

  $: costMultiplier = techEffects.costDiscount;
  $: techPpsMultiplier = techEffects.ppsMultiplier;
  $: clickMultiplier = techEffects.clickMultiplier;

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

  // Initialize upgrades with data
  let upgrades: Upgrade[] = JSON.parse(JSON.stringify(shopItems));
  const initialUpgrades = JSON.parse(JSON.stringify(shopItems));

  // Combine sources and split into lines
  const codeSnippets: string[] = (appSource + "\n" + shopSource + "\n" + researchSource)
    .split('\n')
    .map(line => line + '\n'); // Add newline back for display

  function handleKeydown(event: KeyboardEvent) {
    // Prevent default behavior for spacebar to avoid scrolling
    if (event.code === 'Space') {
      event.preventDefault();
    }

    // Check if the key is a printable character or Enter/Space/Tab
    // We want to trigger on most typing keys
    if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      codingPoints += clickPower * prestigeMultiplier * clickMultiplier; // Use clickMultiplier here
      clickCount++;
      checkAchievements();
      
      // Play typing sound
      playTypingSound();

      // Add code to display
      const snippet = codeSnippets[snippetIndex % codeSnippets.length];
      displayCode += snippet; // Removed + "\n" because snippets already have it
      snippetIndex++;

      // Auto scroll to bottom
      if (codeDisplayElement) {
        setTimeout(() => {
          codeDisplayElement.scrollTop = codeDisplayElement.scrollHeight;
        }, 0);
      }
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    // The original loopTechInterval logic was tied to isKeyDown and removed from handleKeydown.
    // If autoClick is still desired on key hold, this function might need re-evaluation
    // or the autoClick logic needs to be re-integrated into handleKeydown with a different approach.
    // For now, based on the diff, this function becomes less relevant for auto-clicking.
  }

  // The original `click()` function is no longer called by `handleKeydown`.
  // If it's still needed for other purposes (e.g., a dedicated click button),
  // it should be called explicitly. For now, it's kept as is, but might be unused.
  function click() {
    codingPoints += clickPower * prestigeMultiplier * clickMultiplier;
    addCodeSnippet();
  }

  function addCodeSnippet() {
    displayCode += codeSnippets[snippetIndex];
    snippetIndex = (snippetIndex + 1) % codeSnippets.length;
  }
  
  afterUpdate(() => {
    if (codeDisplayElement) {
      codeDisplayElement.scrollTop = codeDisplayElement.scrollHeight;
    }
  });

  function checkAchievements() {
    const currentState: GameState = {
      codingPoints,
      clickCount,
      pointsPerSecond,
      upgrades,
      activeUsers,
      researchedTechs
    };

    achievements = achievements.map(ach => {
      if (!ach.unlocked && ach.condition(currentState)) {
        showNotification(ach);
        return { ...ach, unlocked: true };
      }
      return ach;
    });
  }

  function showNotification(achievement: Achievement) {
    notificationQueue = [...notificationQueue, achievement];
    processNotificationQueue();
  }

  function processNotificationQueue() {
    if (currentNotification || notificationQueue.length === 0) return;

    currentNotification = notificationQueue[0];
    notificationQueue = notificationQueue.slice(1);

    setTimeout(() => {
      currentNotification = null;
      setTimeout(processNotificationQueue, 500); // Wait a bit before showing next
    }, 3000); // Show for 3 seconds
  }

  function handleBuy(event: CustomEvent) {
    const { index, price, type, effectValue, amount } = event.detail;
    if (codingPoints >= price) {
      codingPoints -= price;
      if (type === 'click') {
        clickPower += effectValue;
      } else if (type === 'auto') {
        pointsPerSecond += effectValue;
      }
      upgrades[index].level += amount;
      upgrades = [...upgrades]; // Trigger reactivity
      checkAchievements(); // Check achievements after buying an upgrade
    }
  }

  function handleResearch(event: CustomEvent) {
    const { techId, price } = event.detail;
    const tech = researchItems.find((t: Tech) => t.id === techId);

    if (!tech) return;

    console.log(`Researching ${techId}: Price ${price}, Currency ${tech.currency}, ActiveUsers ${activeUsers}, Points ${codingPoints}`);

    if (tech.currency === 'users') {
      // Ensure price is treated as a number
      if (activeUsers >= Number(price)) {
        activeUsers -= Number(price);
        researchedTechs = [...researchedTechs, techId];
        console.log(`Research success: ${techId}`);
        checkAchievements(); // Check achievements after research
      } else {
        console.log(`Research failed: Not enough users`);
      }
    } else {
      if (codingPoints >= Number(price)) {
        codingPoints -= Number(price);
        researchedTechs = [...researchedTechs, techId];
        checkAchievements(); // Check achievements after research
      }
    }
  }

  function triggerRelease() {
    if (codingPoints < 10000) return;

    if (confirm(`서비스를 오픈하시겠습니까?\n현재 데이터를 초기화하고 ${formatNumber(pendingUsers)}명의 유저를 확보합니다.`)) {
      gainedUsers = pendingUsers;
      activeUsers += gainedUsers;
      
      // Reset game state
      codingPoints = 0;
      clickPower = 1;
      pointsPerSecond = 0;
      upgrades = JSON.parse(JSON.stringify(initialUpgrades));
      researchedTechs = []; // Reset research on prestige
      displayCode = "";
      snippetIndex = 0;
      clickCount = 0; // Reset click count on prestige
      achievements = initialAchievements; // Reset achievements on prestige

      saveGame();
      
      showReleaseMessage = true;
      setTimeout(() => {
        showReleaseMessage = false;
      }, 3000);
      checkAchievements(); // Check achievements after release
    }
  }

  function saveGame() {
    const saveData = {
      codingPoints,
      clickPower,
      pointsPerSecond,
      upgrades,
      activeUsers,
      researchedTechs,
      achievements: achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
      clickCount,
      lastSaveTime: Date.now()
    };
    localStorage.setItem('idleCoderSave', JSON.stringify(saveData));
    showSaveMessage = true;
    setTimeout(() => showSaveMessage = false, 2000);
  }

  function loadGame() {
    const saved = localStorage.getItem('idleCoderSave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        codingPoints = data.codingPoints || 0;
        clickPower = data.clickPower || 1;
        pointsPerSecond = data.pointsPerSecond || 0;
        activeUsers = data.activeUsers || 0;
        researchedTechs = data.researchedTechs || [];
        clickCount = data.clickCount || 0;
        
        // Restore upgrades with correct references
        if (data.upgrades) {
          upgrades = shopItems.map(initUpgrade => {
            const savedUpgrade = data.upgrades.find((u: any) => u.id === initUpgrade.id);
            // Ensure effectValue is preserved from initial definition if not explicitly saved or changed
            return savedUpgrade ? { ...initUpgrade, level: savedUpgrade.level } : initUpgrade;
          });
        }

        // Restore achievements
        if (data.achievements) {
          achievements = initialAchievements.map(initAch => {
            const savedAch = data.achievements.find((a: any) => a.id === initAch.id);
            return savedAch ? { ...initAch, unlocked: savedAch.unlocked } : initAch;
          });
        }

        // Offline progress
        if (data.lastSaveTime) {
          const now = Date.now();
          const timeDiff = (now - data.lastSaveTime) / 1000; // seconds
          if (timeDiff > 0 && pointsPerSecond > 0) {
            const offlinePoints = pointsPerSecond * timeDiff * prestigeMultiplier * techPpsMultiplier;
            codingPoints += offlinePoints;
            console.log(`Offline for ${timeDiff.toFixed(1)}s, gained ${offlinePoints.toFixed(0)} points`);
          }
        }
      } catch (e) {
        console.error("Failed to load save data", e);
      }
    }
  }

  function resetGame() {
    if (confirm("정말 초기화 하시겠습니까? 모든 진행 상황이 사라집니다.")) {
      localStorage.removeItem('idleCoderSave');
      location.reload();
    }
  }

  onMount(() => {
    loadGame();
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    
    autoClickInterval = setInterval(() => {
      if (pointsPerSecond > 0) {
        codingPoints += pointsPerSecond * prestigeMultiplier * techPpsMultiplier;
        checkAchievements();
      }
    }, 1000);

    saveInterval = setInterval(saveGame, 10000);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
      clearInterval(autoClickInterval);
      clearInterval(saveInterval);

    };
  });
</script>

<main>
  <div class="left-panel">
    <div class="status-bar">
      <h1>Coding Points: {formatNumber(codingPoints)}</h1>
      <div class="stats">
        <span>CPC: {formatNumber(clickPower * prestigeMultiplier * clickMultiplier)}</span>
        <span>PPS: {formatNumber(pointsPerSecond * prestigeMultiplier * techPpsMultiplier)}</span>
      </div>
      {#if activeUsers > 0}
        <div class="prestige-stats">
          Active Users: {formatNumber(activeUsers)} (Bonus: +{formatNumber(activeUsers * 10)}%)
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
        <UpgradeShop 
          {codingPoints} 
          {upgrades} 
          {costMultiplier}
          on:buy={handleBuy} 
        />
      {:else if currentTab === 'research'}
        <ResearchTree 
          {codingPoints} 
          {activeUsers}
          {researchedTechs} 
          techTree={researchItems}
          on:research={handleResearch} 
        />
      {:else if currentTab === 'achievements'}
        <div class="achievements-panel">
          <h2>Achievements</h2>
          <div class="achievements-list">
            {#each achievements as achievement}
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
            <p>Total Coding Points: {formatNumber(codingPoints)}</p>
            <p>Click Power (CPC): {formatNumber(clickPower * prestigeMultiplier * clickMultiplier)}</p>
            <p>Points Per Second (PPS): {formatNumber(pointsPerSecond * prestigeMultiplier * techPpsMultiplier)}</p>
            <p>Active Users: {formatNumber(activeUsers)}</p>
            <p>Prestige Bonus: +{formatNumber(activeUsers * 10)}%</p>
          </div>

          <div class="controls-group">
            {#if codingPoints >= 10000}
              <button class="release-btn" on:click={triggerRelease} title="Reset for +{formatNumber(pendingUsers)} Users">
                🚀 Service Release (Get {formatNumber(pendingUsers)} Users)
              </button>
            {:else}
              <button class="release-btn disabled" disabled>
                🚀 Service Release (Need 10,000 pts)
              </button>
            {/if}
            
            <div class="row">
              <button class="save-btn" on:click={saveGame}>Save Game</button>
              <button class="reset-btn" on:click={resetGame}>Reset Data</button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <AchievementNotification achievement={currentNotification} />
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
