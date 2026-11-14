import React, { useEffect, useRef } from 'react';
import { Users, Mic, CheckCircle2, Clock } from 'lucide-react';
import HealthButton from '../components/common/HealthButton';

const FEATURES = [
  {
    title: 'Beneficiary Management',
    description: 'Keep community health records organized in a single register.',
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: 'Voice Assisted Register',
    description: 'Capture household-visit observations through voice input.',
    icon: <Mic className="w-5 h-5" />,
  },
  {
    title: 'Visit Verification',
    description: 'Review captured details before confirming a visit record.',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    title: 'Follow-up Alerts',
    description: 'See follow-up and safety items in one place.',
    icon: <Clock className="w-5 h-5" />,
  },
];

export default function LandingPage({ onNavigate }) {
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = document.querySelectorAll('[data-reveal]');
    let observer;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -32px 0px' }
      );

      revealElements.forEach((element) => observer.observe(element));
    }

    let animationFrame = 0;
    const updateHeroImage = () => {
      if (reducedMotion || animationFrame) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        const hero = heroRef.current;
        const image = heroImageRef.current;
        if (!hero || !image) return;

        const bounds = hero.getBoundingClientRect();
        const progress = Math.min(
          1,
          Math.max(0, (window.innerHeight - bounds.bottom) / (window.innerHeight + bounds.height))
        );
        image.style.transform = `translate3d(0, ${-24 * progress}px, 0) scale(${1 + 0.025 * progress})`;
        image.style.filter = `blur(${3 * progress}px)`;
      });
    };

    if (!reducedMotion) {
      window.addEventListener('scroll', updateHeroImage, { passive: true });
      window.addEventListener('resize', updateHeroImage);
      updateHeroImage();
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', updateHeroImage);
      window.removeEventListener('resize', updateHeroImage);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="landing-page flex flex-col bg-health-offWhite">
      <section
        ref={heroRef}
        className="relative isolate min-h-[620px] overflow-hidden bg-health-darkNavy sm:min-h-[680px]"
      >
        <img
          ref={heroImageRef}
          src="/asha-hero.jpg"
          alt="ASHA worker conducting a household visit"
          className="absolute inset-0 h-full w-full object-cover object-[62%_42%] will-change-transform"
        />
        <div className="landing-hero-overlay absolute inset-0" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-12 sm:min-h-[680px] sm:px-8 lg:px-12">
          <div
            data-reveal
            className="landing-reveal w-full max-w-2xl rounded-2xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-health-darkNavy/10 backdrop-blur-md sm:p-10"
          >
            <img
              src="/asha-voicecare-logo.png"
              alt="ASHA VoiceCare"
              className="w-64 max-w-full h-auto object-contain mb-6"
            />
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-health-deepGreen">
              A community health field register
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-health-navy sm:text-4xl lg:text-5xl">
              Supporting ASHA workers at every household visit
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-health-charcoal sm:text-lg">
              Keep beneficiary records, capture visit observations by voice, and
              review follow-ups and safety alerts in one field register.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <HealthButton
                variant="primary"
                onClick={() => onNavigate('dashboard')}
                className="min-w-[9rem]"
              >
                Get Started
              </HealthButton>

              <HealthButton
                variant="secondary"
                onClick={() => onNavigate('beneficiaries')}
                className="min-w-[9rem]"
              >
                Learn More
              </HealthButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-health-offWhite px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="landing-reveal mb-9 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-health-deepGreen">
              Designed for field workflows
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-health-navy sm:text-3xl">
              Support for every step of a household visit
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                data-reveal
                className="landing-reveal landing-feature rounded-xl border border-health-cardBorder bg-white p-6 shadow-card-subtle transition-shadow hover:shadow-card-hover"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-health-lightMint text-health-deepGreen">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-health-navy">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-health-navyLight">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-health-cardBorder bg-white px-4 py-5 text-center text-xs text-health-navyLight">
        © {new Date().getFullYear()} ASHA VoiceCare · Community health field register · Demonstration prototype
        <br />
        Photo: Paula Bronstein / Getty Images / Images of Empowerment (CC BY-NC 4.0)
      </footer>
    </div>
  );
}
