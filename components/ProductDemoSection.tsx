'use client';

import React, {useState, useEffect} from 'react';
import {Volume, Pause, Spark} from './Icons';

interface DemoScenario {
  id: string;
  icon: string;
  category: string;
  title: string;
  userPrompt: string;
  companionReply: string;
  voiceNote: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'bedtime',
    icon: '🌙',
    category: 'Bedtime Routine',
    title: 'Soothing Bedtime Story',
    userPrompt: 'Can you tell me a bedtime story about a sleepy little cloud?',
    companionReply:
      'Once upon a twilight sky, a fluffy little cloud named Cirro was floating gently over misty pine forests. As the moon lit up the starry valley, Cirro tucked into a soft, warm breeze, closed his sleepy eyes, and drifted into the sweetest dreams.',
    voiceNote: 'Calm, gentle pacing to help children relax and fall asleep naturally.'
  },
  {
    id: 'science',
    icon: '🚀',
    category: 'Curiosity & STEM',
    title: 'Why Do Stars Twinkle?',
    userPrompt: 'Why do stars twinkle in the night sky?',
    companionReply:
      'That is such a wonderful question! Stars look like they twinkle because their light travels across billions of miles, and when it enters Earth’s atmosphere, moving air gently bends the starlight before it reaches your eyes.',
    voiceNote: 'Encouraging tone that validates curiosity and simplifies complex ideas.'
  },
  {
    id: 'languages',
    icon: '🗣️',
    category: 'Multilingual Learning',
    title: 'Practicing Spanish & French',
    userPrompt: 'How do you say "I love you" in Spanish and French?',
    companionReply:
      'In Spanish, we say "¡Te quiero!" or "¡Te amo!". And in French, it is "Je t’aime!". Both mean you hold someone very dear. Would you like to repeat them with me?',
    voiceNote: 'Clear articulation with natural multilingual phonetics.'
  },
  {
    id: 'emotional',
    icon: '💛',
    category: 'Emotional Wellness',
    title: 'Comfort After a Hard Day',
    userPrompt: 'I made a mistake in class today and felt really sad.',
    companionReply:
      'It is completely okay to make mistakes—that is actually how our brains learn and become stronger! Take a deep, gentle breath with me. I am so proud of you for trying your best, and tomorrow is a brand new adventure.',
    voiceNote: 'Empathetic, soothing guidance without judgment or pressure.'
  },
  {
    id: 'riddle',
    icon: '🧩',
    category: 'Play & Imagination',
    title: 'Fun Riddles & Jokes',
    userPrompt: 'Can you tell me a funny riddle?',
    companionReply:
      'Here is one of my favorites: What has hands, but can never clap? ... A clock! Haha! Did that tickle your funny bone? Ask me for another whenever you are ready!',
    voiceNote: 'Playful inflection that sparks creative thinking and laughter.'
  }
];

