import React from "react";
import { useContent } from "../context/ContentContext";

const Portfolio = () => {
  const { content } = useContent();
  const projects = content.portfolio || [];

  return (
    <section className="portfolio section" id="portfolio">
      <div className="container">
        <div className="row">
          {projects.length === 0 && (
            <div className="padd-15">
              <p>
                No portfolio projects yet. Add some from the admin dashboard.
              </p>
            </div>
          )}
          {projects.map((project, index) => {
            const imageSrc =
              project.imageUrl && project.imageUrl.length > 0
                ? project.imageUrl
                : `https://picsum.photos/seed/${project.id}/600/400`;
            return (
              <React.Fragment key={project.id}>
                <div className="section-title padd-15">
                  <h2>{project.category}</h2>
                </div>
                <div className="section-title padd-15">
                  <h3>
                    {index + 1}) {project.title}
                  </h3>
                </div>
                <div className="col-md-4 portfolio-item">
                  <div className="portfolio-item-inner shadow-dark">
                    <div className="portfolio-img">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={imageSrc} alt={project.title} />
                      </a>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
