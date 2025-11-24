import React from "react";
import { useContent } from "../context/ContentContext";
import { contactIconMap, getIconComponent } from "../utils/iconMap";

const Contact = () => {
  const { content } = useContent();
  const methods = content.contactMethods || [];

  const resolveValue = (method) => {
    if (method.type === "email") {
      return (
        <a href={`mailto:${method.value}`} rel="noopener noreferrer">
          {method.value}
        </a>
      );
    }
    if (method.type === "phone") {
      return (
        <a href={`tel:${method.value}`} rel="noopener noreferrer">
          {method.value}
        </a>
      );
    }
    if (method.type === "website") {
      return (
        <a href={method.value} target="_blank" rel="noopener noreferrer">
          {method.value}
        </a>
      );
    }
    return method.value;
  };

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div className="row">
          <div className="section-title padd-15">
            <h2>Contact Me</h2>
          </div>
        </div>
        <h3 className="contact-title padd-15">DO YOU HAVE ANY QUESTIONS?</h3>
        <h4 className="contact-sub-title padd-15">I'M AT YOUR SERVICES</h4>
        <div className="row">
          {methods.map((method) => {
            const Icon = getIconComponent(contactIconMap, method.type, "phone");
            return (
              <div key={method.id} className="contact-info-item padd-15">
                <div className="icon">{Icon && <Icon />}</div>
                <h4>{method.label}</h4>
                <p>{resolveValue(method)}</p>
              </div>
            );
          })}
        </div>
        <h3 className="contact-title padd-15">SEND ME AN EMAIL</h3>
        <h4 className="contact-sub-title padd-15">
          I'M VERY RESPONSIVE TO MESSAGES
        </h4>
        <form
          action="https://formsubmit.co/bhavinondhiya0@gmail.com"
          method="POST"
        >
          <div className="row">
            <div className="contact-form padd-15">
              <div className="row">
                <div className="form-item col-6 padd-15">
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Name"
                      required
                    />
                  </div>
                </div>
                <div className="form-item col-6 padd-15">
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="form-item col-12 padd-15">
                  <div className="form-group">
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="Subject"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="form-item col-12 padd-15">
                  <div className="form-group">
                    <textarea
                      name="message"
                      className="form-control"
                      placeholder="Message"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
              <input type="hidden" name="_captcha" value="false" />
              <div className="row">
                <div className="form-item col-12 padd-15">
                  <button
                    type="submit"
                    name="submit"
                    className="btn"
                    style={{ cursor: "pointer" }}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
