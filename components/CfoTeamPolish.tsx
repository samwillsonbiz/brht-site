"use client";

import { useEffect } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";

function createExpandIcon() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("data-brht-expand", "true");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.9");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute(
    "class",
    "h-5 w-5 text-black/50 transition duration-200 group-hover:scale-110 group-hover:text-[#6f9f19]"
  );

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M15 3h6v6M21 3l-7 7M9 21H3v-6M3 21l7-7");
  svg.appendChild(path);

  return svg;
}

export default function CfoTeamPolish() {
  useEffect(() => {
    const polishPage = () => {
      const team = document.getElementById("team");

      if (team) {
        const heading = team.querySelector<HTMLHeadingElement>("h2");
        if (heading) {
          const lines = heading.querySelectorAll<HTMLSpanElement>("span");
          if (lines[0] && lines[0].textContent !== "Real people.") {
            lines[0].textContent = "Real people.";
          }
          if (lines[1] && lines[1].textContent !== "Serious results.") {
            lines[1].textContent = "Serious results.";
          }
        }

        const cards = Array.from(team.querySelectorAll<HTMLElement>("article"));
        const brennanCard = cards.find((card) => card.textContent?.includes("Brennan Roney"));
        const samCard = cards.find((card) => card.textContent?.includes("Sam Willson"));
        const steveCard = cards.find((card) => card.textContent?.includes("Steve Johnson"));

        if (brennanCard && samCard && steveCard) {
          const setHeadshot = (card: HTMLElement, src: string, alt: string) => {
            const wrap = card.firstElementChild as HTMLElement | null;
            const image = wrap?.querySelector<HTMLImageElement>("img");
            if (!image) return;

            if (image.src !== src) image.src = src;
            image.alt = alt;
            image.loading = "eager";
            image.decoding = "async";
            image.referrerPolicy = "no-referrer";
            image.className =
              "h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.025]";
          };

          setHeadshot(
            brennanCard,
            "https://plus.unsplash.com/premium_photo-1661374927471-24a90ebd5737?auto=format&fit=crop&crop=faces&q=82&w=1400&h=900",
            "Brennan Roney"
          );
          setHeadshot(
            samCard,
            "https://plus.unsplash.com/premium_photo-1682430259342-427ec43ebc38?auto=format&fit=crop&crop=faces&q=82&w=1400&h=900",
            "Sam Willson"
          );
          setHeadshot(
            steveCard,
            "https://plus.unsplash.com/premium_photo-1682431020001-f2499d8c1b61?auto=format&fit=crop&crop=faces&q=82&w=1400&h=900",
            "Steve Johnson"
          );

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

          const steveBody = steveCard.children[1] as HTMLElement | undefined;
          if (steveBody) {
            const role = steveBody.querySelector<HTMLElement>("p");
            if (role && role.textContent !== "Finance Systems & AI") {
              role.textContent = "Finance Systems & AI";
            }
            if (role) {
              role.className =
                "text-[10px] font-black uppercase tracking-[0.16em] text-[#658077]";
            }

            const name = steveBody.querySelector<HTMLElement>("h3");
            if (name && name.textContent !== "Steve Johnson") name.textContent = "Steve Johnson";

            const paragraphs = steveBody.querySelectorAll<HTMLElement>("p");
            const bio = paragraphs[1];
            const steveBio =
              "Technology and finance leader with 18+ years building modern reporting systems, automating finance workflows and connecting business data. Steve specializes in AI-enabled reporting, systems integration, dashboarding and scalable finance technology that helps leadership teams move faster with better information.";
            if (bio && bio.textContent !== steveBio) bio.textContent = steveBio;
            if (bio) bio.className = "mt-4 text-[13px] leading-6 text-[#617069]";

            const stats = steveBody.querySelector<HTMLElement>("div.grid.grid-cols-3");
            if (stats && stats.dataset.brhtTechStats !== "true") {
              stats.dataset.brhtTechStats = "true";
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

          // Keep all three stat rows pinned to the same bottom baseline.
          [brennanCard, samCard, steveCard].forEach((card) => {
            if (!card.className.includes("flex-col")) {
              card.className += " flex h-full flex-col";
            }

            const body = card.children[1] as HTMLElement | undefined;
            if (!body) return;
            body.className = "flex flex-1 flex-col p-7";

            const stats = body.querySelector<HTMLElement>("div.grid.grid-cols-3");
            if (stats) {
              stats.className =
                "mt-auto grid grid-cols-3 gap-2 border-t border-black/[0.06] pt-5";
            }
          });
        }

        team.querySelectorAll<HTMLParagraphElement>("p").forEach((paragraph) => {
          if (paragraph.textContent?.includes("AI-generated placeholder profile")) {
            paragraph.remove();
          }
        });
      }

      const services = document.getElementById("services");
      if (services) {
        // Remove all instructional "Click to open" pills; the expand glyph is enough.
        services.querySelectorAll<HTMLElement>("div").forEach((node) => {
          if (node.textContent?.trim().toLowerCase() === "click to open") {
            node.remove();
          }
        });

        const serviceButtons = Array.from(
          services.querySelectorAll<HTMLButtonElement>("button")
        );

        serviceButtons.forEach((button) => {
          const header = button.querySelector<HTMLElement>(
            "div.relative.flex.items-start.justify-between"
          );
          if (!header || header.querySelector("[data-brht-expand='true']")) return;

          const svgs = header.querySelectorAll("svg");
          if (svgs.length > 1) svgs[svgs.length - 1].remove();
          header.appendChild(createExpandIcon());
        });
      }

      // Hero dashboard: keep the advisory concept, but remove the AI branding/sparkle.
      const top = document.getElementById("top");
      if (top) {
        const labels = Array.from(top.querySelectorAll<HTMLElement>("span"));
        const insightsLabel = labels.find((node) =>
          ["BRHT AI Insights", "BRHT Insights"].includes(node.textContent?.trim() || "")
        );

        if (insightsLabel) {
          if (insightsLabel.textContent !== "BRHT Insights") {
            insightsLabel.textContent = "BRHT Insights";
          }
          const row = insightsLabel.parentElement?.parentElement;
          row?.querySelector("svg")?.remove();
        }
      }

      // Service popups can mount later, so remove only the sparkle next to CFO Insight.
      document.querySelectorAll<HTMLParagraphElement>("p").forEach((label) => {
        if (label.textContent?.trim() !== "CFO Insight") return;
        const row = label.parentElement;
        row?.querySelector("svg")?.remove();
      });
    };

    let scheduledFrame = 0;
    const schedulePolish = () => {
      if (scheduledFrame) return;
      scheduledFrame = window.requestAnimationFrame(() => {
        scheduledFrame = 0;
        polishPage();
      });
    };

    schedulePolish();
    const retry1 = window.setTimeout(schedulePolish, 250);
    const retry2 = window.setTimeout(schedulePolish, 900);

    const observer = new MutationObserver(schedulePolish);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (scheduledFrame) window.cancelAnimationFrame(scheduledFrame);
      window.clearTimeout(retry1);
      window.clearTimeout(retry2);
      observer.disconnect();
    };
  }, []);

  return null;
}
