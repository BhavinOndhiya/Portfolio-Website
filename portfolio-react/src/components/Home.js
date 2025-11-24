import React, { useEffect, useMemo, useRef } from "react";
import Typed from "typed.js";
import bhavinImage from "../assets/bhavin.jpg";
import { useContent } from "../context/ContentContext";

const fallbackRoles = [
  "Software Developer",
  "Web Developer",
  "Backend Developer",
  "ML Enthusiast",
  "DSA Lover",
];

const Home = () => {
  const typedRef = useRef(null);
  const { content } = useContent();
  const hero = content.hero || {};

  const typedStrings = useMemo(() => {
    if (Array.isArray(hero.roles) && hero.roles.length > 0) {
      return hero.roles;
    }
    return fallbackRoles;
  }, [hero.roles]);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ["", ...typedStrings],
      typeSpeed: 100,
      backSpeed: 60,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, [typedStrings]);

  const handleDownloadCV = () => {
    const link = document.createElement("a");
    link.href = hero.resumeUrl || "/BhavinOndhiya-july-2025.pdf";
    link.download = "BhavinOndhiya-july-2025.pdf";
    link.click();
  };

  const handleHireMe = () => {
    const targetSelector = hero.hireMeTarget || "#contact";
    const contactSection = document.querySelector(targetSelector);
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const imageSource = hero.imageUrl || bhavinImage;

  return (
    <section className="home active section" id="home">
      <div className="container">
        <div className="row">
          <div className="home-info padd-15">
            <h3 className="hello">
              Hello, my name is{" "}
              <span className="name">{hero.name || "Bhavin Ondhiya"}</span>
            </h3>
            <h3 className="my-profession">
              I'm a <span className="typing" ref={typedRef}></span>
            </h3>
            <p>{hero.tagline || fallbackRoles.join(" | ")}</p>
            <a href="#!" className="btn" onClick={handleDownloadCV}>
              Download CV
            </a>
            <a href="#contact" className="btn hire-me" onClick={handleHireMe}>
              Hire Me
            </a>
          </div>
          <div className="home-img padd-15">
            <img src={imageSource} alt={hero.name || "Bhavin Ondhiya"} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
