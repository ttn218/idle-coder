<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let codingPoints: number = 0;
  export let researchedTechs: string[] = [];

  const dispatch = createEventDispatcher();

  interface Tech {
    id: string;
    name: string;
    price: number;
    description: string;
  }

  const techs: Tech[] = [
    {
      id: 'loop',
      name: 'While Loop 발견',
      price: 1000,
      description: '키를 누르고 있으면 자동으로 입력됩니다 (초당 10회).'
    },
    {
      id: 'function',
      name: '함수(Function) 선언',
      price: 5000,
      description: '코드 재사용으로 인해 모든 상점 업그레이드 비용이 15% 감소합니다.'
    },
    {
      id: 'oop',
      name: '객체지향(OOP) 도입',
      price: 20000,
      description: '객체 관리를 통해 인턴(PPS)의 효율이 2배 증가합니다.'
    }
  ];

  function research(tech: Tech) {
    if (codingPoints >= tech.price && !researchedTechs.includes(tech.id)) {
      dispatch('research', { techId: tech.id, price: tech.price });
    }
  }
</script>

<div class="research-container">
  <h2>Research Lab</h2>
  
  {#each techs as tech}
    {@const isResearched = researchedTechs.includes(tech.id)}
    {@const canBuy = codingPoints >= tech.price}
    
    <div class="tech-item" class:researched={isResearched}>
      <div class="info">
        <h3>{tech.name}</h3>
        <p>{tech.description}</p>
      </div>
      <button 
        on:click={() => research(tech)} 
        disabled={!canBuy || isResearched}
      >
        {isResearched ? 'Researched' : `Research (${tech.price} pts)`}
      </button>
    </div>
  {/each}
</div>

<style>
  .research-container {
    background-color: #1a1a2e;
    border-left: 2px solid #444;
    padding: 20px;
    color: #fff;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
  }

  h2 {
    margin-top: 0;
    border-bottom: 1px solid #555;
    padding-bottom: 10px;
    margin-bottom: 20px;
    color: #00ffff;
    text-shadow: 0 0 5px #00ffff;
  }

  .tech-item {
    background-color: #2a2a3e;
    border: 1px solid #555;
    padding: 15px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
    transition: opacity 0.3s;
  }

  .tech-item.researched {
    opacity: 0.6;
    border-color: #00ffff;
  }

  .info h3 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
    color: #fff;
  }

  .info p {
    margin: 0;
    font-size: 0.9rem;
    color: #aaa;
  }

  button {
    background-color: #00ffff;
    color: #000;
    border: none;
    padding: 8px 12px;
    border-radius: 3px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #00cccc;
  }

  button:disabled {
    background-color: #555;
    color: #888;
    cursor: not-allowed;
  }
</style>
