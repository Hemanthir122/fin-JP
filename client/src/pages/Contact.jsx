import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In production, send to backend
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="contact-page">
            <div className="page-header">
                <div className="container">
                    <h1 className="page-title">Contact Us</h1>
                    <p className="page-subtitle">
                        Have questions or feedback? We'd love to hear from you.
                        Get in touch with our team.
                    </p>
                </div>
            </div>

            <div className="container">
                <div className="contact-grid">
                    <div className="contact-form-section">
                        <div className="card contact-card">
                            <h2>Send us a Message</h2>
                            {submitted ? (
                                <div className="success-message">
                                    <h3>Thank you for your message!</h3>
                                    <p>We'll get back to you as soon as possible.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="label">Your Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="How can we help?"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="textarea"
                                            placeholder="Your message..."
                                            rows="5"
                                            required
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full">
                                        <Send size={18} />
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="contact-info-section">
                        <div className="card contact-info-card">
                            <h2>Get in Touch</h2>
                            <p className="contact-intro">
                                We're here to help and answer any questions you might have.
                                We look forward to hearing from you.
                            </p>

                            <div className="contact-methods">
                                <div className="contact-method">
                                    <div className="method-icon">
                                        <Mail size={24} />
                                    </div>
                                    <div className="method-info">
                                        <h4>Email Us</h4>
                                        <a href="mailto:contact@jobsconnect.com">technifyz@technifyz.online</a>
                                        <a href="mailto:support@jobsconnect.com">technifyz@technifyz.online</a>
                                    </div>
                                </div>

                                <div className="contact-method">
                                    <div className="method-icon">
                                        <Phone size={24} />
                                    </div>
                                    <div className="method-info">
                                        <h4>Call Us</h4>
                                        <a href="tel:+1234567890">Comming Soon</a>
                                        <span className="availability">Mon-Fri, 9AM-6PM IST</span>
                                    </div>
                                </div>

                                <div className="contact-method">
                                    <div className="method-icon">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="method-info">
                                        <h4>Visit Us</h4>
                                        <address>
                                            Bangalore, Karnataka, India
                                        </address>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