export default function ProductDemoSection({
  productTitle = 'PlayNex Companion'
}: {
  productTitle?: string;
}) {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSupported, setAudioSupported] = useState(false);
  const [pawPressed, setPawPressed] = useState(false);

  useEffect(() => {
    setAudioSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSelectScenario = (scenario: DemoScenario) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setSelectedScenario(scenario);
  };

  const handleTogglePlay = () => {
    if (!audioSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(selectedScenario.companionReply);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    // Try finding a friendly English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleSimulatePawPress = () => {
    setPawPressed(true);
    setTimeout(() => {
      setPawPressed(false);
      handleTogglePlay();
    }, 400);
  };

  return (
    <section id="demo" className="product-demo-section wrap" aria-labelledby="product-demo-heading">
      {/* Editorial Header */}
      <div className="product-demo-header">
        <span className="micro-label">LIVE INTERACTIVE DEMO</span>
        <h2 id="product-demo-heading">
          Hear it in action: <em>conversations that feel real.</em>
        </h2>
        <p className="product-demo-sub">
          Experience how {productTitle} listens, understands context, and replies with warmth. Tap any
          scenario below, click <strong>Listen to Voice</strong>, or press the interactive paw.
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="product-demo-stage">
        {/* Left Column: Scenario Switcher */}
        <div className="demo-scenario-picker" role="tablist" aria-label="Demo scenarios">
          <div className="scenario-picker-intro">
            <span className="scenario-intro-dot" />
            <span>Select a conversation mode:</span>
          </div>

          {DEMO_SCENARIOS.map((s) => {
            const isSelected = s.id === selectedScenario.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`scenario-card-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectScenario(s)}
              >
                <span className="scenario-card-icon">{s.icon}</span>
                <div className="scenario-card-text">
                  <span className="scenario-card-cat">{s.category}</span>
                  <strong>{s.title}</strong>
                </div>
                <span className="scenario-card-arrow">{isSelected ? '●' : '›'}</span>
              </button>
            );
          })}

          {/* Zero Screen Notice */}
          <div className="demo-zero-screen-badge">
            <Spark size={16} />
            <span>100% Screen-Free Voice Interaction</span>
          </div>
        </div>

        {/* Right Column: Live Conversation Dialogue Simulator */}
        <div className="demo-dialogue-viewer">
          {/* Top Status Bar */}
          <div className="demo-viewer-topbar">
            <div className="demo-viewer-companion-info">
              <span className="demo-avatar-glow">🧸</span>
              <div>
                <strong>{productTitle}</strong>
                <span className="demo-online-tag">
                  <span className="online-dot" /> AI Core Connected · Ready
                </span>
              </div>
            </div>

            {/* Audio Waveform Animation */}
            <div
              className={`demo-waveform-container ${isPlaying ? 'is-active' : ''}`}
              title={isPlaying ? 'Speaking now...' : 'Audio paused'}
            >
              {Array.from({length: 12}, (_, i) => (
                <i key={i} />
              ))}
            </div>
          </div>

          {/* Chat Bubble Thread */}
          <div className="demo-thread-container">
            {/* User message */}
            <div className="demo-bubble demo-bubble-user">
              <div className="bubble-header">
                <span className="bubble-role">YOU / CHILD</span>
                <span className="bubble-paw-hint">Hold paw & speak 🐾</span>
              </div>
              <p className="bubble-content">“{selectedScenario.userPrompt}”</p>
            </div>

            {/* Companion message */}
            <div className="demo-bubble demo-bubble-companion" key={selectedScenario.id}>
              <div className="bubble-header">
                <span className="bubble-role companion-role">PLAYNEX / LIVE RESPONSE</span>
                {isPlaying && <span className="bubble-speaking-badge">Speaking now 🔊</span>}
              </div>
              <p className="bubble-content">“{selectedScenario.companionReply}”</p>
              <div className="bubble-voice-note">
                <small>💡 {selectedScenario.voiceNote}</small>
              </div>
            </div>
          </div>

          {/* Action Bar: Voice playback & Paw Simulator */}
          <div className="demo-viewer-actions">
            <button
              type="button"
              className={`demo-listen-btn ${isPlaying ? 'playing' : ''}`}
              onClick={handleTogglePlay}
              disabled={!audioSupported}
              aria-label={isPlaying ? 'Stop listening to sample response' : 'Listen to sample voice response'}
            >
              {isPlaying ? <Pause size={17} /> : <Volume size={18} />}
              <span>{isPlaying ? 'Stop Voice' : 'Listen to Voice'}</span>
            </button>

            <button
              type="button"
              className={`demo-paw-simulator-btn ${pawPressed ? 'pressed' : ''}`}
              onClick={handleSimulatePawPress}
              title="Simulate pressing the paw button on the physical toy"
            >
              <span className="paw-emoji">🐾</span>
              <span>Press Paw to Talk</span>
            </button>
          </div>

          {/* Footer disclosure */}
          <div className="demo-viewer-footer">
            <span>
              ℹ️ Simulated dialogue with real speech audio using your browser&apos;s speech synthesizer. Physical toy
              features custom child-friendly tuned neural voice.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

