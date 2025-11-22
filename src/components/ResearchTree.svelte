<script lang="ts">
  import { onMount } from 'svelte';
  import type { Tech } from '../types';
  import { formatNumber } from '../utils/format';
  import { researchItems } from '../data/researchItems';
  import { codingPoints, activeUsers } from '../stores/game';
  import { researchedTechs, research } from '../stores/research';

  // Props removed, using stores directly
  const techTree = researchItems;

  function handleResearch(tech: Tech) {
    research(tech.id);
  }

  function isLocked(tech: Tech): boolean {
    if (!tech.req) return false;
    return !$researchedTechs.includes(tech.req);
  }

  function isResearched(techId: string): boolean {
    return $researchedTechs.includes(techId);
  }

  function canAfford(tech: Tech): boolean {
    if (tech.currency === 'users') {
      return $activeUsers >= tech.cost;
    }
    return $codingPoints >= tech.cost;
  }

  function getLineColor(sourceTechId: string, targetTechId: string): string {
    const sourceResearched = isResearched(sourceTechId);
    const targetResearched = isResearched(targetTechId);
    
    if (targetResearched) return '#ffd700'; // Gold for completed path
    if (sourceResearched) return '#ffffff'; // White for available path
    return '#555555'; // Grey for locked path
  }
  
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  let viewport: HTMLDivElement;

  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    startX = event.clientX - translateX;
    startY = event.clientY - translateY;
    viewport.style.cursor = 'grabbing';
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;
    event.preventDefault();
    translateX = event.clientX - startX;
    translateY = event.clientY - startY;
  }

  function handleMouseUp() {
    isDragging = false;
    if (viewport) viewport.style.cursor = 'grab';
  }

  function handleMouseLeave() {
    isDragging = false;
    if (viewport) viewport.style.cursor = 'grab';
  }

  function handleKeyDown(event: KeyboardEvent) {
    const step = 50;
    if (event.key === 'ArrowLeft') {
      translateX += step;
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      translateX -= step;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      translateY += step;
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      translateY -= step;
      event.preventDefault();
    }
  }

  onMount(() => {
    // Center the view initially or set a good starting position
    // Assuming the tree starts around (400, 50), let's center horizontally
    if (viewport) {
      const viewportWidth = viewport.clientWidth;
      translateX = (viewportWidth - 800) / 2; // Center the 800px content
      translateY = 20; // Slight padding from top
    }
  });
</script>

<div class="research-container">
  <h2>Research Lab (Tech Tree)</h2>
  
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div 
    class="tech-tree-viewport" 
    bind:this={viewport}
    role="application"
    tabindex="0"
    aria-label="Research Tech Tree"
    on:keydown={handleKeyDown}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseLeave}
  >
    <div 
      class="tech-tree-content" 
      style="transform: translate({translateX}px, {translateY}px);"
    >
      <!-- Layer 1: SVG Lines -->
      <svg class="connections">
        {#each techTree as tech}
          {#if tech.req}
            {@const parent = techTree.find(t => t.id === tech.req)}
            {#if parent}
              <line 
                x1={parent.x + 25} 
                y1={parent.y + 25} 
                x2={tech.x + 25} 
                y2={tech.y + 25} 
                stroke={getLineColor(parent.id, tech.id)}
                stroke-width="2"
                stroke-dasharray={isResearched(parent.id) ? "0" : "5,5"}
              />
            {/if}
          {/if}
        {/each}
      </svg>

      <!-- Layer 2: Nodes -->
      {#each techTree as tech}
        {@const locked = isLocked(tech)}
        {@const researched = isResearched(tech.id)}
        {@const affordable = canAfford(tech)}
        
        <div 
          class="tech-node" 
          class:locked 
          class:researched 
          class:affordable={!locked && !researched && affordable}
          class:special={tech.currency === 'users'}
          style="left: {tech.x}px; top: {tech.y}px;"
          role="button"
          tabindex="0"
          aria-label={tech.name}
          on:click|stopPropagation={() => !locked && !researched && affordable && research(tech.id)}
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && !locked && !researched && affordable && research(tech.id)}
        >
          <!-- Icon or Symbol -->
          <div class="node-icon">
            {#if researched}
              ✓
            {:else if locked}
              🔒
            {:else}
              ⚡
            {/if}
          </div>

          <!-- Tooltip -->
          <div class="tooltip">
            <h3>{tech.name}</h3>
            <p class="cost">
              {formatNumber(tech.cost)} 
              {tech.currency === 'users' ? 'Active Users' : 'pts'}
            </p>
            <p class="desc">{tech.description}</p>
            {#if researched}
              <div class="status-badge">COMPLETED</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .research-container {
    padding: 20px;
    color: #fff;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  h2 {
    border-bottom: 1px solid #555;
    padding-bottom: 10px;
    margin-bottom: 20px;
    color: #4fc1ff;
    flex-shrink: 0;
  }

  .tech-tree-viewport {
    flex-grow: 1;
    overflow: hidden; /* Hide overflow, we use transform to move */
    position: relative;
    background-color: #1e1e1e;
    border: 1px solid #333;
    border-radius: 5px;
    cursor: grab;
  }

  .tech-tree-content {
    position: absolute; /* Changed to absolute for transform to work relative to viewport */
    top: 0;
    left: 0;
    width: 800px;
    height: 800px;
    transform-origin: 0 0;
    will-change: transform;
  }

  .connections {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .tech-node {
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: #252526;
    border: 2px solid #444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .tech-node:hover {
    z-index: 10; /* Bring to front on hover */
  }

  .tech-node.locked {
    background-color: #1e1e1e;
    border-color: #333;
    opacity: 0.7;
  }

  .tech-node.researched {
    border-color: #4fc1ff;
    background-color: #1e2a35;
    box-shadow: 0 0 10px rgba(79, 193, 255, 0.5);
  }

  .tech-node.affordable {
    border-color: #ffd700;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    cursor: pointer;
    animation: pulse 2s infinite;
  }

  .tech-node.special {
    border-color: #ff4081;
  }
  
  .tech-node.special.affordable {
    box-shadow: 0 0 15px rgba(255, 64, 129, 0.6);
  }

  .node-icon {
    font-size: 1.2rem;
    user-select: none;
  }

  /* Tooltip */
  .tooltip {
    visibility: hidden;
    width: 200px;
    background-color: #252526;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 10px;
    position: absolute;
    z-index: 1;
    bottom: 125%; /* Position above the node */
    left: 50%;
    margin-left: -100px;
    opacity: 0;
    transition: opacity 0.3s;
    border: 1px solid #4fc1ff;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    pointer-events: none; /* Prevent tooltip from interfering with mouse events */
  }

  .tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #4fc1ff transparent transparent transparent;
  }

  .tech-node:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }

  .tooltip h3 {
    margin: 0 0 5px 0;
    color: #9cdcfe;
    font-size: 1rem;
  }

  .tooltip .cost {
    color: #ffd700;
    font-weight: bold;
    margin: 5px 0;
  }
  
  .tech-node.special .tooltip .cost {
    color: #ff4081;
  }

  .tooltip .desc {
    margin: 0;
    color: #cccccc;
    font-size: 0.8rem;
  }

  .status-badge {
    color: #4fc1ff;
    font-weight: bold;
    display: block;
    margin-top: 5px;
    font-size: 0.8rem;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
</style>
