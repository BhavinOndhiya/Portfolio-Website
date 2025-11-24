import React from "react";
import { useContent } from "../context/ContentContext";
import { getIconComponent, serviceIconMap } from "../utils/iconMap";

const Services = () => {
  const { content } = useContent();
  const services = content.services || [];

  return (
    <section className="service section" id="services">
      <div className="container">
        <div className="row">
          <div className="section-title padd-15">
            <h2>Services</h2>
          </div>
        </div>
        <div className="row">
          {services.length === 0 && (
            <div className="padd-15">
              <p>
                No services configured yet. Add one from the admin dashboard.
              </p>
            </div>
          )}
          {services.map((service) => {
            const Icon = getIconComponent(
              serviceIconMap,
              service.iconKey,
              "wallet"
            );
            return (
              <div key={service.id} className="service-item padd-15">
                <div className="service-item-inner">
                  <div className="icon">{Icon && <Icon />}</div>
                  <h4>{service.title}</h4>
                  <p>{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
