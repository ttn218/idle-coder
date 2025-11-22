<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Achievement } from '../types';

  export let achievement: Achievement | null = null;
</script>

{#if achievement}
  <div 
    class="notification" 
    in:fly="{{ y: 50, duration: 500 }}" 
    out:fade
  >
    <div class="icon">🏆</div>
    <div class="content">
      <div class="title">Achievement Unlocked!</div>
      <div class="name">{achievement.name}</div>
      <div class="desc">{achievement.description}</div>
    </div>
  </div>
{/if}

<style>
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #252526;
    border: 1px solid #ffd700;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    min-width: 300px;
  }

  .icon {
    font-size: 2rem;
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  .title {
    color: #ffd700;
    font-weight: bold;
    font-size: 0.8rem;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .name {
    color: #fff;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 2px;
  }

  .desc {
    color: #ccc;
    font-size: 0.9rem;
  }
</style>
