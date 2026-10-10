import { Link } from "react-router-dom";

function Home() {
return ( <div className="home-page"> <section className="home-hero"> <div className="hero-content"> <span className="hero-badge">
EDUCATION • OPPORTUNITY • EMPOWERMENT </span>


      <h1>
        Your Dreams Deserve
        <span> Every Opportunity.</span>
      </h1>

      <p>
        Discover scholarship opportunities designed to help tribal
        students pursue their education with confidence. Find useful
        information and take the next step toward your future.
      </p>

      <div className="hero-buttons">
        <Link to="/scholarships" className="primary-button">
          Explore Scholarships →
        </Link>

        <Link to="/about" className="secondary-button">
          Learn About Us
        </Link>
      </div>

      <div className="hero-note">
        <span className="note-icon">✦</span>
        Helping students move closer to their educational goals.
      </div>
    </div>

    <div className="hero-visual">
      <div className="visual-circle">
        <div className="book-illustration">📚</div>
        <div className="cap-illustration">🎓</div>
        <div className="visual-caption">
          <strong>Learn. Grow. Achieve.</strong>
          <span>Your future starts with education.</span>
        </div>
      </div>

      <div className="floating-card floating-card-top">
        <span>✦</span>
        Find opportunities
      </div>

      <div className="floating-card floating-card-bottom">
        <span>✓</span>
        Plan your future
      </div>
    </div>
  </section>

  <section className="home-features">
    <div className="home-section-heading">
      <span className="eyebrow">YOUR EDUCATION JOURNEY</span>
      <h2>Everything starts with an opportunity</h2>
      <p>
        Find the information you need to take your next step.
      </p>
    </div>

    <div className="feature-grid">
      <article className="feature-card">
        <div className="feature-icon green-icon">🔎</div>
        <h3>Discover Scholarships</h3>
        <p>
          Explore scholarship opportunities based on your education
          level and interests.
        </p>
        <Link to="/scholarships">Explore options →</Link>
      </article>

      <article className="feature-card">
        <div className="feature-icon gold-icon">📋</div>
        <h3>Understand Eligibility</h3>
        <p>
          Learn about eligibility requirements and the information
          you should check before applying.
        </p>
        <Link to="/scholarships">View details →</Link>
      </article>

      <article className="feature-card">
        <div className="feature-icon blue-icon">🎯</div>
        <h3>Plan Your Future</h3>
        <p>
          Use scholarship information to plan your education and
          explore your next opportunities.
        </p>
        <Link to="/about">Know our purpose →</Link>
      </article>
    </div>
  </section>

  <section className="home-cta">
    <div>
      <span className="cta-label">TAKE THE NEXT STEP</span>
      <h2>Your educational journey matters.</h2>
      <p>
        Start exploring scholarship information and find opportunities
        that may support your goals.
      </p>
    </div>

    <Link to="/scholarships" className="cta-button">
      Find Scholarships →
    </Link>
  </section>
</div>


);
}

export default Home;
