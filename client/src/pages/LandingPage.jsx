import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing">
            {/* Hero */}
            <section className="hero">
                <div className="hero-blob hero-blob-1"></div>
                <div className="hero-blob hero-blob-2"></div>

                <div className="hero-content">
                    
                    <h1 className="hero-title">
                        Share moments.<br />
                        <span className="hero-highlight">Not with everyone.</span>
                    </h1>
                    <p className="hero-desc">
                        Tired of shouting into the void? Create private groups,
                        share reels with people who actually care, and keep your
                        memories where they belong — with your circle.
                    </p>
                    <div className="hero-actions">
                        <Link to="/signup" className="btn-primary">
                            Start sharing →
                        </Link>
                        <Link to="/login" className="btn-ghost">
                            I have an account
                        </Link>
                    </div>
                </div>

                {/* <div className="hero-visual">
                    <div className="phone-mockup">
                        <div className="phone-screen">
                            <div className="mock-header">
                                <div className="mock-avatar"></div>
                                <div className="mock-name">
                                    <div className="mock-line short"></div>
                                    <div className="mock-line tiny"></div>
                                </div>
                            </div>
                            <div className="mock-video">
                                <div className="play-icon">▶</div>
                            </div>
                            <div className="mock-actions">
                                <span>❤️ 24</span>
                                <span>💬 8</span>
                            </div>
                        </div>
                    </div>
                </div> */}
            </section>

            {/* Why section - intentionally asymmetric */}
            <section className="why-section">
                <div className="why-header">
                    <h2>Why we built this</h2>
                    <p>
                        To Share moments and some comedy reels with your circle, 
                        like family, friends, and work buddies.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card feature-big">
                        <div className="feature-icon">🔒</div>
                        <h3>Private by default</h3>
                        <p>
                            Create groups for family, college friends, work buddies —
                            whoever. Only members see what's shared. No random strangers,
                            no creepy suggestions.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎬</div>
                        <h3>Just reels</h3>
                        <p>
                            Short videos, that's it. New features coming soon
                        </p>
                    </div>

                    {/* <div className="feature-card">
                        <div className="feature-icon">🚫</div>
                        <h3>No algorithm</h3>
                        <p>
                            See posts chronologically. No AI deciding what's "relevant"
                            for you. Your friend posted? You'll see it.
                        </p>
                    </div> */}

                    <div className="feature-card feature-wide">
                        <div className="feature-icon">💬</div>
                        <h3>Actually talk to each other</h3>
                        <p>
                            Comment, react, share inside jokes. It's like a group chat
                            but with videos. The way it should be.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works - casual style */}
            <section className="how-section">
                <h2>Dead simple to start</h2>

                <div className="steps">
                    <div className="step">
                        <div className="step-num">1</div>
                        <div className="step-content">
                            <h4>Make an account</h4>
                            <p>Good to go in seconds.</p>
                        </div>
                    </div>

                    <div className="step-arrow">→</div>

                    <div className="step">
                        <div className="step-num">2</div>
                        <div className="step-content">
                            <h4>Create or join a group</h4>
                            <p>Start fresh or get invited to existing ones.</p>
                        </div>
                    </div>

                    <div className="step-arrow">→</div>

                    <div className="step">
                        <div className="step-num">3</div>
                        <div className="step-content">
                            <h4>Share stuff</h4>
                            <p>Upload reels. Watch your friends' reels.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-card">
                    <h2>Ready to share moments?</h2>
                    <p>Join folks who want to share moments.</p>
                    <Link to="/signup" className="btn-primary btn-large">
                        Create free account
                    </Link>
                    <span className="cta-note">No credit card. No catch. Just vibes.</span>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="footer-logo">📹 Reels Platform</span>
                        <p>Built for real connections.</p>
                    </div>
                    <div className="footer-links">
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign up</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>Made by Chirag Katkoriya</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
