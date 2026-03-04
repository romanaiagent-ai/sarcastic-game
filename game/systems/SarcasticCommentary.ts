export type CommentaryType = "death" | "hit" | "good" | "wave" | "idle";

export const DEATH_MESSAGES: string[] = [
  "Killed by a triangle. Outstanding.",
  "Your mom could do better. Probably.",
  "Game over. The enemies barely tried.",
  "You died. Shocking. Absolutely shocking.",
  "The enemies are writing home about this one.",
  "New record for fastest death. Go you.",
  "Error 404: skill not found.",
  "Even a potato could survive longer.",
  "The enemies feel bad for you. That's new.",
  "Achievement unlocked: Maximum Disappointment",
  "You have died of dysentery. Also incompetence.",
  "RIP. Stands for Really Incompetent Player.",
  "Death incoming in 3... 2... 1... there it is.",
  "The enemies have filed a complaint. Too easy.",
  "Somewhere, a game developer is crying.",
  "You played yourself. Literally.",
  "Not with a bang, but a whimper.",
  "The void stares back. It's disappointed.",
  "Critical error: player.skill not found.",
  "Insert coin to continue being bad.",
];

export const HIT_MESSAGES: string[] = [
  "Are you even trying?",
  "Did you MEAN to do that?",
  "They're not even aiming and you're still getting hit.",
  "Incredible. Truly.",
  "I've seen better dodging from a parked car.",
  "That one must have hurt. Your pride, I mean.",
  "The enemy is embarrassed for you.",
  "Plot twist: you are the bullet magnet.",
  "Skill issue detected.",
  "Have you considered just... not getting hit?",
  "Classic move. The 'stand in the bullets' strategy.",
];

export const GOOD_MESSAGES: string[] = [
  "Not terrible. For a beginner.",
  "You're getting better. Still bad, but better.",
  "Wave 5! Your future is bright. Sort of.",
  "Oh? Actual competence? Suspicious.",
  "Don't let it go to your head.",
  "That was almost impressive.",
  "Keep it up. (You won't.)",
];

export const WAVE_MESSAGES: Record<number, string> = {
  1: "Wave 1. Even your dog could do this.",
  2: "Wave 2. Still not impressed.",
  3: "Wave 3. The enemies are warming up. Are you?",
  4: "Wave 4. Getting spicy. You probably won't make it.",
  5: "Wave 5! Half of nothing is still nothing.",
  6: "Wave 6. OK, a little respect. Just a little.",
  7: "Wave 7. The enemies are sweating. Slightly.",
  8: "Wave 8. Now we're talking.",
  9: "Wave 9. You absolute madlad.",
  10: "WAVE 10! Fine. You're not THAT bad.",
};

export const IDLE_MESSAGES: string[] = [
  "Hello? Are you still there?",
  "The enemies are waiting. Patiently. Unlike me.",
  "Go on. Whenever you're ready. No rush.",
  "The game won't play itself. Unfortunately.",
];

export class SarcasticCommentary {
  private lastHitTime: number = 0;
  private hitCount: number = 0;
  private consecutiveHits: number = 0;

  getDeathMessage(): string {
    return this.random(DEATH_MESSAGES);
  }

  getHitMessage(): string {
    this.consecutiveHits++;
    this.hitCount++;
    if (this.consecutiveHits >= 3) {
      return "THREE HITS IN A ROW. Are you using your face to play?";
    }
    return this.random(HIT_MESSAGES);
  }

  getGoodMessage(): string {
    this.consecutiveHits = 0;
    return this.random(GOOD_MESSAGES);
  }

  getWaveMessage(wave: number): string {
    return WAVE_MESSAGES[wave] ?? `Wave ${wave}. Somehow still alive. Impressive.`;
  }

  getIdleMessage(): string {
    return this.random(IDLE_MESSAGES);
  }

  resetConsecutiveHits(): void {
    this.consecutiveHits = 0;
  }

  getTotalHits(): number {
    return this.hitCount;
  }

  private random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default SarcasticCommentary;
