"use client";

import { useEffect } from "react";

export default function CfoTeamPolish() {
  useEffect(() => {
    const polishTeam = () => {
      const team = document.getElementById("team");
      if (!team) return;

      const cards = Array.from(team.querySelectorAll<HTMLElement>("article"));
      const referenceCard = cards.find((card) => card.textContent?.includes("Brennan Roney"));
      const steveCard = cards.find((card) => card.textContent?.includes("Steve Johnson"));
      if (!referenceCard || !steveCard) return;

      // Match the third profile visually to the two human-led profile cards.
      steveCard.className = referenceCard.className;

      const referenceImageWrap = referenceCard.firstElementChild as HTMLElement | null;
      const steveImageWrap = steveCard.firstElementChild as HTMLElement | null;
      if (referenceImageWrap && steveImageWrap) {
        steveImageWrap.className = referenceImageWrap.className;

        const image = steveImageWrap.querySelector<HTMLImageElement>("img");
        if (image) {
          image.alt = "Steve Johnson";
          image.className =
            "h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.025]";
        }

        // Remove the temporary placeholder badge.
        steveImageWrap
          .querySelectorAll("span")
          .forEach((node) => node.remove());

        const gradient = steveImageWrap.querySelector<HTMLElement>("div.absolute");
        if (gradient) {
          gradient.className =
            "absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b1513]/65 to-transparent";
        }
      }

      const body = steveCard.children[1] as HTMLElement | undefined;
      if (body) {
        body.className = "p-7";

        const role = body.querySelector<HTMLElement>("p");
        if (role) {
          role.textContent = "Finance Systems & AI";
          role.className =
            "text-[10px] font-black uppercase tracking-[0.16em] text-[#658077]";
        }

        const name = body.querySelector<HTMLElement>("h3");
        if (name) name.textContent = "Steve Johnson";

        const paragraphs = body.querySelectorAll<HTMLElement>("p");
        const bio = paragraphs[1];
        if (bio) {
          bio.textContent =
            "Technology and finance leader with 18+ years helping growing businesses modernize reporting, automate workflows and build scalable finance systems. Steve specializes in AI-enabled reporting, systems integration, dashboarding and turning operational data into faster, smarter decisions.";
          bio.className = "mt-4 text-[13px] leading-6 text-[#617069]";
        }

        const stats = body.querySelector<HTMLElement>("div.mt-6.grid");
        if (stats) {
          stats.className =
            "mt-6 grid grid-cols-3 gap-2 border-t border-black/[0.06] pt-5";
          stats.innerHTML = `
            <div>
              <p class="text-[18px] font-black text-[#1e7b69]">18+</p>
              <p class="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Years</p>
            </div>
            <div>
              <p class="text-[18px] font-black text-[#1e7b69]">AI + Automation</p>
              <p class="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Enablement</p>
            </div>
            <div>
              <p class="text-[18px] font-black text-[#1e7b69]">Systems + Data</p>
              <p class="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Strategy</p>
            </div>
          `;
        }
      }

      // Remove the temporary disclaimer beneath the team cards.
      team.querySelectorAll<HTMLParagraphElement>("p").forEach((paragraph) => {
        if (paragraph.textContent?.includes("AI-generated placeholder profile")) {
          paragraph.remove();
        }
      });
    };

    const frame = window.requestAnimationFrame(polishTeam);
    const observer = new MutationObserver(polishTeam);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
