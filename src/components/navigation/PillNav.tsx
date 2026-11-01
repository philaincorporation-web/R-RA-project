
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import "../PillNav.css";

export interface PillNavItem {
  href: string;
  label: string;
  ariaLabel?: string;
}

interface PillNavProps {
  logo: string;
  logoAlt?: string;
  logoHref: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  initialLoadAnimation?: boolean;
}

export default function PillNav({
  logo,
  logoAlt = "Logo",
  logoHref,
  items,
  activeHref,
  className = "",
  ease = "power3.out",
  baseColor = "#0D2B45",
  pillColor = "#F2F6F8",
  hoveredPillTextColor = "#FFFFFF",
  pillTextColor,
  initialLoadAnimation = true,
}: PillNavProps) {
  const resolvedPillTextColor = pillTextColor ?? baseColor;

  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;

        const delta =
          Math.ceil(
            R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))
          ) + 1;

        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const hoverLabel =
          pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) {
          gsap.set(label, { y: 0 });
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, {
            y: h + 12,
            opacity: 0,
          });
        }

        timelineRefs.current[index]?.kill();

        const timeline = gsap.timeline({
          paused: true,
        });

        timeline.to(
          circle,
          {
            scale: 1.2,
            xPercent: -50,
            duration: 2,
            ease,
            overwrite: "auto",
          },
          0
        );

        if (label) {
          timeline.to(
            label,
            {
              y: -(h + 8),
              duration: 2,
              ease,
              overwrite: "auto",
            },
            0
          );
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, {
            y: Math.ceil(h + 100),
            opacity: 0,
          });

          timeline.to(
            hoverLabel,
            {
              y: 0,
              opacity: 1,
              duration: 2,
              ease,
              overwrite: "auto",
            },
            0
          );
        }

        timelineRefs.current[index] = timeline;
      });
    };

    layout();

    const onResize = () => {
      layout();
    };

    window.addEventListener("resize", onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, {
          scale: 0,
        });

        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease,
        });
      }

      if (navItems) {
        gsap.set(navItems, {
          width: 0,
          overflow: "hidden",
        });

        gsap.to(navItems, {
          width: "auto",
          duration: 0.6,
          ease,
        });
      }
    }

    return () => {
      window.removeEventListener("resize", onResize);

      timelineRefs.current.forEach((timeline) => {
        timeline?.kill();
      });

      activeTweenRefs.current.forEach((tween) => {
        tween?.kill();
      });

      logoTweenRef.current?.kill();
    };
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (index: number) => {
    const timeline = timelineRefs.current[index];

    if (!timeline) return;

    activeTweenRefs.current[index]?.kill();

    activeTweenRefs.current[index] = timeline.tweenTo(
      timeline.duration(),
      {
        duration: 0.3,
        ease,
        overwrite: "auto",
      }
    );
  };

  const handleLeave = (index: number) => {
    const timeline = timelineRefs.current[index];

    if (!timeline) return;

    activeTweenRefs.current[index]?.kill();

    activeTweenRefs.current[index] = timeline.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const image = logoImgRef.current;

    if (!image) return;

    logoTweenRef.current?.kill();

    gsap.set(image, {
      rotate: 0,
    });

    logoTweenRef.current = gsap.to(image, {
      rotate: 360,
      duration: 0.5,
      ease,
      overwrite: "auto",
    });
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": resolvedPillTextColor,
  } as React.CSSProperties;

  return (
    <div className={`pill-nav-container ${className}`}>
      <nav
        className="pill-nav"
        aria-label="Primary navigation"
        style={cssVars}
      >
        <Link
          href={logoHref}
          className="pill-logo"
          aria-label="Accueil"
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
        >
          <img
            src={logo}
            alt={logoAlt}
            ref={logoImgRef}
          />
        </Link>

        <div
          className="pill-nav-items desktop-only"
          ref={navItemsRef}
        >
          <ul
            className="pill-list"
            role="menubar"
          >
            {items.map((item, index) => {
              const isActive = activeHref === item.href;

              return (
                <li
                  key={item.href}
                  role="none"
                >
                  <Link
                    href={item.href}
                    role="menuitem"
                    aria-label={item.ariaLabel || item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`pill${
                      isActive ? " is-active" : ""
                    }`}
                    onMouseEnter={() => handleEnter(index)}
                    onMouseLeave={() => handleLeave(index)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={(element) => {
                        circleRefs.current[index] = element;
                      }}
                    />

                    <span className="label-stack">
                      <span className="pill-label">
                        {item.label}
                      </span>

                      <span
                        className="pill-label-hover"
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}

