"use client";

import { type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import FableFuryIntroPrototype from "@/components/fableFury/FableFuryIntroPrototype";
import { FABLE_HEROES, TOKEN_LABELS, type TokenKind } from "@/lib/fableFuryHeroes";

export const FABLE_BOOTSTRAP_KEY = "fablefury-solo-bootstrap-v1";

type BootstrapDraft = {
  heroId: string;
  token: TokenKind;
};

function tokenFromButton(text: string): TokenKind | null {
  const entries = Object.entries(TOKEN_LABELS) as Array<[TokenKind, string]>;
  return entries.find(([, label]) => text.toLowerCase().includes(label.toLowerCase()))?.[0] ?? null;
}

export default function FableFuryConnectedExperience() {
  const router = useRouter();

  function interceptStartingToken(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    const button = target?.closest("button");
    if (!button) return;

    const token = tokenFromButton(button.textContent ?? "");
    if (!token) return;

    const screenText = button.closest("main")?.textContent ?? document.body.textContent ?? "";
    const hero = FABLE_HEROES.find((candidate) => screenText.includes(candidate.name));
    if (!hero) return;

    // The cinematic selector has done its job. Stop its old prototype handler from
    // creating a second run and hand these choices to the real playable engine.
    event.preventDefault();
    event.stopPropagation();

    const bootstrap: BootstrapDraft = { heroId: hero.id, token };
    window.sessionStorage.setItem(FABLE_BOOTSTRAP_KEY, JSON.stringify(bootstrap));
    router.push("/fablefury/deckbuilder/run/play");
  }

  return (
    <div onClickCapture={interceptStartingToken}>
      <FableFuryIntroPrototype />
    </div>
  );
}
