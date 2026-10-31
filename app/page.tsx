import type {Metadata} from 'next';
import Link from 'next/link';
import Image from 'next/image';
import CompanionVisual from '@/components/CompanionVisual';
import DemoPlayground from '@/components/DemoPlayground';
import {Arrow, ArrowUp, Spark, Heart, Wave, Shield} from '@/components/Icons';
import {Eyebrow, LinkButton, Marquee, BottomCTA} from '@/components/Shared';
import HomeCommerceShowcase from '@/components/HomeCommerceShowcase';
import {HomeFeeling} from '@/components/HomeImmersive';
import {HomeLetter, HomeVision} from '@/components/HomeSections';
import Perspectives from '@/components/Perspectives';
import {getPerspectives} from '@/lib/perspectives';
import StoryMotion from '@/components/StoryMotion';

export const metadata: Metadata = {alternates: {canonical: '/'}};

export default async function Home() {
  const perspectives = await getPerspectives();
  return (
    <main id="main">
      <StoryMotion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'PlayNex Interactive Technologies',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            logo: `${(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')}/images/playnex-original-logo.png`
          }).replace(/</g, '\\u003c')
        }}
      />
      <section className="hero-frame">
        <div className="hero-panel">
          <div className="hero-grain" />
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />
          <div className="hero-gridlines" />
          <div className="hero-layout wrap">
            <div className="hero-content">
              <Eyebrow light>THE NEXT CHAPTER OF INTERACTIVE CONNECTION</Eyebrow>
              <h1>
                Not just<br />
                something to hold.<br />
                <span>Something to<br />connect with.</span>
              </h1>
              <p>
                Meet PlayNex. A new vision for interactive items that invite conversation, spark curiosity, and make room for moments that matter. For every age. For everyday life.
              </p>
              <div className="hero-buttons">
                <LinkButton href="/shop">Explore the shop</LinkButton>
                <Link href="/discover" className="text-button light-text">
                  <span className="play-circle">✺</span> Dropshipped finds (Discover)
                </Link>
              </div>
              <div className="hero-micro">
                <span className="micropoint" /> HUMAN AT HEART <span className="micro-rule" /> RESEARCH IN MIND
              </div>
            </div>
            <div className="hero-art">
              <CompanionVisual />
              <div className="art-caption">VISUAL EXPLORATION / PLAYNEX TECHNOLOGIES</div>
            </div>
          </div>
          <div className="hero-rail wrap">
            <span>01 — MORE HUMAN MOMENTS</span>
            <div className="rail-line" />
            <span>CONNECT&nbsp; • &nbsp;INTERACT&nbsp; • &nbsp;THRIVE</span>
            <a href="#philosophy" aria-label="Scroll to philosophy" className="scroll-indicator">
              SCROLL TO EXPLORE ↓
            </a>
          </div>
        </div>
      </section>

      <div className="welcome-divider wrap">
        <p>THIS ISN’T ABOUT <s>MORE TECHNOLOGY.</s></p>
        <strong>It’s about more connection.</strong>
        <span>↘</span>
      </div>

      <HomeLetter />

      <section className="home-philosophy section wrap" id="philosophy">
        <div className="section-split" data-reveal>
          <div>
            <Eyebrow>01 / WHAT WE BELIEVE</Eyebrow>
            <h2>Technology should<br />feel a little more <em>human.</em></h2>
          </div>
          <p className="section-explainer">
            The best moments rarely ask for a screen. They begin with a conversation, a shared idea, or the simple feeling that someone is listening. We want technology to make more of those moments possible.
          </p>
        </div>
        <div className="belief-grid">
          <article data-reveal className="belief-card belief-dark">
            <span className="card-index">01 / LISTEN</span>
            <div className="belief-graphic chat-graphic">
              <span>How was your day?</span>
              <span>Tell me about it ✳</span>
            </div>
            <div className="belief-info">
              <h3>It starts with<br />a conversation.</h3>
              <p>A little exchange can open a world of possibilities.</p>
            </div>
            <span className="corner-arrow">↗</span>
          </article>
          <article data-reveal className="belief-card belief-aqua">
            <span className="card-index">02 / IMAGINE</span>
            <div className="belief-graphic imagination-graphic">
              <div className="imagination-core">✳</div>
              <span className="ring r1" />
              <span className="ring r2" />
              <span className="ring r3" />
            </div>
            <div className="belief-info">
              <h3>Curiosity has<br />no age limit.</h3>
              <p>Room for questions, stories and possibilities.</p>
            </div>
            <span className="corner-arrow">↗</span>
          </article>
          <article data-reveal className="belief-card belief-cream">
            <span className="card-index">03 / CONNECT</span>
            <div className="belief-graphic connection-graphic">
              <Heart size={78} />
              <i>✦</i>
              <i>✦</i>
            </div>
            <div className="belief-info">
              <h3>Small moments.<br />Real meaning.</h3>
              <p>Thoughtful experiences for everyday connection.</p>
            </div>
            <span className="corner-arrow">↗</span>
          </article>
        </div>
      </section>

      <section className="companion-spotlight">
        <div className="spotlight-layout wrap">
          <div className="spotlight-image" data-reveal>
            <div className="spotlight-soft">
              <CompanionVisual variant="peach" small cards={false} />
            </div>
            <span className="spotlight-tag">DESIGNED AROUND THE HUMAN EXPERIENCE</span>
          </div>
          <div className="spotlight-copy" data-reveal>
            <Eyebrow>02 / MORE THAN A PRODUCT</Eyebrow>
            <h2>Familiar in form.<br /><em>New in feeling.</em></h2>
            <p>
              Comforting to approach. Thoughtful in the way it responds. Designed to fit naturally into life — not interrupt it.
            </p>
            <div className="spotlight-points">
              <div>
                <span>01</span>
                <strong>Approachable by design</strong>
                <p>A warm, welcoming experience for every generation.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Conversation-led</strong>
                <p>Interactions built around language, imagination, and curiosity.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Grounded in purpose</strong>
                <p>Human needs guide what technology should do.</p>
              </div>
            </div>
            <Link href="/our-story" className="text-button">
              Discover our philosophy <Arrow size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-demo section">
        <div className="wrap">
          <div className="section-split" data-reveal>
            <div>
              <Eyebrow light>03 / EXPERIENCE THE IDEA</Eyebrow>
              <h2>A conversation<br />can begin <em>anywhere.</em></h2>
            </div>
            <p className="section-explainer">
              Not a technical demo. A feeling. Explore examples of the kinds of everyday exchanges that inspire us.
            </p>
          </div>
          <DemoPlayground />
        </div>
      </section>

      <Marquee />
      <Perspectives section={perspectives} />
      <HomeCommerceShowcase />

      <section className="concept-section section wrap">
        <div className="section-split" data-reveal>
          <div>
            <Eyebrow>04 / TWO WORLDS OF DISCOVERY</Eyebrow>
            <h2>Crafted by PlayNex.<br /><em>Curated for curiosity.</em></h2>
          </div>
          <div>
            <p className="section-explainer">
              Explore our store for official PlayNex items designed for human connection, or browse Discover for creative dropshipped innovations from makers worldwide.
            </p>
            <Link href="/shop" className="text-button">
              Explore PlayNex shop <Arrow size={18} />
            </Link>
          </div>
        </div>
        <div className="concept-cards">
          <Link href="/shop" className="concept-card concept-blue" data-reveal>
            <div className="concept-number">01 / PLAYNEX ORIGINALS<ArrowUp size={17} /></div>
            <div className="concept-art"><CompanionVisual variant="blue" small cards={false} /></div>
            <div className="concept-title">
              <span>OFFICIAL STORE</span>
              <h3>PlayNex Items</h3>
              <p>Official creations and tactile experiences designed for human connection.</p>
            </div>
          </Link>
          <Link href="/discover" className="concept-card concept-mint" data-reveal>
            <div className="concept-number">02 / PLAYNEX DISCOVER<ArrowUp size={17} /></div>
            <div className="concept-art"><CompanionVisual variant="mint" small cards={false} /></div>
            <div className="concept-title">
              <span>DROPSHIPPED FINDS</span>
              <h3>Discover Edit</h3>
              <p>Curated companion-style finds and playful technology from external makers.</p>
            </div>
          </Link>
          <Link href="/experience" className="concept-card concept-peach" data-reveal>
            <div className="concept-number">03 / CONVERSATION<ArrowUp size={17} /></div>
            <div className="concept-art"><CompanionVisual variant="peach" small cards={false} /></div>
            <div className="concept-title">
              <span>INTERACTIVE</span>
              <h3>Experience</h3>
              <p>Explore what a thoughtful, conversation-first exchange feels like.</p>
            </div>
          </Link>
        </div>
      </section>

      <HomeFeeling />

      <section className="research-feature" data-reveal>
        <div className="research-feature-inner wrap">
          <div className="research-copy">
            <Eyebrow light>05 / THE THINKING BEHIND IT</Eyebrow>
            <h2>Warm in nature.<br /><em>Rigorous in thinking.</em></h2>
            <p>
              Meaningful companionship asks for both imagination and care. Our approach starts with people, builds through research, and stays thoughtful about what technology should — and shouldn’t — do.
            </p>
            <Link href="/technology" className="button button-white">
              Explore the technology <Arrow size={18} />
            </Link>
          </div>
          <div className="research-diagram">
            <div className="diagram-halo halo-1" />
            <div className="diagram-halo halo-2" />
            <div className="diagram-halo halo-3" />
            <div className="research-center">
              <Image src="/images/playnex-mark.png" width={160} height={160} alt="" />
            </div>
            <div className="research-chip rc-1"><Spark size={18} /> Human insight</div>
            <div className="research-chip rc-2"><Wave size={19} /> Responsive design</div>
            <div className="research-chip rc-3"><Shield size={18} /> Responsible thinking</div>
          </div>
        </div>
      </section>

      <section className="all-ages-section section wrap" data-reveal>
        <div className="age-header">
          <Eyebrow>06 / FOR EVERY GENERATION</Eyebrow>
          <h2>Because being human<br /><em>is for all of us.</em></h2>
          <p>
            For someone bursting with questions. For someone taking a moment to pause. For anyone who simply wants a little more connection.
          </p>
        </div>
        <div className="age-cards">
          <article>
            <span className="age-icon blue">✳</span>
            <h3>The dreamer</h3>
            <p>New worlds begin with a little imagination.</p>
          </article>
          <article>
            <span className="age-icon green">◌</span>
            <h3>The thinker</h3>
            <p>Every good question deserves room to grow.</p>
          </article>
          <article>
            <span className="age-icon gold">♡</span>
            <h3>The conversationalist</h3>
            <p>There is value in being heard, at every age.</p>
          </article>
        </div>
      </section>

      <HomeVision />
      <BottomCTA title="Something wonderful starts with a hello." />
    </main>
  );
}
