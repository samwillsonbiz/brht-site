"use client";

import { useId, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import s from "./HomePage.module.css";

export function AuditButton({
  label = "Book an operations audit",
}: {
  label?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <>
      <button className={s.primary} onClick={() => dialog.current?.showModal()}>
        {label}
        <ArrowUpRight size={17} aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        className={s.dialog}
        aria-labelledby={`${id}-title`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className={s.dialogInner}>
          <button
            className={s.close}
            aria-label="Close audit enquiry"
            onClick={() => dialog.current?.close()}
          >
            <X size={22} />
          </button>
          <span className={s.eyebrow}>LET’S MAP THE OPPORTUNITY</span>
          <h2 id={`${id}-title`}>Where does your business lose visibility?</h2>
          <p>
            Tell Sam about your systems, your reporting, and the work you want
            to take off your team’s plate.
          </p>
          <p>
            Start the conversation by email. We’ll arrange a time for an
            operations audit.
          </p>
          <a
            className={s.primary}
            href="mailto:samwillsonbiz@gmail.com?subject=BRHT%20operations%20audit&body=Hi%20Sam%2C%0A%0AMy%20business%3A%20%0ASystems%20we%20use%3A%20%0AWhat%20we%20want%20to%20improve%3A%20%0A%0ABest%20times%20to%20talk%3A%20"
          >
            Open email enquiry
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className={s.email} href="mailto:samwillsonbiz@gmail.com">
            samwillsonbiz@gmail.com
          </a>
          <small>
            Opens your email app. Nothing is submitted on this page.
          </small>
        </div>
      </dialog>
    </>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.mobileNav}>
      <button
        className={s.menuButton}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="marketing-mobile-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <nav
          id="marketing-mobile-nav"
          className={s.mobileLinks}
          aria-label="Mobile navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              event.currentTarget.parentElement
                ?.querySelector("button")
                ?.focus();
            }
          }}
        >
          {[
            ["The system", "#system"],
            ["Our work", "#proof"],
            ["Why BRHT", "#why-brht"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <a href={href} key={href} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
          <AuditButton />
        </nav>
      )}
    </div>
  );
}
