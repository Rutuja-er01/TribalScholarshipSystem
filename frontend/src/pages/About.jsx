
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About Tribal Scholarship System</h1>
        <p>
          Empowering tribal students through education,
          scholarship awareness, and equal opportunities.
        </p>
      </section>

      <section className="about-content">
        <div className="about-card">
          <h2>Who We Are</h2>
          <p>
            The Tribal Scholarship System is a platform
            designed to help tribal students discover
            scholarship opportunities and access useful
            educational information in one place.
          </p>
        </div>

        <div className="about-card">
          <h2>Our Mission</h2>
          <p>
            Our mission is to make scholarship information
            easier to find and understand, helping tribal
            students pursue their education with confidence.
          </p>
        </div>

        <div className="about-card">
          <h2>Our Vision</h2>
          <p>
            We aim to build a future where every tribal
            student can learn about available financial
            assistance and educational opportunities.
          </p>
        </div>
      </section>

      <section className="about-footer">
        <h2>Education for Everyone</h2>
        <p>
          Discover opportunities. Overcome barriers.
          Build a brighter future.
        </p>
      </section>
    </div>
  );
}

export default About;