import React, { useMemo } from "react";
import { FaCalendar } from "react-icons/fa";
import { useContent } from "../context/ContentContext";

const About = () => {
  const { content } = useContent();
  const personalInfo = content.personalInfo || [];
  const skills = content.skills || [];
  const education = content.education || [];
  const experience = content.experience || [];
  const aboutSummary =
    content.hero?.tagline ||
    "I'm enthusiastic about learning, exploring, and building impactful solutions.";

  const headline = useMemo(() => {
    if (content.hero?.name) {
      return `I'm ${content.hero.name}`;
    }
    return "I'm Bhavin Ondhiya";
  }, [content.hero?.name]);

  const handleHireMe = () => {
    const contactSection = document.querySelector("#contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="row">
          <div className="section-title padd-15">
            <h2>About Me</h2>
          </div>
        </div>
        <div className="row">
          <div className="about-content padd-15">
            <div className="row">
              <div className="about-text padd-15">
                <h3>
                  {headline} || <span>a Software Developer</span>
                </h3>
                <p>{aboutSummary}</p>
              </div>
            </div>
            <div className="row">
              <div className="personal-info padd-15">
                <div className="row">
                  {personalInfo.map((item) => (
                    <div key={item.id} className="info-item padd-15">
                      <p>
                        {item.label} : <span>{item.value}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="row">
                  <div className="buttons padd-15">
                    <a
                      href="#contact"
                      className="btn hire-me"
                      onClick={handleHireMe}
                    >
                      Hire Me
                    </a>
                  </div>
                </div>
              </div>
              <div className="skills padd-15">
                <div className="row">
                  {skills.map((skill) => (
                    <div key={skill.id} className="skill-item padd-15">
                      <h5>{skill.name}</h5>
                      <div className="progress">
                        <div
                          className="progress-in"
                          style={{ width: `${skill.percent}%` }}
                        ></div>
                        <div className="skill-percent">{skill.percent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="row education-section">
              <div className="section-title padd-15">
                <h2 className="title">Education</h2>
              </div>
              <div className="timeline-box padd-15">
                <div className="timeline shadow-dark">
                  {education.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <div className="circle-dot"></div>
                      <h3 className="timeline-date">
                        <FaCalendar /> {item.range}
                      </h3>
                      <h4 className="timeline-text">{item.title}</h4>
                      <p className="timeline-text">{item.details}</p>
                      {item.extra && (
                        <h4 className="timeline-text">{item.extra}</h4>
                      )}
                      {item.documentUrl && (
                        <a
                          className="attachment-link"
                          href={item.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Result Sheet
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="section-title padd-15">
                <h2 className="title">Experience</h2>
              </div>
              <div className="timeline-box padd-15">
                <div className="timeline shadow-dark">
                  {experience.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <div className="circle-dot"></div>
                      <h3 className="timeline-date">
                        <FaCalendar /> {item.range}
                      </h3>
                      <h4 className="timeline-text-company">
                        {item.company} - {item.location} ({item.mode})
                      </h4>
                      <h4 className="timeline-text">{item.title}</h4>
                      <p className="timeline-text">{item.details}</p>
                      {(item.certificateUrl || item.offerLetterUrl) && (
                        <div className="attachment-links">
                          {item.certificateUrl && (
                            <a
                              className="attachment-link"
                              href={item.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Certificate
                            </a>
                          )}
                          {item.offerLetterUrl && (
                            <a
                              className="attachment-link"
                              href={item.offerLetterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Offer Letter
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
