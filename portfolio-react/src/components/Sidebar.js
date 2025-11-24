import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUser,
  FaList,
  FaBriefcase,
  FaComments,
  FaBlog,
  FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: "home", label: "Home", icon: FaHome, href: "#home" },
    { id: "about", label: "About", icon: FaUser, href: "#about" },
    { id: "services", label: "Services", icon: FaList, href: "#services" },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: FaBriefcase,
      href: "#portfolio",
    },
    { id: "contact", label: "Contact", icon: FaComments, href: "#contact" },
    {
      id: "blog",
      label: "Blog Site",
      icon: FaBlog,
      href: "https://blogbyte.vercel.app/",
      external: true,
    },
    { id: "admin", label: "Admin", icon: FaLock, route: "/admin" },
  ];

  const handleNavClick = (e, item) => {
    if (item.route) {
      e.preventDefault();
      navigate(item.route);
      if (window.innerWidth < 1200) {
        setIsOpen(false);
      }
      return;
    }
    if (item.external) {
      return; // Let external links work normally
    }
    e.preventDefault();
    setActiveSection(item.id);
    const targetElement = document.querySelector(item.href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
    if (window.innerWidth < 1200) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Update active section based on scroll
    const sections = document.querySelectorAll(".section");

    const updateActiveLink = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setActiveSection(sectionId);
        }
      });
    };

    const options = {
      root: null,
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(updateActiveLink, options);
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [setActiveSection]);

  return (
    <>
      <div className={`aside ${isOpen ? "open" : ""}`}>
        <div className="logo">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, { id: "home", href: "#home" })}
          >
            <span>B</span>havin
          </a>
        </div>
        <div
          className={`nav-toggler ${isOpen ? "open" : ""}`}
          onClick={toggleSidebar}
        >
          <span></span>
        </div>
        <ul className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <a
                  href={item.route || item.href}
                  className={activeSection === item.id ? "active" : ""}
                  onClick={(e) => handleNavClick(e, item)}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                >
                  <i>
                    <Icon />
                  </i>{" "}
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      {isOpen && (
        <div
          className="backdrop"
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9,
          }}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
