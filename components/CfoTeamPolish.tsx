"use client";

import { useEffect } from "react";

export default function CfoTeamPolish() {
  useEffect(() => {
    const polishTeam = () => {
      const team = document.getElementById("team");
      if (!team) return;

      // Keep the team headline short and consistent with the rest of the page.
      const heading = team.querySelector<HTMLHeadingElement>("h2");
      if (heading) {
        const lines = heading.querySelectorAll<HTMLSpanElement>("span");
        if (lines[0]) lines[0].textContent = "Real people.";
        if (lines[1]) lines[1].textContent = "Serious results.";
      }

      const cards = Array.from(team.querySelectorAll<HTMLElement>("article"));
      const brennanCard = cards.find((card) => card.textContent?.includes("Brennan Roney"));
      const samCard = cards.find((card) => card.textContent?.includes("Sam Willson"));
      const steveCard = cards.find((card) => card.textContent?.includes("Steve Johnson"));
      if (!brennanCard || !samCard || !steveCard) return;

      const setHeadshot = (card: HTMLElement, src: string, alt: string) => {
        const wrap = card.firstElementChild as HTMLElement | null;
        const image = wrap?.querySelector<HTMLImageElement>("img");
        if (!image) return;

        image.src = src;
        image.alt = alt;
        image.loading = "eager";
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        image.className =
          "h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.025]";
      };

      // Direct Unsplash CDN URLs are used here instead of the old proxy routes.
      // This avoids the image load failures we were seeing on Vercel.
      setHeadshot(
        brennanCard,
        "https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?auto=format&fit=crop&crop=faces&q=82&w=1400&h=900",
        "Brennan Roney"
      );
      setHeadshot(
        samCard,
        "https://images.unsplash.com/photo-1559718062-361155fad299?auto=format&fit=crop&crop=faces&q=82&w=1400&h=900",
        "Sam Willson"
      );
      setHeadshot(
        steveCard,
        "https://images.unsplash.com/photo-1560714759-60e6eb4e1db6?auto=format&fit=crop&crop=faces&q=82&w=1400&h=900",
        "Steve Johnson"
      );

      // Match the technology profile visually to the other two team cards.
      steveCard.className = brennanCard.className;

      const referenceImageWrap = brennanCard.firstElementChild as HTMLElement | null;
      const steveImageWrap = steveCard.firstElementChild as HTMLElement | null;
      if (referenceImageWrap && steveImageWrap) {
        steveImageWrap.className = referenceImageWrap.className;
        steveImageWrap.querySelectorAll("span").forEach((node) => node.remove());

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
            "Technology and finance leader with 18+ years building modern reporting systems, automating finance workflows and connecting business data. Steve specializes in AI-enabled reporting, systems integration, dashboarding and scalable finance technology that helps leadership teams move faster with better information.";
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
              <p class="text-[14px] font-black leading-5 text-[#1e7b69]">AI + Automation</p>
              <p class="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Enablement</p>
            </div>
            <div>
              <p class="text-[14px] font-black leading-5 text-[#1e7b69]">Systems + Data</p>
              <p class="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#7a8781]">Strategy</p>
            </div>
          `;
        }
      }

      team.querySelectorAll<HTMLParagraphElement>("p").forEach((paragraph) => {
        if (paragraph.textContent?.includes("AI-generated placeholder profile")) {
          paragraph.remove();
        }
      });
    };

    const frame = window.requestAnimationFrame(polishTeam);
    const retry1 = window.setTimeout(polishTeam, 300);
    const retry2 = window.setTimeout(polishTeam, 1000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(retry1);
      window.clearTimeout(retry2);
    };
  }, []);

  return null;
}
