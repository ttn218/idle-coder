<script lang="ts">
  import { activeUsers, capital, capitalMultiplier } from "../stores/game";
  import { GameController } from "../core/GameController";
  import { formatNumber } from "../lib/utils";
  
  $: canIPO = $activeUsers >= 1000000;
  $: capitalGain = canIPO ? Math.floor(Math.sqrt($activeUsers / 100000)) : 0;
  $: capitalEffect = $capitalMultiplier;
  
  function handleIPO() {
    GameController.triggerIPO();
  }
</script>

<div class="ipo-panel">
  <h2>IPO (기업 공개)</h2>
  
  {#if !canIPO}
    <div class="locked">
      <div class="lock-icon">🔒</div>
      <p>활성 유저 1,000,000명 필요</p>
      <p class="progress">현재: {formatNumber($activeUsers)} / 1M</p>
    </div>
  {:else}
    <div class="unlocked">
      <div class="info-section">
        <h3>현재 보유 자본금</h3>
        <div class="capital-display">
          <span class="amount">{$capital}</span>
          <span class="effect">효과: x{formatNumber(capitalEffect)} 전역 생산량</span>
        </div>
      </div>
      
      <div class="separator"></div>
      
      <div class="info-section">
        <h3>IPO 진행 시</h3>
        <div class="gain-display">
          <p>획득 자본금: <span class="highlight">+{capitalGain}</span></p>
          <p class="small">새 효과: x{formatNumber(1 + ($capital + capitalGain) * 9)}</p>
        </div>
        
        <div class="warning">
          <p>⚠️ 경고: 다음 항목이 초기화됩니다</p>
          <ul>
            <li>코딩 포인트, 업그레이드</li>
            <li>활성 유저, 마케팅 레벨</li>
            <li>연구 기술</li>
          </ul>
          <p class="preserved">✅ 보존: 업적, 자본금</p>
        </div>
        
        <button class="ipo-button" on:click={handleIPO}>
          기업 공개 (IPO)
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .ipo-panel {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .locked {
    text-align: center;
    padding: 60px 20px;
    background: #1a1a1a;
    border: 2px dashed #444;
    border-radius: 12px;
  }
  
  .lock-icon {
    font-size: 4em;
    margin-bottom: 20px;
  }
  
  .locked p {
    color: #888;
    margin: 10px 0;
  }
  
  .progress {
    font-size: 1.1em;
    color: #4a9eff !important;
  }
  
  .unlocked {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 20px;
  }
  
  .info-section {
    margin-bottom: 20px;
  }
  
  .info-section h3 {
    color: #ffd700;
    margin-bottom: 15px;
  }
  
  .capital-display {
    text-align: center;
    padding: 20px;
    background: #2a2a2a;
    border-radius: 8px;
  }
  
  .capital-display .amount {
    display: block;
    font-size: 3em;
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 10px;
  }
  
  .capital-display .effect {
    color: #4a9eff;
    font-size: 1.1em;
  }
  
  .separator {
    height: 2px;
    background: linear-gradient(90deg, transparent, #444, transparent);
    margin: 30px 0;
  }
  
  .gain-display {
    background: #2a2a2a;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .gain-display p {
    margin: 8px 0;
  }
  
  .highlight {
    color: #ffd700;
    font-size: 1.3em;
    font-weight: bold;
  }
  
  .small {
    font-size: 0.9em;
    color: #888;
  }
  
  .warning {
    background: #2a1a1a;
    border: 1px solid #ff6b6b;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .warning p {
    color: #ff6b6b;
    margin: 10px 0;
  }
  
  .warning ul {
    color: #ff9999;
    margin: 10px 0 10px 20px;
  }
  
  .preserved {
    color: #6bff6b !important;
  }
  
  .ipo-button {
    width: 100%;
    padding: 15px;
    font-size: 1.2em;
    font-weight: bold;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #000;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .ipo-button:hover {
    transform: scale(1.05);
  }
</style>
